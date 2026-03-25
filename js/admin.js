// ============================================================
//  SwiftPOS — Admin Dashboard (Branch Support)
// ============================================================

let salesChartInst = null;
let catChartInst   = null;
let _branches      = [];
let _activeBranch  = null; // null = All Branches

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('admin');
  if (!user) return;
  document.getElementById('admin-name').textContent = user.fullname;

  await getStockThreshold();
  _branches = await DB.getBranches();
  renderBranchSelector();

  // Populate user branch filter dropdown
  const ubf = document.getElementById('user-branch-filter');
  if (ubf) {
    _branches.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id; opt.textContent = b.name;
      ubf.appendChild(opt);
    });
  }

  await checkLowStock(_activeBranch);
  await updateNotifBadge(_activeBranch);
  renderDashboard();
  setDefaultDates();
  startClock();

  setInterval(async () => {
    await getStockThreshold();
    await checkLowStock(_activeBranch);
    await updateNotifBadge(_activeBranch);
    const activeSection = document.querySelector('.section.active');
    if (activeSection?.id === 'sec-dashboard') refreshDashboardStats();
  }, 30000);
});

// ============================================================
//  BRANCH SELECTOR
// ============================================================
function renderBranchSelector() {
  const container = document.getElementById('branch-selector');
  if (!container) return;

  container.innerHTML = `
    <select id="branch-select" onchange="onBranchChange()" style="
      background:var(--bg-secondary,#f1f5f9);
      border:1.5px solid var(--border);
      color:var(--text-primary);
      padding:5px 22px 5px 8px;
      border-radius:20px;
      font-size:0.75rem;
      font-weight:600;
      cursor:pointer;
      outline:none;
      max-width:120px;
      min-width:0;
      width:auto;
      flex-shrink:1;
    ">
      <option value="">🌐 All Branches</option>
      ${_branches.map(b => `<option value="${b.id}">🏪 ${b.name}</option>`).join('')}
    </select>
  `;
}

async function onBranchChange() {
  const val = document.getElementById('branch-select').value;
  _activeBranch = val ? parseInt(val) : null;

  // Update branch label shown in topbar
  const labelEl = document.getElementById('branch-label');
  if (labelEl) {
    const branch = _branches.find(b => b.id === _activeBranch);
    labelEl.textContent = branch ? `📍 ${branch.name}` : '🌐 All Branches';
  }

  await checkLowStock(_activeBranch);
  await updateNotifBadge(_activeBranch);

  const activeSection = document.querySelector('.section.active');
  const sectionId = activeSection?.id || 'sec-dashboard';
  if (sectionId === 'sec-dashboard')  renderDashboard();
  if (sectionId === 'sec-inventory')  renderInventory();
  if (sectionId === 'sec-sales')      renderPOSItems();
  if (sectionId === 'sec-reports')    generateReport();
  if (sectionId === 'sec-history')    renderHistory();
  if (sectionId === 'sec-requests')   renderRequests();
}

// ============================================================
//  CLOCK
// ============================================================
function startClock() {
  function tick() {
    const now = new Date();
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

function setDefaultDates() {
  const today   = todayStr();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6);
  const fromEl  = document.getElementById('rep-from');
  const toEl    = document.getElementById('rep-to');
  if (fromEl) fromEl.value = weekAgo.toISOString().slice(0,10);
  if (toEl)   toEl.value   = today;

  const auditFrom = document.getElementById('audit-from');
  const auditTo   = document.getElementById('audit-to');
  if (auditFrom) auditFrom.value = weekAgo.toISOString().slice(0,10);
  if (auditTo)   auditTo.value   = today;

  const llFrom = document.getElementById('ll-from');
  const llTo   = document.getElementById('ll-to');
  if (llFrom) llFrom.value = weekAgo.toISOString().slice(0,10);
  if (llTo)   llTo.value   = today;
}

// ============================================================
//  DASHBOARD — Period State
// ============================================================
let _adminPeriod  = 'today';
let _adminDashFrom = null;
let _adminDashTo   = null;
let _adminPerfTab  = 'top';

function setAdminPeriod(period, btn) {
  _adminPeriod = period;
  document.querySelectorAll('.dash-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const customRange = document.getElementById('admin-custom-range');
  if (period === 'custom') { customRange.style.display = 'flex'; return; }
  customRange.style.display = 'none';
  const labels = { today: 'Today', week: 'This Week', month: 'This Month' };
  const labelEl = document.getElementById('admin-period-label');
  if (labelEl) labelEl.textContent = 'Showing: ' + (labels[period] || period);
  renderDashboard();
}

function applyAdminCustomPeriod() {
  const from = document.getElementById('admin-dash-from')?.value;
  const to   = document.getElementById('admin-dash-to')?.value;
  if (!from || !to) return;
  _adminDashFrom = from; _adminDashTo = to;
  const labelEl = document.getElementById('admin-period-label');
  if (labelEl) labelEl.textContent = `Showing: ${from} → ${to}`;
  renderDashboard();
}

function _getAdminPeriodRange() {
  const today = todayStr();
  if (_adminPeriod === 'today') return [today, today];
  if (_adminPeriod === 'week')  { const d=new Date(); d.setDate(d.getDate()-6); return [d.toISOString().slice(0,10), today]; }
  if (_adminPeriod === 'month') { const d=new Date(); d.setDate(1); return [d.toISOString().slice(0,10), today]; }
  if (_adminPeriod === 'custom' && _adminDashFrom && _adminDashTo) return [_adminDashFrom, _adminDashTo];
  return [today, today];
}

function setAdminPerfTab(tab, btn) {
  _adminPerfTab = tab;
  document.querySelectorAll('.perf-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  ['top','slow','dead'].forEach(t => {
    const p = document.getElementById(`admin-perf-${t}`);
    if (p) p.style.display = t === tab ? '' : 'none';
  });
}

// ============================================================
//  DASHBOARD
// ============================================================
async function renderDashboard(chartsOnly = false) {
  const [sales, items, auditLogs] = await Promise.all([
    DB.getSales(_activeBranch),
    DB.getItems(_activeBranch),
    getAuditLogs({ dateFrom: (() => { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })() })
  ]);

  const today      = todayStr();
  const todaySales = sales.filter(s => s.datetime.slice(0,10) === today);
  const [fromDate, toDate] = _getAdminPeriodRange();
  const periodSales = sales.filter(s => { const d=s.datetime.slice(0,10); return d>=fromDate && d<=toDate; });

  // KPI Stats
  document.getElementById('stat-today').textContent  = formatCurrency(todaySales.reduce((s,x)=>s+x.total,0));
  document.getElementById('stat-today-sub').textContent = `+${todaySales.length} transactions`;
  document.getElementById('stat-period').textContent = formatCurrency(periodSales.reduce((s,x)=>s+x.total,0));
  document.getElementById('stat-period-sub').textContent = `${periodSales.length} orders in period`;
  document.getElementById('stat-stock').textContent  = items.reduce((s,i)=>s+i.stock,0);

  const lowCount = items.filter(i => i.stock > 0 && i.stock <= stockThreshold()).length;
  const outCount = items.filter(i => i.stock === 0).length;
  const overCount= items.filter(i => i.stock > 100).length;
  document.getElementById('stat-low').textContent     = lowCount + outCount + overCount;
  document.getElementById('stat-low-sub').textContent = `${lowCount} low · ${outCount} out · ${overCount} over`;

  // Update chart label
  const chartLabels = { today: 'Today', week: 'This Week', month: 'This Month', custom: `${fromDate} → ${toDate}` };
  const chartLabelEl = document.getElementById('admin-chart-label');
  if (chartLabelEl) chartLabelEl.textContent = chartLabels[_adminPeriod] || 'This Week';

  _renderAdminSalesOverview(sales);
  _renderAdminStockAlerts(items);
  _renderAdminProductPerformance(items, sales, fromDate, toDate);
  _renderAdminUserActivity(auditLogs);
  renderRecentSales(sales);
  renderCashierBreakdown();

  // Only rebuild charts on full render (not on auto-refresh interval)
  if (!chartsOnly) {
    renderPeriodChart(sales, fromDate, toDate);
    renderCategoryChart(sales, items);
  }
}

// Lightweight refresh — updates stats & tables without touching charts
async function refreshDashboardStats() {
  const [sales, items, auditLogs] = await Promise.all([
    DB.getSales(_activeBranch),
    DB.getItems(_activeBranch),
    getAuditLogs({ dateFrom: (() => { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })() })
  ]);

  const today      = todayStr();
  const todaySales = sales.filter(s => s.datetime.slice(0,10) === today);
  const [fromDate, toDate] = _getAdminPeriodRange();
  const periodSales = sales.filter(s => { const d=s.datetime.slice(0,10); return d>=fromDate && d<=toDate; });

  document.getElementById('stat-today').textContent     = formatCurrency(todaySales.reduce((s,x)=>s+x.total,0));
  document.getElementById('stat-today-sub').textContent = `+${todaySales.length} transactions`;
  document.getElementById('stat-period').textContent    = formatCurrency(periodSales.reduce((s,x)=>s+x.total,0));
  document.getElementById('stat-period-sub').textContent= `${periodSales.length} orders in period`;
  document.getElementById('stat-stock').textContent     = items.reduce((s,i)=>s+i.stock,0);

  const lowCount  = items.filter(i => i.stock > 0 && i.stock <= stockThreshold()).length;
  const outCount  = items.filter(i => i.stock === 0).length;
  const overCount = items.filter(i => i.stock > 100).length;
  document.getElementById('stat-low').textContent      = lowCount + outCount + overCount;
  document.getElementById('stat-low-sub').textContent  = `${lowCount} low · ${outCount} out · ${overCount} over`;

  _renderAdminSalesOverview(sales);
  _renderAdminStockAlerts(items);
  _renderAdminProductPerformance(items, sales, fromDate, toDate);
  _renderAdminUserActivity(auditLogs);
  renderRecentSales(sales);
}

// ── Sales Overview ────────────────────────────────────────────
function _renderAdminSalesOverview(allSales) {
  const today      = todayStr();
  const weekStart  = (() => { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })();
  const monthStart = (() => { const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); })();
  const f = (from,to) => allSales.filter(s => { const d=s.datetime.slice(0,10); return d>=from&&d<=to; });
  const rev = arr => arr.reduce((s,x)=>s+x.total,0);
  const todaySales=f(today,today), weekSales=f(weekStart,today), monthSales=f(monthStart,today);
  document.getElementById('sov-today').textContent        = formatCurrency(rev(todaySales));
  document.getElementById('sov-today-orders').textContent = `${todaySales.length} orders`;
  document.getElementById('sov-week').textContent         = formatCurrency(rev(weekSales));
  document.getElementById('sov-week-orders').textContent  = `${weekSales.length} orders`;
  document.getElementById('sov-month').textContent        = formatCurrency(rev(monthSales));
  document.getElementById('sov-month-orders').textContent = `${monthSales.length} orders`;
  document.getElementById('sov-alltime').textContent      = formatCurrency(rev(allSales));
  document.getElementById('sov-alltime-orders').textContent = `${allSales.length} orders`;
}

