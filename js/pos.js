// ============================================================
//  SwiftPOS — POS Core (async / Supabase + Branch Support)
// ============================================================

let cart = [];
let posCategory = 'All';

// Returns the active branch for the current page:
// - Admin: whatever branch is selected in the dropdown (_activeBranch)
// - Staff/Cashier: their own branch (_staffBranchId / _cashierBranchId)
function getActiveBranchId() {
  if (typeof _activeBranch    !== 'undefined') return _activeBranch;
  if (typeof _staffBranchId   !== 'undefined') return _staffBranchId;
  if (typeof _cashierBranchId !== 'undefined') return _cashierBranchId;
  return null;
}

// ============================================================
//  CATEGORY PILLS
// ============================================================
function renderCatPills() {
  const container = document.getElementById('pos-cat-pills');
  if (!container) return;
  const cats = ['All', 'Fertilizers', 'Lubricants', 'Hardware', 'Feeds', 'Seeds', 'Chemicals', 'Others'];
  container.innerHTML = cats.map(c =>
    `<span class="cat-pill ${posCategory === c ? 'active' : ''}" onclick="setCategory('${c}')">${c}</span>`
  ).join('');
}

function setCategory(cat) {
  posCategory = cat;
  renderCatPills();
  renderPOSItems();
}

// ============================================================
//  PRODUCT GRID
// ============================================================
async function renderPOSItems() {
  const grid = document.getElementById('pos-products-grid');
  if (!grid) return;
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:30px;">Loading…</div>`;

  const search = (document.getElementById('pos-search')?.value || '').toLowerCase();
  let items = await DB.getItems(getActiveBranchId());
  if (posCategory !== 'All') items = items.filter(i => i.category === posCategory);
  if (search) items = items.filter(i => i.name.toLowerCase().includes(search));

  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px;">No items found.</div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const isOut = item.stock === 0;
    const isLow = item.stock > 0 && item.stock <= stockThreshold();
    return `
      <div class="product-card ${isOut ? 'out-of-stock' : ''} ${isLow && !isOut ? 'low-stock' : ''}"
           onclick="${isOut ? '' : `addToCart(${item.id})`}">
        ${isLow && !isOut ? `<span class="stock-badge low">Low</span>` : ''}
        ${isOut ? `<span class="stock-badge out">Out</span>` : ''}
        <span class="product-emoji">${item.emoji || '🏷️'}</span>
        <div class="product-name">${item.name}</div>
        <div class="product-price">${formatCurrency(item.price)}</div>
        <div class="product-stock">${isOut ? 'Out of stock' : `${item.stock} left`}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
//  CART
// ============================================================
async function addToCart(itemId) {
  const item = await DB.getItem(itemId);
  if (!item || item.stock === 0) return;
  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    if (existing.qty >= item.stock) { showToast(`Only ${item.stock} left in stock!`, 'warning'); return; }
    existing.qty++;
  } else {
    cart.push({ id: item.id, name: item.name, emoji: item.emoji || '🏷️', price: parseFloat(item.price), qty: 1 });
  }
  renderCart();

}

function updateQty(itemId, delta) {
  const idx = cart.findIndex(c => c.id === itemId);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  if (window.swalConfirm) {
    window.swalConfirm({
      title: 'Clear current order?',
      text: 'This will remove all items from the cart.',
      icon: 'warning',
      confirmButtonText: 'Clear Order',
      confirmButtonColor: '#dc2626'
    }).then(confirmed => {
      if (confirmed) confirmClearCart();
    });
    return;
  }
  document.getElementById('clear-cart-modal').style.display = 'flex';
}

function confirmClearCart() {
  cart = [];
  renderCart();
  document.getElementById('clear-cart-modal').style.display = 'none';
}

function cancelClearCart() {
  document.getElementById('clear-cart-modal').style.display = 'none';
}

function renderCart() {
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalLines = cart.length;

  if (!cart.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:30px;font-size:0.88rem;">Cart is empty</div>`;
  } else {
    list.innerHTML = cart.map(c => `
      <div class="cart-item">
        <span class="cart-item-emoji">${c.emoji}</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${c.name}</div>
          <div class="cart-item-price">${formatCurrency(c.price)} each</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${c.id}, -1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="updateQty(${c.id}, 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  // Update cart header badge
  const cartBadge = document.getElementById('cart-item-count');
  if (cartBadge) {
    cartBadge.textContent  = totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''}` : '';
    cartBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }

  // Update item summary line in cart summary
  const itemSummaryEl = document.getElementById('cart-items-summary');
  if (itemSummaryEl) {
    if (totalItems > 0) {
      itemSummaryEl.innerHTML = `
        <span style="color:var(--text-muted);">🛍 Items</span>
        <span style="font-weight:700;color:var(--accent);">
          ${totalItems} item${totalItems !== 1 ? 's' : ''}
          <span style="font-weight:400;color:var(--text-muted);font-size:0.75rem;">(${totalLines} line${totalLines !== 1 ? 's' : ''})</span>
        </span>`;
      itemSummaryEl.style.display = 'flex';
    } else {
      itemSummaryEl.style.display = 'none';
    }
  }

  const sub   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  // Senior / PWD discount (20% off subtotal)
  const discountToggle = document.getElementById('discount-toggle');
  const discountType   = document.getElementById('discount-type')?.value || 'senior';
  const hasDiscount    = discountToggle?.checked;
  const discountAmt    = hasDiscount ? sub * 0.20 : 0;
  const total          = sub - discountAmt;

  const discRow = document.getElementById('discount-amount-row');
  if (discRow) discRow.style.display = hasDiscount ? 'flex' : 'none';
  const discEl = document.getElementById('cart-discount');
  if (discEl) discEl.textContent = '-' + formatCurrency(discountAmt);

  document.getElementById('cart-subtotal').textContent = formatCurrency(sub);
  // VAT removed
  document.getElementById('cart-total').textContent    = formatCurrency(total);
  calcChange();
  if (typeof syncMobileCart === 'function') syncMobileCart();
}

