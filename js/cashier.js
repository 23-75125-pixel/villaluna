// ============================================================
//  SwiftPOS — Cashier (Branch-Aware + Mobile Responsive)
// ============================================================

let _cashierBranchId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuthAsync('cashier');
  if (!user) return;
  document.getElementById('cashier-name').textContent = user.fullname;
  const avatarEl = document.getElementById('cashier-avatar-letter');
  if (avatarEl) avatarEl.textContent = (user.fullname || 'C').charAt(0).toUpperCase();

  // Get this cashier's branch
  const users      = await DB.getUsers();
  const me         = users.find(u => u.id === user.id);
  _cashierBranchId = me?.branch_id || null;

  // Show branch name in topbar
  const branches = await DB.getBranches();
  const branch   = branches.find(b => b.id === _cashierBranchId);
  const roleEl = document.querySelector('.topbar-user-role');
  if (roleEl) roleEl.textContent = branch ? `Cashier — ${branch.name}` : 'Cashier';

  await getStockThreshold();
  await checkLowStock(_cashierBranchId);
  renderCatPills();
  renderPOSItems();
  renderCashierStats();
  renderRecentTransactions();
  renderNotifPanel();
  populateRequestItems();
  await loadStartingCash(user);

  setInterval(async () => {
    await checkLowStock(_cashierBranchId);
    renderNotifPanel();
  }, 30000);
});

// ── STATS ─────────────────────────────────────────────────────
async function renderCashierStats() {
  const user    = getCurrentUser();
  const sales   = await DB.getSales(_cashierBranchId);
  const today   = todayStr();
  const mySales = sales.filter(s => { const d = new Date(s.datetime); const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; return ds === today && s.cashier === user?.username; });

  const totalItems = mySales.reduce((s, x) => s + x.items.reduce((a, b) => a + b.qty, 0), 0);
  const cashCollected = mySales.reduce((s, x) => s + x.total, 0);

  document.getElementById('cashier-orders').textContent     = mySales.length;
  document.getElementById('cashier-sales').textContent      = formatCurrency(mySales.reduce((s,x) => s+x.total, 0));
  document.getElementById('cashier-items-sold').textContent = totalItems;
  document.getElementById('cashier-cash').textContent       = formatCurrency(cashCollected);
}