// ── Stock Alerts ──────────────────────────────────────────────
function _renderAdminStockAlerts(items) {
  const lowItems  = items.filter(i => i.stock > 0 && i.stock <= stockThreshold());
  const outItems  = items.filter(i => i.stock === 0);
  const overItems = items.filter(i => i.stock > 100);
  const total     = lowItems.length + outItems.length + overItems.length;
  const badgeEl   = document.getElementById('admin-alerts-badge');
  if (badgeEl) badgeEl.textContent = `${total} alert${total!==1?'s':''}`;
  const fmt = (arr) => arr.length
    ? arr.slice(0,3).map(i=>`${i.emoji||'🏷️'} ${i.name} (${i.stock})`).join(', ')+(arr.length>3?` +${arr.length-3} more`:'')
    : 'None ✓';
  document.getElementById('admin-alert-low-count').textContent  = lowItems.length;
  document.getElementById('admin-alert-low-items').textContent  = fmt(lowItems);
  document.getElementById('admin-alert-out-count').textContent  = outItems.length;
  document.getElementById('admin-alert-out-items').textContent  = outItems.length
    ? outItems.slice(0,3).map(i=>`${i.emoji||'🏷️'} ${i.name}`).join(', ')+(outItems.length>3?` +${outItems.length-3} more`:'')
    : 'All in stock ✓';
  document.getElementById('admin-alert-over-count').textContent = overItems.length;
  document.getElementById('admin-alert-over-items').textContent = fmt(overItems);
}