function calcChange() {
  const sub   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountToggle = document.getElementById('discount-toggle');
  const hasDiscount    = discountToggle?.checked;
  const total = hasDiscount ? sub * 0.80 : sub;
  const cash  = parseFloat(document.getElementById('cash-tendered')?.value || 0);
  const change = cash - total;
  const el = document.getElementById('cart-change');
  if (el) {
    el.textContent = formatCurrency(change >= 0 ? change : 0);
    el.style.color = change < 0 ? 'var(--accent-red)' : 'var(--accent-green)';
  }
}

// ============================================================
//  PROCESS SALE
// ============================================================
// Holds the pending sale until cashier confirms (Done/Print)
let _pendingSale = null;

async function processSale() {
  // Block if starting cash not set
  const processBtn = document.getElementById('btn-process-desktop') || document.getElementById('btn-process-mobile');
  if (processBtn?.disabled) {
    showToast('🔒 Please set your starting cash before processing payments.', 'error');
    if (typeof openStartingCashModal === 'function') openStartingCashModal(true);
    return;
  }
  if (!cart.length) { showToast('Cart is empty!', 'error'); return; }

  const sub   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountToggle = document.getElementById('discount-toggle');
  const discountType   = document.getElementById('discount-type')?.value || 'senior';
  const hasDiscount    = discountToggle?.checked;
  const discountAmt    = hasDiscount ? sub * 0.20 : 0;
  const tax            = 0;
  const total          = sub - discountAmt;

  const cash = parseFloat(document.getElementById('cash-tendered')?.value || 0);
  if (cash < total) { showToast('Insufficient cash tendered!', 'error'); return; }

  const user       = getCurrentUser();
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  _pendingSale = {
    id:            `TXN-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
    datetime:      new Date().toISOString(),
    cashier:       user?.username || 'unknown',
    cashierName:   user?.fullname || 'Unknown',
    items:         JSON.parse(JSON.stringify(cart)),
    total_items:   totalItems,
    subtotal:      sub,
    tax,
    discount_type: hasDiscount ? discountType : null,
    discount_amt:  discountAmt,
    total,
    cash,
    change:        cash - total,
    status:        'completed',
    branchId:      getActiveBranchId()
  };

  showReceipt(_pendingSale);
}

// Called by Done / Print buttons — commits the sale to DB
async function confirmSale(andPrint = false) {
  if (!_pendingSale) { closeReceipt(); return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Complete this sale?',
      text: 'This will save the sale and deduct inventory stock.',
      icon: 'question',
      confirmButtonText: 'Complete Sale'
    });
    if (!proceed) return;
  }

  const sale           = _pendingSale;
  _pendingSale         = null;
  const discountToggle = document.getElementById('discount-toggle');

  showToast('Processing…', 'info');

  await DB.deductStock(sale.items);
  await DB.addSale(sale);
  await DB.upsertCashierDailySummary(sale);

  await logAudit(
    'PROCESS_SALE', 'Sales',
    `Processed sale ${sale.id} — ${sale.items.length} item(s), Total: ${formatCurrency(sale.total)}${sale.discount_type ? ` [${sale.discount_type.toUpperCase()} discount applied]` : ''}`,
    { txn_id: sale.id, items: sale.items.map(c => `${c.name} x${c.qty}`), total: sale.total, discount: sale.discount_type || 'none' }
  );

  if (discountToggle) discountToggle.checked = false;
  const discRow = document.getElementById('discount-amount-row');
  if (discRow) discRow.style.display = 'none';

  await checkLowStock(getActiveBranchId());
  await updateNotifBadge(getActiveBranchId());

  confirmClearCart();
  renderPOSItems();

  if (typeof renderCashierStats       === 'function') renderCashierStats();
  if (typeof renderRecentTransactions === 'function') renderRecentTransactions();
  if (typeof renderNotifPanel         === 'function') renderNotifPanel();

  if (andPrint) {
    const receiptHTML = document.getElementById('receipt-content').innerHTML;
    const pw = window.open('', '_blank', 'width=240,height=600');
    pw.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt</title>
        <style>
          @page { margin: 2mm; size: 58mm auto; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-weight: 700; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #000;
            background: #fff;
            width: 54mm;
          }
          .rcpt-wrap { padding: 4px 6px; }
          .rcpt-divider { border-top: 1px dashed #aaa; margin: 4px 0; }
          .rcpt-divider-thin { border-top: 1px dashed #ccc; margin: 2px 0; }
          .rcpt-header { text-align: center; padding: 3px 0; }
          .rcpt-logo { font-size: 14px; font-weight: 700; letter-spacing: 1px; }
          .rcpt-store { font-size: 12px; font-weight: 700; margin-top: 2px; }
          .rcpt-meta { font-size: 10px; color: #444; margin-top: 1px; }
          .rcpt-info { width: 100%; border-collapse: collapse; font-size: 10px; margin: 2px 0; }
          .rcpt-info td { padding: 1px 0; vertical-align: top; }
          .rcpt-info td:first-child { width: 65px; }
          .rcpt-info td:nth-child(2) { width: 8px; }
          .rcpt-items { width: 100%; border-collapse: collapse; font-size: 10px; }
          .rcpt-items th { padding: 2px 0; font-weight: 700; border-bottom: 1px dashed #aaa; }
          .rcpt-items th:nth-child(2), .rcpt-items td:nth-child(2) { text-align: center; width: 22px; }
          .rcpt-items th:last-child, .rcpt-items td:last-child { text-align: right; width: 50px; }
          .rcpt-items td { padding: 2px 0; }
          .rcpt-totals { width: 100%; border-collapse: collapse; font-size: 10px; margin: 2px 0; }
          .rcpt-totals td { padding: 1px 0; }
          .rcpt-totals td:last-child { text-align: right; }
          .rcpt-grand td { font-size: 12px; font-weight: 700; padding: 2px 0; }
          .rcpt-footer { text-align: center; font-size: 10px; color: #000; font-weight: 700; padding: 3px 0; line-height: 1.8; }
        </style>
      </head>
      <body>${receiptHTML}</body>
      </html>
    `);
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 400);
  }
  closeReceipt();
  showToast('Sale completed!', 'success');
}