// ── RECENT TRANSACTIONS ───────────────────────────────────────
async function renderRecentTransactions() {
  const tbody = document.getElementById('recent-txn-body');
  if (!tbody) return;
  const user  = getCurrentUser();
  const sales = await DB.getSales(_cashierBranchId);
  const today = todayStr();
  const mine  = sales
    .filter(s => { const d = new Date(s.datetime); const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; return ds === today && s.cashier === user?.username; })
    .reverse()
    .slice(0, 10);

  if (!mine.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">No transactions yet today.</td></tr>`;
    return;
  }

  tbody.innerHTML = mine.map(s => {
    const disc = s.discount_type ? `<span class="discount-pill">${s.discount_type === 'senior' ? '👴 Senior' : '♿ PWD'}</span>` : '';
    return `
      <tr>
        <td class="txn-id-cell">${s.id.slice(0, 16)}…</td>
        <td style="white-space:nowrap;">${new Date(s.datetime).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',hour12:true})}</td>
        <td>${s.items.reduce((a,b)=>a+b.qty,0)} item(s)</td>
        <td>${disc || '—'}</td>
        <td class="txn-amount">${formatCurrency(s.total)}</td>
        <td style="display:flex;gap:5px;flex-wrap:wrap;">
          <button class="btn-xs" onclick='showReceipt(${JSON.stringify(s).replace(/'/g,"&#39;")})'>🖨 Reprint</button>
          <button class="btn-xs" onclick='showReceipt(${JSON.stringify(s).replace(/'/g,"&#39;")})'>👁 View</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── NOTIFICATION BELL ─────────────────────────────────────────
async function renderNotifPanel() {
  const list   = document.getElementById('notif-list');
  const badge  = document.getElementById('notif-badge');
  const label  = document.getElementById('notif-count-label');
  if (!list) return;

  const items  = await DB.getItems(_cashierBranchId);
  const low    = items.filter(i => i.stock > 0 && i.stock <= stockThreshold());
  const out    = items.filter(i => i.stock === 0);
  const total  = low.length + out.length;

  if (badge) {
    badge.textContent   = total;
    badge.style.display = total > 0 ? 'inline' : 'none';
  }
  if (label) label.textContent = total ? `${total} alert${total !== 1 ? 's' : ''}` : '';

  if (!total) {
    list.innerHTML = `<div class="notif-empty">No alerts right now ✅</div>`;
    return;
  }

  const outHTML = out.map(i => `
    <div class="notif-item">
      <span class="notif-icon">🚫</span>
      <div class="notif-text"><strong>${i.name}</strong>Out of stock — request a restock</div>
    </div>`).join('');

  const lowHTML = low.map(i => `
    <div class="notif-item">
      <span class="notif-icon">⚠️</span>
      <div class="notif-text"><strong>${i.name}</strong>Low stock — only ${i.stock} unit${i.stock !== 1 ? 's' : ''} left</div>
    </div>`).join('');

  list.innerHTML = outHTML + lowHTML;
}

function toggleNotifPanel(e) {
  e.stopPropagation();
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', () => {
  const panel = document.getElementById('notif-panel');
  if (panel) panel.style.display = 'none';
});

// ── REQUEST RESTOCK ───────────────────────────────────────────
async function populateRequestItems() {
  const sel = document.getElementById('req-item');
  if (!sel) return;
  const items = await DB.getItems(_cashierBranchId);
  sel.innerHTML = '<option value="">— Select Item —</option>' +
    items.map(i => `<option value="${i.id}">${i.emoji || '🏷️'} ${i.name} (stock: ${i.stock})</option>`).join('');
}

function openRequestModal() {
  populateRequestItems();
  document.getElementById('request-modal').style.display = 'flex';
}

function closeRequestModal() {
  document.getElementById('request-modal').style.display = 'none';
}

async function submitRequest() {
  const itemId = parseInt(document.getElementById('req-item').value);
  const note   = document.getElementById('req-note').value.trim();
  const user   = getCurrentUser();

  if (!itemId) { showToast('Please select an item.', 'error'); return; }

  const item = await DB.getItem(itemId);
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Send restock request?',
      text: `${item.name} will be sent as a pending request.`,
      icon: 'question',
      confirmButtonText: 'Send Request'
    });
    if (!proceed) return;
  }
  await DB.addRequest({
    itemId,
    itemName:        item.name,
    stock:           item.stock,
    type:            'manual-request',
    requestedBy:     user?.username || 'cashier',
    requestedByName: user?.fullname || 'Cashier',
    note:            note || 'Restock needed.',
    status:          'pending',
    datetime:        new Date().toISOString(),
    branchId:        _cashierBranchId
  });

  await logAudit('REQUEST_RESTOCK', 'Inventory',
    `Requested restock for "${item.name}" (current stock: ${item.stock}). Note: ${note || 'N/A'}`,
    { item_id: itemId, item_name: item.name, stock: item.stock });

  showToast('Restock request sent!', 'success');
  closeRequestModal();
  document.getElementById('req-note').value = '';
  renderNotifPanel();
}

// ── THREE-DOTS MENU ───────────────────────────────────────────
function toggleUserMenu(e) {
  e.stopPropagation();
  const dd = document.getElementById('user-dropdown');
  if (!dd) return;
  const isOpen = dd.style.display !== 'none';
  dd.style.display = isOpen ? 'none' : 'block';
}

document.addEventListener('click', () => {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.style.display = 'none';
});

// ── LOGOUT CONFIRM MODAL ──────────────────────────────────────
function openLogoutModal() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.style.display = 'none';
  document.getElementById('logout-modal').style.display = 'flex';
}

function closeLogoutModal() {
  document.getElementById('logout-modal').style.display = 'none';
}

// ── CLOCK & DATE ──────────────────────────────────────────────
// ── STARTING CASH ──────────────────────────────────────────
function lockSale() {
  const btns    = [document.getElementById('btn-process-desktop'), document.getElementById('btn-process-mobile')];
  const notices = [document.getElementById('drawer-lock-notice'), document.getElementById('drawer-lock-notice-mobile')];
  btns.forEach(b => { if (b) { b.disabled = true; b.classList.add('locked'); b.textContent = '🔒 Set Starting Cash First'; } });
  notices.forEach(n => { if (n) n.style.display = 'flex'; });
}

function unlockSale() {
  const btns    = [document.getElementById('btn-process-desktop'), document.getElementById('btn-process-mobile')];
  const notices = [document.getElementById('drawer-lock-notice'), document.getElementById('drawer-lock-notice-mobile')];
  btns.forEach(b => { if (b) { b.disabled = false; b.classList.remove('locked'); b.textContent = '💳 Process Payment'; } });
  notices.forEach(n => { if (n) n.style.display = 'none'; });
}

async function loadStartingCash(user) {
  const today  = todayStr();
  const amount = await DB.getStartingCash(user.username, today, _cashierBranchId);
  const el     = document.getElementById('cashier-starting-cash');
  const hint   = document.getElementById('starting-cash-hint');
  if (amount !== null) {
    if (el) el.textContent = formatCurrency(amount);
    if (hint) { hint.textContent = 'Tap to update'; hint.style.color = 'var(--text-muted)'; }
    unlockSale();
  } else {
    if (el) el.textContent = '—';
    if (hint) { hint.textContent = 'Tap to set'; hint.style.color = 'var(--accent)'; }
    lockSale();
    // Auto-prompt on first login of the day
    setTimeout(() => openStartingCashModal(true), 600);
  }
}

function openStartingCashModal(autoPrompt = false) {
  const input = document.getElementById('starting-cash-input');
  const info  = document.getElementById('starting-cash-set-info');
  const modal = document.getElementById('starting-cash-modal');
  if (!modal) return;
  const current = document.getElementById('cashier-starting-cash')?.textContent || '';
  if (input) {
    const numVal = current && current !== '—' ? current.replace(/[^️0-9.]/g, '') : '';
    input.value = numVal || '';
  }
  if (info) {
    if (autoPrompt) {
      info.textContent = 'Please set your starting cash to begin your shift.';
      info.style.color = 'var(--accent)';
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }
  }
  modal.style.display = 'flex';
  setTimeout(() => input?.focus(), 100);
}

function closeStartingCashModal() {
  document.getElementById('starting-cash-modal').style.display = 'none';
}

async function saveStartingCash() {
  const input  = document.getElementById('starting-cash-input');
  const amount = parseFloat(input?.value);
  if (isNaN(amount) || amount < 0) { showToast('Please enter a valid amount.', 'error'); return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Save starting cash?',
      text: `Cash drawer will be set to ${formatCurrency(amount)}.`,
      icon: 'question',
      confirmButtonText: 'Save Amount'
    });
    if (!proceed) return;
  }
  const user  = getCurrentUser();
  const today = todayStr();
  await DB.setStartingCash(user.username, user.fullname, today, _cashierBranchId, amount);
  await logAudit('SET_STARTING_CASH', 'Sales',
    `Set cash drawer starting amount to ${formatCurrency(amount)}`,
    { amount, date: today });
  const el   = document.getElementById('cashier-starting-cash');
  const hint = document.getElementById('starting-cash-hint');
  if (el) el.textContent = formatCurrency(amount);
  if (hint) { hint.textContent = 'Tap to update'; hint.style.color = 'var(--text-muted)'; }
  unlockSale();
  closeStartingCashModal();
  showToast('Starting cash saved! You can now process payments.', 'success');
}

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('current-time');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true });
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'2-digit' });
}
updateClock();
setInterval(updateClock, 1000);