// ── Product Performance ───────────────────────────────────────
function _renderAdminProductPerformance(items, allSales, fromDate, toDate) {
  const periodSales = allSales.filter(s=>{ const d=s.datetime.slice(0,10); return d>=fromDate&&d<=toDate; });
  const soldMap = {};
  periodSales.forEach(s=>s.items.forEach(i=>{ soldMap[i.name]=(soldMap[i.name]||0)+i.qty; }));

  // Top
  const topSorted = Object.entries(soldMap).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const maxQty = topSorted[0]?.[1]||1;
  const medals = ['🥇','🥈','🥉'];
  const topEl = document.getElementById('admin-top-sellers');
  if (topEl) topEl.innerHTML = topSorted.length
    ? topSorted.map(([name,qty],i)=>{
        const item=items.find(it=>it.name===name);
        return `<div class="top-seller-item">
          <span class="seller-rank">${medals[i]||`<span style="font-size:0.75rem;color:var(--text-muted);">#${i+1}</span>`}</span>
          <div class="seller-info">
            <div class="seller-name">${item?.emoji||'🏷️'} ${name}</div>
            <div class="seller-bar-wrap"><div class="seller-bar" style="width:${Math.round((qty/maxQty)*100)}%"></div></div>
          </div>
          <span class="seller-sold">${qty} sold</span>
        </div>`;
      }).join('')
    : '<div class="adm-empty">No sales in this period.</div>';

  // Slow
  const slowEl = document.getElementById('admin-slow-movers');
  if (slowEl) {
    const slowItems = items.filter(i=>i.stock>0).map(i=>({...i,sold:soldMap[i.name]||0}))
      .filter(i=>i.sold>0&&i.sold<3).sort((a,b)=>a.sold-b.sold).slice(0,7);
    slowEl.innerHTML = slowItems.length
      ? slowItems.map(i=>`<div class="top-seller-item">
          <span class="seller-rank">🐢</span>
          <div class="seller-info">
            <div class="seller-name">${i.emoji||'🏷️'} ${i.name}</div>
            <div class="seller-bar-wrap"><div class="seller-bar" style="width:${Math.round((i.sold/3)*100)}%;background:linear-gradient(90deg,#f59e0b,#fbbf24);"></div></div>
          </div>
          <span class="slow-badge">${i.sold} sold</span>
        </div>`).join('')
      : '<div class="adm-empty">No slow-moving items.</div>';
  }

  // Dead
  const deadEl = document.getElementById('admin-dead-stock');
  if (deadEl) {
    const deadItems = items.filter(i=>i.stock>0&&!soldMap[i.name]).sort((a,b)=>b.stock-a.stock).slice(0,7);
    deadEl.innerHTML = deadItems.length
      ? deadItems.map(i=>`<div class="top-seller-item">
          <span class="seller-rank">💀</span>
          <div class="seller-info">
            <div class="seller-name">${i.emoji||'🏷️'} ${i.name}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">Stock: ${i.stock} · ${i.category}</div>
          </div>
          <span class="dead-badge">0 sold</span>
        </div>`).join('')
      : '<div class="adm-empty">No dead stock — great! 🎉</div>';
  }
}

// ── User Activity ─────────────────────────────────────────────
function _renderAdminUserActivity(logs) {
  const container = document.getElementById('admin-activity-list');
  if (!container) return;
  const recent = logs.slice(0, 8);
  if (!recent.length) { container.innerHTML = '<div class="adm-empty">No recent activity.</div>'; return; }
  container.innerHTML = recent.map(log => {
    const cls      = log.role==='admin'?'av-admin':log.role==='cashier'?'av-cashier':log.role==='staff'?'av-staff':'av-system';
    const initials = (log.fullname||log.username||'A').charAt(0).toUpperCase();
    const diff     = Math.floor((new Date()-new Date(log.datetime))/1000);
    const ago      = diff<60?'just now':diff<3600?Math.floor(diff/60)+'m ago':diff<86400?Math.floor(diff/3600)+'h ago':Math.floor(diff/86400)+'d ago';
    const desc     = (log.description||log.action||'').slice(0,60)+((log.description?.length>60)?'…':'');
    return `<div class="activity-item">
      <div class="activity-avatar ${cls}">${initials}</div>
      <div class="activity-text">
        <div class="activity-action">${desc}</div>
        <div class="activity-time">${ago} · ${log.fullname||log.username}</div>
      </div>
    </div>`;
  }).join('');
}


function renderRecentSales(sales) {
  const tbody = document.getElementById('recent-sales-body');
  if (!tbody) return;
  const recent = sales.slice().reverse().slice(0, 8);
  tbody.innerHTML = recent.map(s => {
    const branch = _branches.find(b => b.id === s.branchId);
    return `
    <tr>
      <td>${formatDateTime(s.datetime)}</td>
      <td>${s.cashierName}</td>
      <td><span style="font-size:0.78rem;color:var(--text-muted);">${branch ? branch.name : '—'}</span></td>
      <td>${s.items.reduce((a,b) => a+b.qty, 0)} items</td>
      <td>${formatCurrency(s.total)}</td>
      <td><span class="status-pill completed">Completed</span></td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">No sales yet.</td></tr>`;
}

function renderWeeklyChart(sales) { renderPeriodChart(sales); }
async function renderCashierBreakdown() {
  const tbody = document.getElementById('cashier-breakdown-body');
  if (!tbody) return;

  // Set date input to today if empty
  const dateInput = document.getElementById('cashier-breakdown-date');
  const today = todayStr();
  if (dateInput && !dateInput.value) dateInput.value = today;
  const selectedDate = dateInput?.value || today;

  // Update badge label
  const badge = document.getElementById('cashier-breakdown-badge');
  if (badge) badge.textContent = selectedDate === today ? 'Today' : formatDate(selectedDate);

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>`;

  // Read from saved daily summary table
  const allRows = await DB.getCashierDailySummary(selectedDate);

  // Populate cashier dropdown from all pos_users with role=cashier
  const cashierSel = document.getElementById('cashier-breakdown-filter');
  if (cashierSel) {
    const current = cashierSel.value;
    const allUsers = await DB.getUsers();
    const cashiers = allUsers.filter(u => u.role === 'cashier').sort((a,b) => a.fullname.localeCompare(b.fullname));
    cashierSel.innerHTML = '<option value="">All Cashiers</option>' +
      cashiers.map(u => `<option value="${u.username}" ${u.username === current ? 'selected' : ''}>${u.fullname}</option>`).join('');
  }

  // Apply cashier filter
  const cashierFilter = document.getElementById('cashier-breakdown-filter')?.value || '';
  const rows = cashierFilter ? allRows.filter(r => r.cashier === cashierFilter) : allRows;

  // Stat cards (based on filtered rows)
  const statsEl = document.getElementById('cashier-day-stats');
  if (statsEl) {
    const totalTxns      = rows.reduce((s, r) => s + r.transactions, 0);
    const totalItems     = rows.reduce((s, r) => s + r.items_sold, 0);
    const totalRev       = rows.reduce((s, r) => s + parseFloat(r.total_sales), 0);
    const setCount       = rows.filter(r => r.starting_cash !== null && r.starting_cash !== undefined).length;
    const totalStarting  = rows.reduce((s, r) => s + parseFloat(r.starting_cash || 0), 0);
    const totalDrawer    = totalStarting + totalRev;
    statsEl.innerHTML = `
      <div class="stat-card accent-blue">
        <div class="stat-label">Active Cashiers</div>
        <div class="stat-value">${rows.length}</div>
        <div class="stat-sub">${selectedDate === today ? 'working today' : 'on this date'}</div>
      </div>
      <div class="stat-card" style="background:linear-gradient(135deg,rgba(22,163,74,0.08),rgba(22,163,74,0.03));border-color:rgba(22,163,74,0.2);">
        <div class="stat-label">📂 Total Starting Cash</div>
        <div class="stat-value" style="color:#16a34a;">${formatCurrency(totalStarting)}</div>
        <div class="stat-sub">${setCount} of ${rows.length} cashier${rows.length !== 1 ? 's' : ''} set</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">Total Transactions</div>
        <div class="stat-value">${totalTxns}</div>
        <div class="stat-sub">across all cashiers</div>
      </div>
      <div class="stat-card accent-orange">
        <div class="stat-label">Items Sold</div>
        <div class="stat-value">${totalItems}</div>
        <div class="stat-sub">total units</div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-label">Total Sales</div>
        <div class="stat-value">${formatCurrency(totalRev)}</div>
        <div class="stat-sub">combined revenue</div>
      </div>
      <div class="stat-card" style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(139,92,246,0.03));border-color:rgba(139,92,246,0.2);">
        <div class="stat-label">💰 Expected in Drawer</div>
        <div class="stat-value" style="color:#7c3aed;">${formatCurrency(totalDrawer)}</div>
        <div class="stat-sub">starting + sales collected</div>
      </div>`;
  }

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">No sales recorded for this date.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((c) => {
    const branch      = _branches.find(b => b.id === c.branch_id);
    const hasStarting = c.starting_cash !== null && c.starting_cash !== undefined;
    const startAmt    = parseFloat(c.starting_cash || 0);
    const salesAmt    = parseFloat(c.total_sales || 0);
    const drawerAmt   = startAmt + salesAmt;
    const startCash   = hasStarting
      ? `<span style="font-weight:700;color:#16a34a;">${formatCurrency(startAmt)}</span>`
      : `<span style="color:var(--text-muted);font-size:0.78rem;">Not set</span>`;
    const drawerCell  = hasStarting
      ? `<span style="font-weight:700;color:#7c3aed;">${formatCurrency(drawerAmt)}</span>
         <div style="font-size:0.68rem;color:var(--text-muted);margin-top:1px;">${formatCurrency(startAmt)} + ${formatCurrency(salesAmt)}</div>`
      : `<span style="color:var(--text-muted);font-size:0.78rem;">—</span>`;
    return `
      <tr>
        <td><strong>${c.cashier_name}</strong><div style="font-size:0.72rem;color:var(--text-muted);">@${c.cashier}</div></td>
        <td style="font-size:0.78rem;color:var(--text-muted);">${branch ? branch.name : '—'}</td>
        <td>${startCash}</td>
        <td>${c.transactions}</td>
        <td>${c.items_sold}</td>
        <td style="font-weight:700;color:var(--accent);">${formatCurrency(salesAmt)}</td>
        <td>${drawerCell}</td>
      </tr>`;
  }).join('');
}



function renderPeriodChart(sales, fromDate, toDate) {
  const canvas = document.getElementById('salesChart');
  if (!canvas) return;
  const today = todayStr();
  const from  = fromDate || (() => { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })();
  const to    = toDate || today;

  const labels = [], days = [];
  const fromD = new Date(from), toD = new Date(to);
  const diffDays = Math.round((toD - fromD) / 86400000) + 1;
  const maxDays  = Math.min(diffDays, 31);

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(fromD); d.setDate(fromD.getDate() + i);
    days.push(d.toISOString().slice(0,10));
    labels.push(d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }));
  }
  const data = days.map(d => sales.filter(s => s.datetime.slice(0,10) === d).reduce((s,x)=>s+x.total,0));
  if (salesChartInst) salesChartInst.destroy();
  salesChartInst = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Revenue', data, backgroundColor: 'rgba(79,124,255,0.7)', borderRadius: 6, hoverBackgroundColor: '#4f7cff' }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '₱' + ctx.parsed.y.toLocaleString('en-PH', {minimumFractionDigits:2}) } } },
      scales: {
        x: { ticks: { color: '#7b82a0', font:{size:11} }, grid: { display: false } },
        y: { ticks: { color: '#7b82a0', callback: v => '₱' + v.toLocaleString() }, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

function renderCategoryChart(sales, items) {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;
  const cats = ['Fertilizers','Lubricants','Hardware','Feeds','Seeds','Chemicals','Others'];
  const itemCatMap = {};
  items.forEach(i => { itemCatMap[i.id] = i.category; });
  const catTotals = {};
  cats.forEach(c => catTotals[c] = 0);
  sales.forEach(s => {
    s.items.forEach(si => {
      const cat = itemCatMap[si.id] || 'Others';
      catTotals[cat] = (catTotals[cat] || 0) + si.price * si.qty;
    });
  });
  if (catChartInst) catChartInst.destroy();
  catChartInst = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: cats.map(c => catTotals[c]), backgroundColor: ['#4f7cff','#22c55e','#f97316','#eab308','#8b5cf6'], borderColor: '#1a1e2a', borderWidth: 2 }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#7b82a0', font: { size: 11 } } } } }
  });
}

// ============================================================
//  BRANCHES OVERVIEW
// ============================================================
async function renderBranches() {
  const tbody    = document.getElementById('branch-overview-body');
  const statsEl  = document.getElementById('branch-stats-grid');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>`;

  const [users, allItems, sales, ...perBranchItems] = await Promise.all([
    DB.getUsers(),
    DB.getItems(),
    DB.getSales(),
    ..._branches.map(b => DB.getItems(b.id))
  ]);
  const branchItemsMap = {};
  _branches.forEach((b, idx) => { branchItemsMap[b.id] = perBranchItems[idx] || []; });
  const today = todayStr();

  // Summary stat cards
  if (statsEl) {
    const totalBranches  = _branches.length;
    const totalStaff     = users.filter(u => u.role === 'staff').length;
    const totalCashiers  = users.filter(u => u.role === 'cashier').length;
    const totalLowStock  = allItems.filter(i => i.stock <= stockThreshold()).length;
    statsEl.innerHTML = `
      <div class="stat-card accent-blue">
        <div class="stat-label">Total Branches</div>
        <div class="stat-value">${totalBranches}</div>
        <div class="stat-sub">Active locations</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">Total Staff</div>
        <div class="stat-value">${totalStaff}</div>
        <div class="stat-sub">Across all branches</div>
      </div>
      <div class="stat-card accent-orange">
        <div class="stat-label">Total Cashiers</div>
        <div class="stat-value">${totalCashiers}</div>
        <div class="stat-sub">Across all branches</div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-label">Low Stock Alerts</div>
        <div class="stat-value">${totalLowStock}</div>
        <div class="stat-sub">Across all branches</div>
      </div>
    `;
  }

  if (!_branches.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px;">No branches found.</td></tr>`;
    return;
  }

  tbody.innerHTML = _branches.map(b => {
    const branchUsers    = users.filter(u => u.branch_id === b.id);
    const staffCount     = branchUsers.filter(u => u.role === 'staff').length;
    const cashierCount   = branchUsers.filter(u => u.role === 'cashier').length;
    const branchItems    = branchItemsMap[b.id] || [];
    const totalStock     = branchItems.reduce((s, i) => s + i.stock, 0);
    const lowStock       = branchItems.filter(i => i.stock > 0 && i.stock <= stockThreshold()).length;
    const outStock       = branchItems.filter(i => i.stock === 0).length;
    const branchSales    = sales.filter(s => s.branchId === b.id);
    const todaySales     = branchSales.filter(s => s.datetime.slice(0,10) === today);
    const todayRevenue   = todaySales.reduce((s, x) => s + x.total, 0);
    const totalRevenue   = branchSales.reduce((s, x) => s + x.total, 0);

    const lowStockBadge = (lowStock + outStock) > 0
      ? `<span style="color:#f97316;font-weight:600;">⚠️ ${lowStock + outStock}</span>`
      : `<span style="color:#22c55e;">✅ 0</span>`;

    return `
      <tr>
        <td>
          <div style="font-weight:600;">🏪 ${b.name}</div>
          ${b.branch_number ? `<div style="font-size:0.75rem;color:var(--text-muted);">Branch #${b.branch_number}</div>` : ''}
          ${b.address ? `<div style="font-size:0.75rem;color:var(--text-muted);">📍 ${b.address}</div>` : ''}
        </td>
        <td>${staffCount} staff</td>
        <td>${cashierCount} cashier${cashierCount !== 1 ? 's' : ''}</td>
        <td>${totalStock} units</td>
        <td>${lowStockBadge}</td>
        <td>${formatCurrency(todayRevenue)}</td>
        <td>${formatCurrency(totalRevenue)}</td>
        <td style="display:flex;gap:5px;flex-wrap:wrap;">
          <button class="btn btn-sm btn-outline" onclick="viewBranch(${b.id})">👁 View</button>
          <button class="btn btn-sm btn-outline" onclick="openEditBranch(${b.id})">✏️ Edit</button>
        </td>
      </tr>
    `;
  }).join('');
}

function viewBranch(branchId) {
  // Switch branch selector and go to dashboard
  const select = document.getElementById('branch-select');
  if (select) {
    select.value = branchId;
    onBranchChange();
  }
  showSection('dashboard');
}

// ============================================================
//  EDIT BRANCH (name, number, address)
// ============================================================
function openEditBranch(branchId) {
  const branch = _branches.find(b => b.id === branchId);
  if (!branch) return;
  document.getElementById('edit-branch-id').value      = branch.id;
  document.getElementById('edit-branch-name').value    = branch.name || '';
  document.getElementById('edit-branch-number').value  = branch.branch_number || '';
  document.getElementById('edit-branch-address').value = branch.address || '';
  document.getElementById('edit-branch-modal').style.display = 'flex';
}

function closeEditBranch() {
  document.getElementById('edit-branch-modal').style.display = 'none';
}

async function saveEditBranch() {
  const id      = parseInt(document.getElementById('edit-branch-id').value);
  const name    = document.getElementById('edit-branch-name').value.trim();
  const number  = document.getElementById('edit-branch-number').value.trim();
  const address = document.getElementById('edit-branch-address').value.trim();

  if (!name) { showToast('Branch name is required.', 'error'); return; }

  await DB.updateBranch(id, { name, branch_number: number || null, address: address || null });

  await logAudit('EDIT_BRANCH', 'Branch',
    `Updated branch "${name}" — Number: ${number || 'N/A'}, Address: ${address || 'N/A'}`,
    { branch_id: id, name, branch_number: number, address });

  showToast('Branch updated!', 'success');
  closeEditBranch();
  _branches = await DB.getBranches();
  renderBranches();
  renderBranchSelector();
}

// ============================================================
//  USERS
// ============================================================
async function renderUsers() {
  const tbody = document.getElementById('users-body');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>`;

  const search       = (document.getElementById('user-search')?.value || '').toLowerCase();
  const roleFilter   = document.getElementById('user-role-filter')?.value || '';
  const branchFilter = document.getElementById('user-branch-filter')?.value || '';
  let users = await DB.getUsers();
  if (roleFilter)   users = users.filter(u => u.role === roleFilter);
  if (branchFilter) users = users.filter(u => String(u.branch_id) === branchFilter);
  if (search)       users = users.filter(u =>
    u.fullname.toLowerCase().includes(search) ||
    u.username.toLowerCase().includes(search) ||
    (u.email || '').toLowerCase().includes(search)
  );

  const currentUser = getCurrentUser();

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isTerminated = u.status === 'terminated';
    const statusClass  = u.status === 'active' ? 'in-stock' : 'out-of-stock';
    const statusLabel  = isTerminated ? '⛔ Terminated' : u.status;
    const branch       = _branches.find(b => b.id === u.branch_id);
    const isSelf       = String(u.id) === String(currentUser?.id);

    const actionCell = isSelf
      ? `<td><span style="color:var(--text-muted);font-size:0.78rem;font-style:italic;">You</span></td>`
      : `<td>
          <button onclick="openViewUserModal(${u.id})"
            style="margin-right:6px;padding:5px 10px;border-radius:6px;border:1px solid var(--border);
            background:transparent;color:var(--text-primary);cursor:pointer;font-size:0.78rem;">
            👁 View
          </button>
          <button onclick="openUserModal(${u.id})"
            style="padding:5px 10px;border-radius:6px;border:1px solid var(--border);
            background:transparent;color:var(--text-primary);cursor:pointer;font-size:0.78rem;">
            ✏️ Edit
          </button>
        </td>`;

    return `
    <tr style="${isTerminated ? 'opacity:0.7;' : ''}">
      <td>
        <div style="font-weight:600;">${u.fullname}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">@${u.username}</div>
      </td>
      <td style="font-size:0.82rem;color:var(--text-secondary);">${u.email || '—'}</td>
      <td style="font-size:0.82rem;color:var(--text-secondary);">${u.contact_number || '—'}</td>
      <td><span class="status-pill ${u.role}">${u.role}</span></td>
      <td style="font-size:0.82rem;color:var(--text-secondary);">${branch ? branch.name : u.role === 'admin' ? '(All)' : '—'}</span></td>
      <td><span class="status-pill ${statusClass}" style="${isTerminated ? 'background:rgba(239,68,68,0.15);color:#f87171;border-color:rgba(239,68,68,0.3);' : ''}">${statusLabel}</span></td>
      ${actionCell}
    </tr>`;
  }).join('');
}

function openUserModal(id) {
  const modal = document.getElementById('user-modal');
  if (!modal) return;
  document.getElementById('user-modal-title').textContent = id ? 'Edit User' : 'Add User';
  document.getElementById('user-id').value       = '';
  document.getElementById('user-fullname').value = '';
  document.getElementById('user-username').value = '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-role').value     = 'staff';
  document.getElementById('user-branch').value   = '';

  const pwLabel = document.getElementById('pw-label');
  if (pwLabel) pwLabel.textContent = id ? 'New Password (leave blank to keep current)' : 'Password';

  const pwInput = document.getElementById('user-password');
  const pwBtn   = document.getElementById('pw-toggle');
  if (pwInput) pwInput.type = 'password';
  if (pwBtn)   { pwBtn.textContent = '👁️'; pwBtn.style.color = 'var(--text-secondary)'; }

  const adminPwGroup = document.getElementById('admin-pw-group');
  const adminPwInput = document.getElementById('admin-confirm-password');
  if (adminPwGroup) adminPwGroup.style.display = id ? 'none' : 'block';
  if (adminPwInput) { adminPwInput.value = ''; adminPwInput.type = 'password'; }
  const adminPwBtn = document.getElementById('admin-pw-toggle');
  if (adminPwBtn) { adminPwBtn.textContent = '👁️'; adminPwBtn.style.color = 'var(--text-secondary)'; }

  // Populate branch dropdown
  const branchSel = document.getElementById('user-branch');
  if (branchSel) {
    branchSel.innerHTML = '<option value="">— No Branch (Admin) —</option>' +
      _branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  }

  if (id) {
    DB.getUsers().then(users => {
      const u = users.find(x => x.id === id);
      if (!u) return;
      document.getElementById('user-id').value       = u.id;
      document.getElementById('user-fullname').value = u.fullname;
      document.getElementById('user-username').value = u.username;
      document.getElementById('user-role').value     = u.role;
      if (branchSel && u.branch_id) branchSel.value  = u.branch_id;
    });
  }
  modal.style.display = 'flex';
}