// ============================================================
//  RECEIPT
// ============================================================
async function showReceipt(sale) {
  const el = document.getElementById('receipt-content');
  if (!el) return;

  // Fetch branch info
  let storeName    = 'STORE NAME';
  let storeAddress = '';
  let storeContact = '';
  let branchNum    = '';

  const branchId = sale.branchId || sale.branch_id || getActiveBranchId();
  if (branchId) {
    const branches = await DB.getBranches();
    const branch   = branches.find(b => b.id === branchId);
    if (branch) {
      storeName    = branch.name.toUpperCase();
      storeAddress = branch.address        || '';
      storeContact = branch.contact_number || '';
      branchNum    = branch.branch_number ? `Branch #${branch.branch_number}` : '';
    }
  }

  const receiptNo = String(sale.id).replace(/\D/g,'').slice(-6).padStart(6,'0');
  const dt        = new Date(sale.datetime);
  const dateStr   = dt.toLocaleDateString('en-PH', { month:'2-digit', day:'2-digit', year:'numeric' });
  const timeStr   = dt.toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', hour12:false });

  const subtotalAmt = parseFloat(sale.subtotal).toFixed(2);
  const taxAmt      = sale.discount_type ? '0.00' : parseFloat(sale.tax).toFixed(2);
  const discAmt     = sale.discount_amt ? parseFloat(sale.discount_amt).toFixed(2) : null;
  const totalAmt    = parseFloat(sale.total).toFixed(2);
  const cashAmt     = parseFloat(sale.cash).toFixed(2);
  const changeAmt   = parseFloat(sale.change).toFixed(2);
  const discLabel   = sale.discount_type === 'senior' ? 'Senior Discount (20%)' : 'PWD Discount (20%)';

  const itemRows = sale.items.map(i => {
    const name = i.name.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu, '').trim();
    return `
      <tr>
        <td style="padding:3px 0;text-align:left;">${name}</td>
        <td style="padding:3px 6px;text-align:center;">${i.qty}</td>
        <td style="padding:3px 0;text-align:right;">${parseFloat(i.price * i.qty).toFixed(2)}</td>
      </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="rcpt-wrap">
      <div class="rcpt-divider"></div>

      <div class="rcpt-header">
        <div class="rcpt-logo">⚡ SwiftPOS</div>
        <div class="rcpt-store">${storeName}</div>
        ${storeAddress ? `<div class="rcpt-meta">${storeAddress}</div>` : ''}
        ${storeContact ? `<div class="rcpt-meta">Contact No: ${storeContact}</div>` : ''}
        ${branchNum    ? `<div class="rcpt-meta">${branchNum}</div>`    : ''}
      </div>

      <div class="rcpt-divider"></div>

      <table class="rcpt-info">
        <tr><td>Receipt No</td><td>:</td><td>${receiptNo}</td></tr>
        <tr><td>Date</td>      <td>:</td><td>${dateStr}</td></tr>
        <tr><td>Time</td>      <td>:</td><td>${timeStr}</td></tr>
        <tr><td>Cashier</td>   <td>:</td><td>${sale.cashierName}</td></tr>
      </table>

      <div class="rcpt-divider"></div>

      <table class="rcpt-items">
        <thead>
          <tr>
            <th style="text-align:left;">Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="3"><div class="rcpt-divider-thin"></div></td></tr>
          ${itemRows}
        </tbody>
      </table>

      <div class="rcpt-divider"></div>

      <table class="rcpt-totals">
        <tr><td>Subtotal</td><td>${subtotalAmt}</td></tr>
        ${discAmt ? `<tr><td>${discLabel}</td><td>-${discAmt}</td></tr>` : ''}
      </table>

      <div class="rcpt-divider"></div>

      <table class="rcpt-totals rcpt-grand">
        <tr><td><strong>TOTAL</strong></td><td><strong>${totalAmt}</strong></td></tr>
        <tr><td>Cash</td><td>${cashAmt}</td></tr>
        <tr><td>Change</td><td>${changeAmt}</td></tr>
      </table>

      <div class="rcpt-divider"></div>

      <div class="rcpt-footer">
        <div>Thank you for shopping!</div>
        <div>Please come again.</div>
      </div>

      <div class="rcpt-divider"></div>
    </div>
  `;

  document.getElementById('receipt-modal').style.display = 'flex';
}

function closeReceipt() {
  document.getElementById('receipt-modal').style.display = 'none';
}

// ============================================================
//  INVENTORY
// ============================================================
async function renderInventory() {
  const tbody = document.getElementById('inventory-body');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>`;

  const search      = (document.getElementById('inv-search')?.value || '').toLowerCase();
  const cat         = document.getElementById('inv-cat-filter')?.value || '';
  const stockFilter = document.getElementById('inv-stock-filter')?.value || '';
  let items    = await DB.getItems(getActiveBranchId());
  if (cat)    items = items.filter(i => i.category === cat);
  if (search) items = items.filter(i => i.name.toLowerCase().includes(search));
  if (stockFilter) items = items.filter(i => {
    const isOut  = i.stock === 0;
    const isLow  = i.stock > 0 && i.stock <= stockThreshold();
    const isOver = i.stock > 100;
    if (stockFilter === 'out-of-stock') return isOut;
    if (stockFilter === 'low-stock')    return isLow;
    if (stockFilter === 'overstock')    return isOver;
    if (stockFilter === 'in-stock')     return !isOut && !isLow && !isOver;
    return true;
  });

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No items found.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => {
    const isOut = item.stock === 0;
    const isLow = item.stock > 0 && item.stock <= stockThreshold();
    const statusLabel = isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock';
    const statusText  = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
    return `
      <tr>
        <td style="font-family:monospace;font-size:0.78rem;color:var(--text-muted);text-align:center;">${item.product_number || '—'}</td>
        <td class="item-emoji-cell">${item.emoji || '🏷️'}</td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${formatCurrency(item.price)}</td>
        <td><span style="font-weight:600;${isLow||isOut ? `color:var(--accent-${isOut?'red':'orange'})` : ''}">${item.stock}</span></td>
        <td><span class="status-pill ${statusLabel}">${statusText}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="openItemModal(${item.id})">✏️ Edit</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function openItemModal(id) {
  const modal = document.getElementById('item-modal');
  if (!modal) return;
  document.getElementById('item-modal-title').textContent = id ? 'Edit Item' : 'Add Item';
  document.getElementById('item-id').value    = '';
  document.getElementById('item-name').value  = '';
  document.getElementById('item-price').value = '';
  document.getElementById('item-stock').value = '';
  document.getElementById('item-emoji').value = '';
  document.getElementById('item-cat').value   = 'Fertilizers';
  const numResetEl = document.getElementById('item-number');
  if (numResetEl) numResetEl.value = '';

  // Populate branch dropdown
  const branchSel = document.getElementById('item-branch');
  if (branchSel) {
    const branches = await DB.getBranches();
    branchSel.innerHTML = '<option value="">🌐 Shared (All Branches)</option>' +
      branches.map(b => `<option value="${b.id}">🏪 ${b.name}</option>`).join('');
    // Default: pre-select current user's branch (staff/cashier)
    const defaultBranch = getActiveBranchId();
    if (defaultBranch) branchSel.value = defaultBranch;
  }

  // Show/hide delete button
  const deleteBtn = document.getElementById('item-delete-btn');
  const footer    = document.getElementById('item-modal-footer');

  if (id) {
    const item = await DB.getItem(id);
    if (item) {
      document.getElementById('item-id').value    = item.id;
      document.getElementById('item-name').value  = item.name;
      document.getElementById('item-price').value = item.price;
      document.getElementById('item-stock').value = item.stock;
      document.getElementById('item-emoji').value  = item.emoji || '';
      document.getElementById('item-cat').value    = item.category;
      const numEl = document.getElementById('item-number');
      if (numEl) numEl.value = item.product_number || '';
      if (branchSel) branchSel.value = (item.branch_id !== null && item.branch_id !== undefined) ? item.branch_id : '';
    }
    if (deleteBtn) deleteBtn.style.display = 'inline-flex';
    if (footer)    footer.style.justifyContent = 'space-between';
  } else {
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (footer)    footer.style.justifyContent = 'flex-end';
  }
  modal.style.display = 'flex';
}

function closeItemModal() {
  document.getElementById('item-modal').style.display = 'none';
}

function deleteItemFromModal() {
  const id = document.getElementById('item-id').value;
  if (!id) return;
  closeItemModal();
  deleteItem(parseInt(id));
}


async function saveItem() {
  const id            = document.getElementById('item-id').value;
  const name          = document.getElementById('item-name').value.trim();
  const price         = parseFloat(document.getElementById('item-price').value);
  const stock         = parseInt(document.getElementById('item-stock').value);
  const cat           = document.getElementById('item-cat').value;
  const emoji         = document.getElementById('item-emoji').value.trim() || '🏷️';
  const productNumber = (document.getElementById('item-number')?.value || '').trim() || null;
  const branchSel     = document.getElementById('item-branch');
  const branchId      = branchSel?.value ? parseInt(branchSel.value) : null;
  const branchName    = branchSel?.options[branchSel.selectedIndex]?.text || 'Shared';

  if (!name || isNaN(price) || isNaN(stock)) { showToast('Please fill all fields correctly.', 'error'); return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: id ? 'Update item?' : 'Add new item?',
      text: `${name} will be ${id ? 'updated' : 'added'} in inventory.`,
      icon: 'question',
      confirmButtonText: id ? 'Update Item' : 'Add Item'
    });
    if (!proceed) return;
  }

  if (id) {
    await DB.updateItem(parseInt(id), { name, price, stock, category: cat, emoji, branch_id: branchId, product_number: productNumber });
    await logAudit('EDIT_ITEM', 'Inventory', `Updated item "${name}" — Price: ${formatCurrency(price)}, Stock: ${stock}, Branch: ${branchName}`, { item_id: id, name, price, stock, category: cat, branch_id: branchId });
    const resolved = await autoResolveIfSufficient(parseInt(id), name, stock);
    const resolvedMsg = resolved > 0 ? ` — ✔ ${resolved} pending request${resolved !== 1 ? 's' : ''} auto-resolved.` : '';
    showToast(`Item updated!${resolvedMsg}`, 'success');
  } else {
    const newItem = await DB.addItem({ name, price, stock, category: cat, emoji, branch_id: branchId, product_number: productNumber });
    await logAudit('ADD_ITEM', 'Inventory', `Added new item "${name}" (${cat}) — Price: ${formatCurrency(price)}, Stock: ${stock}, Branch: ${branchName}`, { name, price, stock, category: cat, branch_id: branchId });
    showToast('Item added!', 'success');
  }

  await checkLowStock(getActiveBranchId());
  await updateNotifBadge(getActiveBranchId());
  closeItemModal();
  renderInventory();
  renderPOSItems();
}