function closeUserModal() {
  document.getElementById('user-modal').style.display = 'none';
}

// ============================================================
//  VIEW USER MODAL + ACCOUNT TERMINATION
// ============================================================
async function openViewUserModal(id) {
  const modal = document.getElementById('view-user-modal');
  if (!modal) return;

  const users = await DB.getUsers();
  const u = users.find(x => x.id === id);
  if (!u) return;

  document.getElementById('view-avatar').textContent   = u.fullname.charAt(0).toUpperCase();
  document.getElementById('view-fullname').textContent = u.fullname;
  document.getElementById('view-username').textContent = '@' + u.username;
  document.getElementById('view-email').textContent    = u.email || '—';
  document.getElementById('view-contact').textContent  = u.contact_number || '—';

  const branch = _branches.find(b => b.id === u.branch_id);
  const branchEl = document.getElementById('view-branch');
  if (branchEl) branchEl.textContent = branch ? branch.name : u.role === 'admin' ? 'All Branches' : '—';

  document.getElementById('view-role-badge').innerHTML = `<span class="status-pill ${u.role}">${u.role}</span>`;

  const isTerminated = u.status === 'terminated';
  const isActive     = u.status === 'active';
  document.getElementById('view-status-badge').innerHTML = isTerminated
    ? `<span class="status-pill out-of-stock" style="background:rgba(239,68,68,0.15);color:#f87171;border-color:rgba(239,68,68,0.3);">⛔ Terminated</span>`
    : isActive ? `<span class="status-pill in-stock">✅ Active</span>`
    : `<span class="status-pill out-of-stock">Inactive</span>`;

  document.getElementById('view-terminated-notice').style.display = isTerminated ? 'block' : 'none';

  const actionsEl = document.getElementById('view-terminate-actions');
  if (isTerminated) {
    actionsEl.innerHTML = `
      <button class="btn btn-success" onclick="reactivateUser(${u.id},'${u.fullname}')">✅ Reactivate Account</button>
      <button class="btn btn-danger" onclick="deleteUserFromView(${u.id},'${u.fullname}','${u.username}')" style="margin-left:4px;">🗑 Delete</button>`;
  } else {
    actionsEl.innerHTML = `
      <button class="btn btn-danger" onclick="terminateUser(${u.id},'${u.fullname}')"
        style="background:rgba(239,68,68,0.2);color:#dc2626;border:1px solid rgba(239,68,68,0.4);">
        ⛔ Terminate Account
      </button>
      <button class="btn btn-danger" onclick="deleteUserFromView(${u.id},'${u.fullname}','${u.username}')" style="margin-left:4px;">🗑 Delete</button>`;
  }
  modal.style.display = 'flex';
}

function closeViewUserModal() { document.getElementById('view-user-modal').style.display = 'none'; }

async function terminateUser(id, fullname) {
  if (!confirm(`⛔ Terminate account for "${fullname}"?\n\nThis will block them from logging in.`)) return;
  await DB.updateUser(id, { status: 'terminated' });
  await logAudit('TERMINATE_USER', 'Users', `Terminated account for "${fullname}"`, { user_id: id, fullname });
  showToast(`⛔ "${fullname}" account terminated.`, 'error');
  closeViewUserModal(); renderUsers();
}

async function deleteUserFromView(id, fullname, username) {
  closeViewUserModal();
  await deleteUser(id, fullname, username);
}

async function reactivateUser(id, fullname) {
  if (!confirm(`Reactivate account for "${fullname}"?`)) return;
  await DB.updateUser(id, { status: 'active' });
  await logAudit('REACTIVATE_USER', 'Users', `Reactivated account for "${fullname}"`, { user_id: id, fullname });
  showToast(`✅ "${fullname}" account reactivated.`, 'success');
  closeViewUserModal(); renderUsers();
}

async function saveUser() {
  const id       = document.getElementById('user-id').value;
  const fullname = document.getElementById('user-fullname').value.trim();
  const username = document.getElementById('user-username').value.trim().toLowerCase();
  const password = document.getElementById('user-password').value;
  const role     = document.getElementById('user-role').value;
  const branchId = document.getElementById('user-branch')?.value || null;

  if (!fullname || !username) { showToast('Please fill in name and username.', 'error'); return; }
  if (!id && !password)       { showToast('Password is required for new users.', 'error'); return; }
  if (password && password.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }

  if (id) {
    const updates = { fullname, username, role, branch_id: branchId ? parseInt(branchId) : null };
    if (password) updates.password = password;
    await DB.updateUser(parseInt(id), updates);
    await logAudit('EDIT_USER', 'Users', `Updated user "${fullname}" (@${username}) — Role: ${role}`, { user_id: id, fullname, username, role });
    showToast(password ? '✅ User updated and password changed!' : '✅ User updated!', 'success');

  } else {
    const adminPassword = document.getElementById('admin-confirm-password').value;
    if (!adminPassword) { showToast('Please enter your admin password to create an account.', 'error'); return; }

    try {
      await DB.verifyCurrentPassword(adminPassword);
    } catch (e) {
      showToast('❌ Incorrect admin password.', 'error');
      return;
    }

    const allUsers = await DB.getUsers();
    const existing = allUsers.find(u => u.username === username);
    if (existing) { showToast('❌ Username already taken.', 'error'); return; }

    const result = await DB.addUser({
      fullname, username, password, role, status: 'active',
      branch_id: branchId ? parseInt(branchId) : null
    });
    if (!result) { showToast('Failed to create user. Try again.', 'error'); return; }

    const branch = _branches.find(b => b.id === parseInt(branchId));
    await logAudit('ADD_USER', 'Users',
      `Created new ${role} account for "${fullname}" (@${username}) — ${branch ? branch.name : 'No Branch'}`,
      { fullname, username, role, branch_id: branchId });
    showToast(`✅ "${fullname}" account created!`, 'success');
  }
  closeUserModal(); renderUsers();
}