async function deleteItem(id) {
  const item = await DB.getItem(id);
  if (!item) return;
  openConfirmModal(
    `🗑 Delete "${item.name}"?`,
    `This will permanently remove <strong>${item.name}</strong> from inventory. This cannot be undone.`,
    async () => {
      await DB.deleteItem(id);
      await logAudit('DELETE_ITEM', 'Inventory', `Deleted item "${item.name}"`, { item_id: id, item_name: item.name });
      renderInventory();
      renderPOSItems();
      showToast('Item deleted.', 'info');
    }
  );
}

// ============================================================
//  HISTORY
// ============================================================
async function renderHistory() {
  const tbody = document.getElementById('history-body');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>`;

  const search         = (document.getElementById('hist-search')?.value || '').toLowerCase();
  const txnSearch      = (document.getElementById('hist-txn-search')?.value || '').toLowerCase();
  const date           = document.getElementById('hist-date')?.value || '';
  const cashierFilter  = document.getElementById('hist-cashier-filter')?.value || '';
  let sales            = await DB.getSales(getActiveBranchId());
  sales = sales.slice().reverse();

  // Populate cashier dropdown
  const cashierSel = document.getElementById('hist-cashier-filter');
  if (cashierSel) {
    const names = [...new Set(sales.map(s => s.cashierName))].sort();
    const current = cashierSel.value;
    cashierSel.innerHTML = '<option value="">All Cashiers</option>' +
      names.map(n => `<option value="${n}" ${n === current ? 'selected' : ''}>${n}</option>`).join('');
  }

  if (date)          sales = sales.filter(s => s.datetime.slice(0,10) === date);
  if (cashierFilter) sales = sales.filter(s => s.cashierName === cashierFilter);
  if (txnSearch)     sales = sales.filter(s => s.id.toLowerCase().includes(txnSearch));
  if (search)        sales = sales.filter(s =>
    s.id.toLowerCase().includes(search) || s.cashierName.toLowerCase().includes(search)
  );

  if (!sales.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:30px;">No transactions found.</td></tr>`;
    return;
  }

  tbody.innerHTML = sales.map(s => {
    const discCell = s.discount_type
      ? `<td><span class="discount-pill">${s.discount_type === 'senior' ? '👴 Senior' : '♿ PWD'}</span> <span style="font-size:0.78rem;color:#7c3aed;">-${formatCurrency(s.discount_amt)}</span></td>`
      : `<td style="color:var(--text-muted);font-size:0.78rem;">—</td>`;
    return `
    <tr>
      <td style="font-family:'Courier New',monospace;font-size:0.78rem;">${s.id}</td>
      <td>${formatDateTime(s.datetime)}</td>
      <td>${s.cashierName}</td>
      <td>${s.items.length} item(s)</td>
      ${discCell}
      <td>${formatCurrency(s.total)}</td>
      <td>${formatCurrency(s.cash)}</td>
      <td style="color:var(--accent-green)">${formatCurrency(s.change)}</td>
      <td><button class="btn btn-sm btn-outline" onclick='viewSaleDetail(${JSON.stringify(s).replace(/'/g,"&#39;")})'>👁 View</button></td>
    </tr>`;
  }).join('');
}