async function toggleUser(id, currentStatus, fullname) {
  if (currentStatus === 'terminated') { showToast('⛔ This account is terminated. Use the View dialog to reactivate it.', 'error'); return; }
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  await DB.updateUser(id, { status: newStatus });
  await logAudit(newStatus === 'active' ? 'ENABLE_USER' : 'DISABLE_USER', 'Users',
    `${newStatus === 'active' ? 'Enabled' : 'Disabled'} account for "${fullname}"`,
    { user_id: id, fullname, new_status: newStatus });
  renderUsers();
  showToast('User status updated.', 'info');
}

async function deleteUser(id, fullname, username) {
  const confirmName = prompt(`Type the username "${username}" to confirm permanent deletion:`);
  if (confirmName !== username) {
    if (confirmName !== null) showToast('Username did not match. Deletion cancelled.', 'error');
    return;
  }
  try { await DB.deleteUser(id); } catch(e) { showToast('Failed to delete user: ' + e.message, 'error'); return; }
  await logAudit('DELETE_USER', 'Users', `Permanently deleted account for "${fullname}" (@${username})`, { user_id: id, fullname, username });
  showToast(`"${fullname}" account permanently deleted.`, 'info');
  renderUsers();
}

// ============================================================
//  SETTINGS
// ============================================================
async function renderSettings() {
  const threshold = await DB.getSetting('stock_threshold');
  const el = document.getElementById('setting-threshold');
  if (el) el.value = threshold || 5;
  await loadAdminProfile();
  await populateBranchSettingsDropdown();
}

async function populateBranchSettingsDropdown() {
  const sel = document.getElementById('branch-setting-select');
  if (!sel) return;
  const branches = await DB.getBranches();
  sel.innerHTML = branches.length
    ? branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')
    : '<option value="">No branches found</option>';
  loadBranchSettings();
}

function loadBranchSettings() {
  const sel = document.getElementById('branch-setting-select');
  if (!sel || !sel.value) return;
  const branchId = parseInt(sel.value);
  const branch = _branches.find(b => b.id === branchId);
  if (!branch) return;
  document.getElementById('branch-setting-contact').value = branch.contact_number || '';
  document.getElementById('branch-setting-address').value = branch.address        || '';
}

async function saveBranchSettings() {
  const sel     = document.getElementById('branch-setting-select');
  const id      = parseInt(sel?.value);
  const contact = document.getElementById('branch-setting-contact').value.trim();
  const address = document.getElementById('branch-setting-address').value.trim();

  if (!id) { showToast('Please select a branch.', 'error'); return; }

  const branch = _branches.find(b => b.id === id);
  const name   = branch?.name || '';

  await DB.updateBranch(id, {
    contact_number: contact || null,
    address:        address || null
  });

  await logAudit('EDIT_BRANCH', 'Branch',
    `Updated branch "${name}" — Contact: ${contact || 'N/A'}, Address: ${address || 'N/A'}`,
    { branch_id: id, name, contact_number: contact, address });

  showToast('Branch info saved!', 'success');
  _branches = await DB.getBranches();
  renderBranchSelector();
  await populateBranchSettingsDropdown();
}

async function saveAdminProfile() {
  const user     = getCurrentUser();
  const fullname = document.getElementById('profile-fullname')?.value.trim();
  const email    = document.getElementById('profile-email')?.value.trim().toLowerCase();
  const contact  = document.getElementById('profile-contact')?.value.trim();
  if (!fullname) { showToast('Full name is required.', 'error'); return; }
  await DB.updateUser(user.id, { fullname, email: email || null, contact_number: contact || null });
  const updated = { ...user, fullname, email: email || null, contact_number: contact || null };
  sessionStorage.setItem('pos_current_user', JSON.stringify(updated));
  document.getElementById('admin-name').textContent = fullname;
  await logAudit('EDIT_PROFILE', 'Settings', `Admin updated their profile`, { user_id: user.id });
  showToast('✅ Profile updated!', 'success');
}

async function loadAdminProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const users = await DB.getUsers();
  const me = users.find(u => u.id === user.id);
  if (!me) return;
  const fn = document.getElementById('profile-fullname');
  const em = document.getElementById('profile-email');
  const co = document.getElementById('profile-contact');
  if (fn) fn.value = me.fullname || '';
  if (em) em.value = me.email || '';
  if (co) co.value = me.contact_number || '';
}

async function saveSettings() {
  const val = parseInt(document.getElementById('setting-threshold').value);
  if (isNaN(val) || val < 1) { showToast('Enter a valid number (min 1).', 'error'); return; }
  await DB.setSetting('stock_threshold', val);
  await getStockThreshold();
  await logAudit('EDIT_SETTINGS', 'Settings', `Changed stock alert threshold to ${val} units`, { threshold: val });
  showToast(`Stock threshold updated to ${val}!`, 'success');
  renderInventory(); renderPOSItems();
}

// ============================================================
//  PASSWORD VISIBILITY TOGGLES
// ============================================================
function togglePasswordVisibility() {
  const input = document.getElementById('user-password');
  const btn   = document.getElementById('pw-toggle');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁️';
  btn.style.color = isHidden ? 'var(--accent)' : 'var(--text-secondary)';
}
function toggleAdminPwVisibility() {
  const input = document.getElementById('admin-confirm-password');
  const btn   = document.getElementById('admin-pw-toggle');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁️';
  btn.style.color = isHidden ? 'var(--accent)' : 'var(--text-secondary)';
}
function toggleChpwEye(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁️';
}
function clearChpwForm() {
  ['chpw-old','chpw-new','chpw-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.type = 'password'; }
  });
  document.getElementById('chpw-error').style.display   = 'none';
  document.getElementById('chpw-success').style.display = 'none';
}

async function changeAdminPassword() {
  const errEl  = document.getElementById('chpw-error');
  const okEl   = document.getElementById('chpw-success');
  const oldPw  = document.getElementById('chpw-old').value;
  const newPw  = document.getElementById('chpw-new').value;
  const confPw = document.getElementById('chpw-confirm').value;
  errEl.style.display = 'none'; okEl.style.display = 'none';

  if (!oldPw || !newPw || !confPw) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return; }
  if (newPw.length < 8)            { errEl.textContent = 'New password must be at least 8 characters.'; errEl.style.display = 'block'; return; }
  if (newPw !== confPw)            { errEl.textContent = 'New passwords do not match.'; errEl.style.display = 'block'; return; }
  if (oldPw === newPw)             { errEl.textContent = 'New password must be different from current.'; errEl.style.display = 'block'; return; }

  const user = getCurrentUser();
  try {
    await DB.verifyCurrentPassword(oldPw);
  } catch (e) {
    errEl.textContent = 'Current password is incorrect.';
    errEl.style.display = 'block';
    return;
  }

  await DB.updateUser(user.id, { password: newPw });
  await logAudit('CHANGE_PASSWORD', 'Auth', 'Admin changed their account password.', { user_id: user.id });
  okEl.textContent = '✅ Password updated successfully!';
  okEl.style.display = 'block';
  ['chpw-old','chpw-new','chpw-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.type = 'password'; }
  });
}

function _escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function _downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function renderAuditLog() {
  const tbody = document.getElementById('audit-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">Loading...</td></tr>`;

  try {
    const search = document.getElementById('audit-search')?.value.trim() || '';
    const role = document.getElementById('audit-role')?.value || '';
    const category = document.getElementById('audit-category')?.value || '';
    const dateFrom = document.getElementById('audit-from')?.value || '';
    const dateTo = document.getElementById('audit-to')?.value || '';

    const rows = await getAuditLogs({ search, role, category, dateFrom, dateTo });

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No audit logs found.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(row => `
      <tr>
        <td>${_escapeHtml(formatDateTime(row.datetime))}</td>
        <td>
          <div style="font-weight:700;">${_escapeHtml(row.fullname || 'Unknown User')}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">@${_escapeHtml(row.username || 'unknown')}</div>
        </td>
        <td style="text-transform:capitalize;">${_escapeHtml(row.role || '—')}</td>
        <td>${_escapeHtml(row.category || '—')}</td>
        <td><span class="audit-action">${_escapeHtml(row.action || '—')}</span></td>
        <td>${_escapeHtml(row.description || '—')}</td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--accent-red);padding:24px;">Failed to load audit logs.</td></tr>`;
    showToast(`Failed to load audit logs: ${error.message}`, 'error');
  }
}

async function exportAuditLog() {
  try {
    const search = document.getElementById('audit-search')?.value.trim() || '';
    const role = document.getElementById('audit-role')?.value || '';
    const category = document.getElementById('audit-category')?.value || '';
    const dateFrom = document.getElementById('audit-from')?.value || '';
    const dateTo = document.getElementById('audit-to')?.value || '';

    const rows = await getAuditLogs({ search, role, category, dateFrom, dateTo });
    _downloadCsv(
      `audit_log_${todayStr()}.csv`,
      ['Date & Time', 'Full Name', 'Username', 'Role', 'Category', 'Action', 'Description'],
      rows.map(row => [
        formatDateTime(row.datetime),
        row.fullname || '',
        row.username || '',
        row.role || '',
        row.category || '',
        row.action || '',
        row.description || ''
      ])
    );
    showToast('Audit log exported.', 'success');
  } catch (error) {
    showToast(`Failed to export audit logs: ${error.message}`, 'error');
  }
}

async function renderLoginLogs() {
  const tbody = document.getElementById('loginlogs-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">Loading...</td></tr>`;

  try {
    const search = document.getElementById('ll-search')?.value.trim() || '';
    const role = document.getElementById('ll-role')?.value || '';
    const actionFilter = document.getElementById('ll-action')?.value || '';
    const dateFrom = document.getElementById('ll-from')?.value || '';
    const dateTo = document.getElementById('ll-to')?.value || '';

    let rows = await getAuditLogs({ search, role, category: 'Auth', dateFrom, dateTo });
    rows = rows.filter(row => ['LOGIN', 'LOGOUT'].includes(row.action));
    if (actionFilter) rows = rows.filter(row => row.action === actionFilter);

    const today = todayStr();
    const todayRows = rows.filter(row => (row.datetime || '').slice(0, 10) === today);
    const cashierToday = todayRows.filter(row => row.action === 'LOGIN' && row.role === 'cashier').length;
    const staffToday = todayRows.filter(row => row.action === 'LOGIN' && row.role === 'staff').length;
    const totalToday = todayRows.filter(row => row.action === 'LOGIN').length;

    const latestByUser = new Map();
    rows.forEach(row => {
      const key = row.username || row.fullname || `${row.actor_user_id || ''}`;
      if (!latestByUser.has(key)) latestByUser.set(key, row);
    });
    const activeCount = [...latestByUser.values()].filter(row => row.action === 'LOGIN').length;

    const statToday = document.getElementById('ll-stat-today');
    const statCashier = document.getElementById('ll-stat-cashier');
    const statStaff = document.getElementById('ll-stat-staff');
    const statActive = document.getElementById('ll-stat-active');
    if (statToday) statToday.textContent = String(totalToday);
    if (statCashier) statCashier.textContent = String(cashierToday);
    if (statStaff) statStaff.textContent = String(staffToday);
    if (statActive) statActive.textContent = String(activeCount);

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No login history found.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(row => `
      <tr>
        <td>${_escapeHtml(formatDateTime(row.datetime))}</td>
        <td>
          <div style="font-weight:700;">${_escapeHtml(row.fullname || 'Unknown User')}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">@${_escapeHtml(row.username || 'unknown')}</div>
        </td>
        <td style="text-transform:capitalize;">${_escapeHtml(row.role || '—')}</td>
        <td><span class="audit-action">${_escapeHtml(row.action || '—')}</span></td>
        <td>${_escapeHtml(row.description || '—')}</td>
        <td>${_escapeHtml((row.datetime || '').slice(0, 10) === today ? 'Today' : formatDate(row.datetime))}</td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--accent-red);padding:24px;">Failed to load login history.</td></tr>`;
    showToast(`Failed to load login history: ${error.message}`, 'error');
  }
}

async function exportLoginLogs() {
  try {
    const search = document.getElementById('ll-search')?.value.trim() || '';
    const role = document.getElementById('ll-role')?.value || '';
    const actionFilter = document.getElementById('ll-action')?.value || '';
    const dateFrom = document.getElementById('ll-from')?.value || '';
    const dateTo = document.getElementById('ll-to')?.value || '';

    let rows = await getAuditLogs({ search, role, category: 'Auth', dateFrom, dateTo });
    rows = rows.filter(row => ['LOGIN', 'LOGOUT'].includes(row.action));
    if (actionFilter) rows = rows.filter(row => row.action === actionFilter);

    _downloadCsv(
      `login_history_${todayStr()}.csv`,
      ['Date & Time', 'Full Name', 'Username', 'Role', 'Action', 'Description'],
      rows.map(row => [
        formatDateTime(row.datetime),
        row.fullname || '',
        row.username || '',
        row.role || '',
        row.action || '',
        row.description || ''
      ])
    );
    showToast('Login history exported.', 'success');
  } catch (error) {
    showToast(`Failed to export login history: ${error.message}`, 'error');
  }
}

// ============================================================
//  SWEETALERT OVERRIDES
// ============================================================
async function terminateUser(id, fullname) {
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Terminate this account?',
      text: `${fullname} will no longer be able to log in.`,
      icon: 'warning',
      confirmButtonText: 'Terminate',
      confirmButtonColor: '#dc2626'
    });
    if (!proceed) return;
  }
  await DB.updateUser(id, { status: 'terminated' });
  await logAudit('TERMINATE_USER', 'Users', `Terminated account for "${fullname}"`, { user_id: id, fullname });
  showToast(`Account for "${fullname}" terminated.`, 'error');
  closeViewUserModal(); renderUsers();
}

async function reactivateUser(id, fullname) {
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Reactivate this account?',
      text: `${fullname} will be able to log in again.`,
      icon: 'question',
      confirmButtonText: 'Reactivate'
    });
    if (!proceed) return;
  }
  await DB.updateUser(id, { status: 'active' });
  await logAudit('REACTIVATE_USER', 'Users', `Reactivated account for "${fullname}"`, { user_id: id, fullname });
  showToast(`"${fullname}" account reactivated.`, 'success');
  closeViewUserModal(); renderUsers();
}