function viewSaleDetail(sale) { showReceipt(sale); }

async function exportHistory() {
  const search         = (document.getElementById('hist-search')?.value || '').toLowerCase();
  const txnSearch      = (document.getElementById('hist-txn-search')?.value || '').toLowerCase();
  const date           = document.getElementById('hist-date')?.value || '';
  const cashierFilter  = document.getElementById('hist-cashier-filter')?.value || '';
  let sales            = await DB.getSales(getActiveBranchId());
  sales = sales.slice().reverse();
  if (date)          sales = sales.filter(s => s.datetime.slice(0,10) === date);
  if (cashierFilter) sales = sales.filter(s => s.cashierName === cashierFilter);
  if (txnSearch)     sales = sales.filter(s => s.id.toLowerCase().includes(txnSearch));
  if (search)        sales = sales.filter(s =>
    s.id.toLowerCase().includes(search) || s.cashierName.toLowerCase().includes(search)
  );
  const rows = [['TXN ID','Date & Time','Cashier','Items','Subtotal','Tax','Total','Cash','Change']];
  sales.forEach(s => rows.push([s.id, s.datetime, s.cashierName, s.items.length, s.subtotal.toFixed(2), s.tax.toFixed(2), s.total.toFixed(2), s.cash.toFixed(2), s.change.toFixed(2)]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sale_history_${todayStr()}.csv`;
  a.click();
  await logAudit('EXPORT_HISTORY', 'Reports', `Exported sale history`, {});
}

// ============================================================
//  REPORTS
// ============================================================
let reportChartInst = null;

async function generateReport() {
  const from = document.getElementById('rep-from')?.value;
  const to   = document.getElementById('rep-to')?.value;
  let sales  = await DB.getSales(getActiveBranchId());
  if (from) sales = sales.filter(s => s.datetime.slice(0,10) >= from);
  if (to)   sales = sales.filter(s => s.datetime.slice(0,10) <= to);

  const totalRev   = sales.reduce((s,x) => s + x.total, 0);
  const totalItems = sales.reduce((s,x) => s + x.items.reduce((a,b) => a+b.qty, 0), 0);

  const statsEl = document.getElementById('report-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-card accent-blue"><div class="stat-label">Total Revenue</div><div class="stat-value">${formatCurrency(totalRev)}</div></div>
      <div class="stat-card accent-green"><div class="stat-label">Orders</div><div class="stat-value">${sales.length}</div></div>
      <div class="stat-card accent-orange"><div class="stat-label">Items Sold</div><div class="stat-value">${totalItems}</div></div>
      <div class="stat-card accent-red"><div class="stat-label">Avg Order Value</div><div class="stat-value">${formatCurrency(sales.length ? totalRev/sales.length : 0)}</div></div>
    `;
  }

  const byDate = {};
  sales.forEach(s => {
    const d = s.datetime.slice(0,10);
    if (!byDate[d]) byDate[d] = { orders:0, items:0, revenue:0 };
    byDate[d].orders++;
    byDate[d].items   += s.items.reduce((a,b) => a+b.qty, 0);
    byDate[d].revenue += s.total;
  });
  const dates = Object.keys(byDate).sort();

  const tbody = document.getElementById('report-body');
  if (tbody) {
    tbody.innerHTML = dates.map(d => `
      <tr>
        <td>${formatDate(d)}</td>
        <td>${byDate[d].orders}</td>
        <td>${byDate[d].items}</td>
        <td>${formatCurrency(byDate[d].revenue)}</td>
      </tr>
    `).join('') || `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No data.</td></tr>`;
  }

  await generateCashierReport(sales);
  await generateBestSellers(sales);

  const canvas = document.getElementById('reportChart');
  if (canvas) {
    if (reportChartInst) reportChartInst.destroy();
    reportChartInst = new Chart(canvas, {
      type: 'line',
      data: {
        labels: dates.map(d => formatDate(d)),
        datasets: [{
          label: 'Revenue',
          data: dates.map(d => byDate[d].revenue),
          borderColor: '#4f7cff',
          backgroundColor: 'rgba(79,124,255,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4f7cff'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#7b82a0' }, grid: { color: '#252a38' } },
          y: { ticks: { color: '#7b82a0', callback: v => '₱' + v.toLocaleString() }, grid: { color: '#252a38' } }
        }
      }
    });
  }
}

async function generateCashierReport(sales) {
  const cashierMap = {};
  sales.forEach(s => {
    if (!cashierMap[s.cashierName]) cashierMap[s.cashierName] = { orders: 0, items: 0, revenue: 0 };
    cashierMap[s.cashierName].orders++;
    cashierMap[s.cashierName].items   += s.items.reduce((a,b) => a+b.qty, 0);
    cashierMap[s.cashierName].revenue += s.total;
  });
  const sorted = Object.entries(cashierMap).sort((a,b) => b[1].revenue - a[1].revenue);
  const tbody = document.getElementById('cashier-report-body');
  if (!tbody) return;
  tbody.innerHTML = sorted.map(([name, d], i) => `
    <tr>
      <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i+1)} ${name}</td>
      <td>${d.orders}</td>
      <td>${d.items}</td>
      <td>${formatCurrency(d.revenue)}</td>
    </tr>
  `).join('') || `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No data.</td></tr>`;
}

async function generateBestSellers(sales) {
  const itemMap = {};
  sales.forEach(s => s.items.forEach(i => {
    if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, revenue: 0, emoji: i.emoji || '🏷️' };
    itemMap[i.name].qty     += i.qty;
    itemMap[i.name].revenue += i.price * i.qty;
  }));
  const sorted = Object.entries(itemMap).sort((a,b) => b[1].qty - a[1].qty).slice(0, 10);
  const tbody = document.getElementById('bestseller-body');
  if (!tbody) return;
  tbody.innerHTML = sorted.map(([name, d], i) => `
    <tr>
      <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i+1)} ${d.emoji} ${name}</td>
      <td>${d.qty}</td>
      <td>${formatCurrency(d.revenue)}</td>
    </tr>
  `).join('') || `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">No data.</td></tr>`;
}

async function exportReport() {
  const from = document.getElementById('rep-from')?.value;
  const to   = document.getElementById('rep-to')?.value;
  let sales  = await DB.getSales(getActiveBranchId());
  if (from) sales = sales.filter(s => s.datetime.slice(0,10) >= from);
  if (to)   sales = sales.filter(s => s.datetime.slice(0,10) <= to);

  const rows = [['TXN ID','Date','Cashier','Items','Subtotal','Tax','Total','Cash','Change']];
  sales.forEach(s => {
    rows.push([s.id, s.datetime, s.cashierName, s.items.length, s.subtotal.toFixed(2), s.tax.toFixed(2), s.total.toFixed(2), s.cash.toFixed(2), s.change.toFixed(2)]);
  });

  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `sales_report_${todayStr()}.csv`;
  a.click();

  await logAudit('EXPORT_REPORT', 'Reports', `Exported sales report (${from || 'all'} to ${to || 'now'})`, { from, to });
}

// ============================================================
//  REQUESTS
// ============================================================
async function renderRequests() {
  const tbody = document.getElementById('requests-body');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>`;

  const reqs = await DB.getRequests(getActiveBranchId());
  if (!reqs.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No requests.</td></tr>`;
    return;
  }
  tbody.innerHTML = reqs.map(r => `
    <tr>
      <td style="font-size:0.78rem;">${formatDateTime(r.datetime)}</td>
      <td>${r.itemName}</td>
      <td>${r.stock}</td>
      <td><span class="status-pill ${r.type === 'auto-alert' ? 'auto-alert' : 'pending'}">${r.type === 'auto-alert' ? '⚠️ Auto Alert' : '📢 Request'}</span></td>
      <td>${r.requestedByName}</td>
      <td><span class="status-pill ${r.status}">${r.status}</span></td>
      <td>${r.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="resolveRequest(${r.id})">✔ Resolve</button>` : '—'}</td>
    </tr>
  `).join('');
}

async function resolveRequest(id) {
  const reqs = await DB.getRequests(getActiveBranchId());
  const req  = reqs.find(r => r.id === id);
  await DB.updateRequest(id, { status: 'resolved' });
  await logAudit('RESOLVE_REQUEST', 'Inventory', `Resolved stock request for "${req?.itemName || id}"`, { request_id: id, item: req?.itemName });
  renderRequests();
  updateNotifBadge(getActiveBranchId());
  showToast('Request marked as resolved.', 'success');
}

async function resolveAllRequests() {
  const reqs = await DB.getRequests(getActiveBranchId());
  const pending = reqs.filter(r => r.status === 'pending');
  if (!pending.length) { showToast('No pending requests.', 'info'); return; }
  for (const r of pending) await DB.updateRequest(r.id, { status: 'resolved' });
  await logAudit('RESOLVE_ALL_REQUESTS', 'Inventory', `Resolved all ${pending.length} pending stock requests`, { count: pending.length });
  renderRequests();
  updateNotifBadge(getActiveBranchId());
  showToast(`✅ ${pending.length} requests resolved.`, 'success');
}

// ============================================================
//  CONFIRM MODAL
// ============================================================
let _confirmCallback = null;

function openConfirmModal(title, message, onConfirm) {
  if (window.swalConfirm) {
    window.swalConfirm({
      title: title || 'Confirm',
      text: message || 'Are you sure?',
      icon: 'warning',
      confirmButtonText: 'Yes, Continue',
      confirmButtonColor: '#dc2626'
    }).then(confirmed => {
      if (confirmed && typeof onConfirm === 'function') onConfirm();
    });
    return;
  }
  document.getElementById('confirm-modal-title').textContent   = title;
  document.getElementById('confirm-modal-message').innerHTML   = message;
  _confirmCallback = onConfirm;
  document.getElementById('confirm-modal').style.display = 'flex';
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').style.display = 'none';
  _confirmCallback = null;
}

async function executeConfirm() {
  if (_confirmCallback) await _confirmCallback();
  closeConfirmModal();
}

// ============================================================
//  QUICK RESTOCK MODAL
// ============================================================
// ============================================================
//  AUTO-RESOLVE pending requests when stock is back above threshold
// ============================================================
async function autoResolveIfSufficient(itemId, itemName, newStock) {
  const threshold = stockThreshold();
  if (newStock <= threshold) return 0; // still low, do nothing

  const branchId = getActiveBranchId();
  const reqs     = await DB.getRequests(branchId);
  const pending  = reqs.filter(r =>
    r.itemId === itemId && r.status === 'pending'
  );
  if (!pending.length) return 0;

  for (const r of pending) {
    await DB.updateRequest(r.id, { status: 'resolved' });
  }

  await logAudit(
    'AUTO_RESOLVE_REQUESTS', 'Inventory',
    `Auto-resolved ${pending.length} pending request(s) for "${itemName}" — stock now ${newStock} (threshold: ${threshold})`,
    { item_id: itemId, item_name: itemName, new_stock: newStock, resolved_count: pending.length }
  );
  return pending.length;
}

function openRestockModal(id, name, currentStock) {
  document.getElementById('restock-item-id').value      = id;
  document.getElementById('restock-item-name').textContent = name;
  document.getElementById('restock-current').textContent  = currentStock;
  document.getElementById('restock-qty').value           = '';
  document.getElementById('restock-modal').style.display = 'flex';
}

function closeRestockModal() {
  document.getElementById('restock-modal').style.display = 'none';
}

// ============================================================
//  QUICK PRICE UPDATE
// ============================================================
function openPriceModal(id, name, currentPrice) {
  document.getElementById('price-item-id').value         = id;
  document.getElementById('price-item-name').textContent = name;
  document.getElementById('price-current').textContent   = formatCurrency(currentPrice);
  document.getElementById('price-new').value             = parseFloat(currentPrice).toFixed(2);
  document.getElementById('price-modal').style.display   = 'flex';
  setTimeout(() => document.getElementById('price-new')?.select(), 80);
}

function closePriceModal() {
  document.getElementById('price-modal').style.display = 'none';
}

async function submitPriceUpdate() {
  const id       = parseInt(document.getElementById('price-item-id').value);
  const newPrice = parseFloat(document.getElementById('price-new').value);
  if (isNaN(newPrice) || newPrice < 0) { showToast('Enter a valid price.', 'error'); return; }

  const item = await DB.getItem(id);
  if (!item) return;
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Update item price?',
      text: `${item.name} will be changed to ${formatCurrency(newPrice)}.`,
      icon: 'question',
      confirmButtonText: 'Save Price'
    });
    if (!proceed) return;
  }
  const oldPrice = parseFloat(item.price);

  await DB.updateItem(id, { price: newPrice });
  await logAudit(
    'UPDATE_PRICE', 'Inventory',
    `Updated price of "${item.name}" from ${formatCurrency(oldPrice)} → ${formatCurrency(newPrice)}`,
    { item_id: id, item_name: item.name, old_price: oldPrice, new_price: newPrice }
  );

  showToast(`✅ Price updated: ${item.name} is now ${formatCurrency(newPrice)}`, 'success');
  closePriceModal();
  renderInventory();
  renderPOSItems();
}

async function submitRestock() {
  const id  = parseInt(document.getElementById('restock-item-id').value);
  const qty = parseInt(document.getElementById('restock-qty').value);
  if (!qty || qty < 1) { showToast('Enter a valid quantity.', 'error'); return; }
  const item = await DB.getItem(id);
  if (!item) return;
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Add stock now?',
      text: `${qty} units will be added to ${item.name}.`,
      icon: 'question',
      confirmButtonText: 'Add Stock'
    });
    if (!proceed) return;
  }
  const newStock = item.stock + qty;
  await DB.updateItem(id, { stock: newStock });
  await logAudit('RESTOCK_ITEM', 'Inventory',
    `Restocked "${item.name}" +${qty} units (${item.stock} → ${newStock})`,
    { item_id: id, item_name: item.name, added: qty, new_stock: newStock });

  const resolved = await autoResolveIfSufficient(id, item.name, newStock);
  const resolvedMsg = resolved > 0 ? ` — ✔ ${resolved} pending request${resolved !== 1 ? 's' : ''} auto-resolved.` : '';
  showToast(`✅ +${qty} added to ${item.name}. New stock: ${newStock}${resolvedMsg}`, 'success');
  closeRestockModal();
  renderInventory();
  renderPOSItems();
  await checkLowStock(getActiveBranchId());
  await updateNotifBadge(getActiveBranchId());
}

// ============================================================
//  SECTION SWITCHER
// ============================================================
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById(`sec-${name}`);
  if (target) target.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', branches: 'Branches', inventory: 'Inventory', sales: 'POS Preview',
    reports: 'Reports', history: 'Sale History', users: 'User Management',
    requests: 'Stock Requests', auditlog: 'Audit Log', loginlogs: 'Login History', settings: 'Settings',
    cashierday: 'Cashier Daily Sales'
  };
  const titleEl = document.getElementById('section-title');
  if (titleEl) titleEl.textContent = titles[name] || name;

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick')?.includes(`'${name}'`)) n.classList.add('active');
  });

  if (name === 'branches'   && typeof renderBranches   === 'function') renderBranches();
  if (name === 'inventory')  renderInventory();
  if (name === 'sales')      { renderCatPills(); renderPOSItems(); }
  if (name === 'history')    renderHistory();
  if (name === 'requests')   renderRequests();
  if (name === 'reports')    generateReport();
  if (name === 'auditlog')   renderAuditLog();
  if (name === 'loginlogs'  && typeof renderLoginLogs === 'function') renderLoginLogs();
  if (name === 'users'      && typeof renderUsers     === 'function') renderUsers();
  if (name === 'dashboard'  && typeof renderDashboard === 'function') renderDashboard();
  if (name === 'settings'   && typeof renderSettings   === 'function') renderSettings();
  if (name === 'cashierday' && typeof renderCashierBreakdown === 'function') renderCashierBreakdown();
}