async function saveUser() {
  const id       = document.getElementById('user-id').value;
  const fullname = document.getElementById('user-fullname').value.trim();
  const username = document.getElementById('user-username').value.trim().toLowerCase();
  const password = document.getElementById('user-password').value;
  const role     = document.getElementById('user-role').value;
  const branchId = document.getElementById('user-branch')?.value || null;

  if (!fullname || !username) { showToast('Please fill in name and username.', 'error'); return; }
  if (!id && !password) { showToast('Password is required for new users.', 'error'); return; }
  if (password && password.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }

  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: id ? 'Save user changes?' : 'Create this user?',
      text: `${fullname} (${role}) will be ${id ? 'updated' : 'created'}.`,
      icon: 'question',
      confirmButtonText: id ? 'Save User' : 'Create User'
    });
    if (!proceed) return;
  }

  if (id) {
    const updates = { fullname, username, role, branch_id: branchId ? parseInt(branchId) : null };
    if (password) updates.password = password;
    await DB.updateUser(parseInt(id), updates);
    await logAudit('EDIT_USER', 'Users', `Updated user "${fullname}" (@${username}) - Role: ${role}`, { user_id: id, fullname, username, role });
    showToast(password ? 'User updated and password changed.' : 'User updated.', 'success');
  } else {
    const adminPassword = document.getElementById('admin-confirm-password').value;
    if (!adminPassword) { showToast('Please enter your admin password to create an account.', 'error'); return; }

    try {
      await DB.verifyCurrentPassword(adminPassword);
    } catch (e) {
      showToast('Incorrect admin password.', 'error');
      return;
    }

    const allUsers = await DB.getUsers();
    const existing = allUsers.find(u => u.username === username);
    if (existing) { showToast('Username already taken.', 'error'); return; }

    const result = await DB.addUser({
      fullname, username, password, role, status: 'active',
      branch_id: branchId ? parseInt(branchId) : null
    });
    if (!result) { showToast('Failed to create user. Try again.', 'error'); return; }

    const branch = _branches.find(b => b.id === parseInt(branchId));
    await logAudit('ADD_USER', 'Users',
      `Created new ${role} account for "${fullname}" (@${username}) - ${branch ? branch.name : 'No Branch'}`,
      { fullname, username, role, branch_id: branchId });
    showToast(`"${fullname}" account created.`, 'success');
  }
  closeUserModal(); renderUsers();
}

async function toggleUser(id, currentStatus, fullname) {
  if (currentStatus === 'terminated') { showToast('This account is terminated. Use the View dialog to reactivate it.', 'error'); return; }
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: `${newStatus === 'active' ? 'Enable' : 'Disable'} account?`,
      text: `${fullname} will be marked as ${newStatus}.`,
      icon: 'question',
      confirmButtonText: newStatus === 'active' ? 'Enable' : 'Disable'
    });
    if (!proceed) return;
  }
  await DB.updateUser(id, { status: newStatus });
  await logAudit(newStatus === 'active' ? 'ENABLE_USER' : 'DISABLE_USER', 'Users',
    `${newStatus === 'active' ? 'Enabled' : 'Disabled'} account for "${fullname}"`,
    { user_id: id, fullname, new_status: newStatus });
  renderUsers();
  showToast('User status updated.', 'info');
}

async function deleteUser(id, fullname, username) {
  if (window.swalPromptMatch) {
    const result = await window.swalPromptMatch({
      title: 'Delete this user permanently?',
      text: `Type "${username}" to confirm deletion.`,
      expectedValue: username,
      placeholder: `Type ${username}`,
      validationMessage: 'Username did not match.',
      confirmButtonText: 'Delete'
    });
    if (!result.confirmed) return;
  }
  try { await DB.deleteUser(id); } catch(e) { showToast('Failed to delete user: ' + e.message, 'error'); return; }
  await logAudit('DELETE_USER', 'Users', `Permanently deleted account for "${fullname}" (@${username})`, { user_id: id, fullname, username });
  showToast(`"${fullname}" account permanently deleted.`, 'info');
  renderUsers();
}

async function saveBranchSettings() {
  const sel     = document.getElementById('branch-setting-select');
  const id      = parseInt(sel?.value);
  const contact = document.getElementById('branch-setting-contact').value.trim();
  const address = document.getElementById('branch-setting-address').value.trim();

  if (!id) { showToast('Please select a branch.', 'error'); return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Save branch settings?',
      text: 'This will update the selected branch details.',
      icon: 'question',
      confirmButtonText: 'Save Branch'
    });
    if (!proceed) return;
  }

  const branch = _branches.find(b => b.id === id);
  const name   = branch?.name || '';

  await DB.updateBranch(id, {
    contact_number: contact || null,
    address: address || null
  });

  await logAudit('EDIT_BRANCH', 'Branch',
    `Updated branch "${name}" - Contact: ${contact || 'N/A'}, Address: ${address || 'N/A'}`,
    { branch_id: id, name, contact_number: contact, address });

  showToast('Branch info saved.', 'success');
  _branches = await DB.getBranches();
  renderBranchSelector();
  await populateBranchSettingsDropdown();
}

async function saveAdminProfile() {
  const user     = getCurrentUser();
  const fullname = document.getElementById('profile-fullname')?.value.trim();
  const email    = document.getElementById('profile-email')?.value.trim().toLowerCase();
  const contact  = document.getElementById('profile-contact')?.value.trim();
  if (!fullname) { showToast('Full name is required.', 'error'); return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Save profile changes?',
      text: 'Your admin profile will be updated.',
      icon: 'question',
      confirmButtonText: 'Save Profile'
    });
    if (!proceed) return;
  }
  await DB.updateUser(user.id, { fullname, email: email || null, contact_number: contact || null });
  const updated = { ...user, fullname, email: email || null, contact_number: contact || null };
  sessionStorage.setItem('pos_current_user', JSON.stringify(updated));
  document.getElementById('admin-name').textContent = fullname;
  await logAudit('EDIT_PROFILE', 'Settings', 'Admin updated their profile', { user_id: user.id });
  showToast('Profile updated.', 'success');
}

async function saveSettings() {
  const val = parseInt(document.getElementById('setting-threshold').value);
  if (isNaN(val) || val < 1) { showToast('Enter a valid number (min 1).', 'error'); return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Save system settings?',
      text: `Stock threshold will be changed to ${val} units.`,
      icon: 'question',
      confirmButtonText: 'Save Settings'
    });
    if (!proceed) return;
  }
  await DB.setSetting('stock_threshold', val);
  await getStockThreshold();
  await logAudit('EDIT_SETTINGS', 'Settings', `Changed stock alert threshold to ${val} units`, { threshold: val });
  showToast(`Stock threshold updated to ${val}.`, 'success');
  renderInventory(); renderPOSItems();
}

async function changeAdminPassword() {
  const errEl  = document.getElementById('chpw-error');
  const okEl   = document.getElementById('chpw-success');
  const oldPw  = document.getElementById('chpw-old').value;
  const newPw  = document.getElementById('chpw-new').value;
  const confPw = document.getElementById('chpw-confirm').value;
  errEl.style.display = 'none'; okEl.style.display = 'none';

  if (!oldPw || !newPw || !confPw) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return; }
  if (newPw.length < 8) { errEl.textContent = 'New password must be at least 8 characters.'; errEl.style.display = 'block'; return; }
  if (newPw !== confPw) { errEl.textContent = 'New passwords do not match.'; errEl.style.display = 'block'; return; }
  if (oldPw === newPw) { errEl.textContent = 'New password must be different from current.'; errEl.style.display = 'block'; return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Update your password?',
      text: 'This will change your admin login password.',
      icon: 'warning',
      confirmButtonText: 'Update Password'
    });
    if (!proceed) return;
  }

  const user = getCurrentUser();
  try {
    await DB.verifyCurrentPassword(oldPw);
  } catch (e) {
    errEl.textContent = 'Current password is incorrect.';
    errEl.style.display = 'block';
    return;
  }

  await DB.updateUser(user.id, { password: newPw });
  await logAudit('CHANGE_PASSWORD', 'Auth', 'Admin changed their account password.', { user_id: user.id });
  okEl.textContent = 'Password updated successfully.';
  okEl.style.display = 'block';
  ['chpw-old','chpw-new','chpw-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.type = 'password'; }
  });
}
