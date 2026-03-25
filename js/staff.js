// ============================================================
//  SwiftPOS — Staff Dashboard (Branch-Aware)
//  Features: Sales Overview, Stock Alerts (incl. Overstock),
//            Product Performance (Top/Slow/Dead), Date Filters
// ============================================================

let _staffBranchId  = null;
let _staffThreshold = 5;
let _stockFlowChart  = null;
let _salesTrendChart = null;
let _fastSlowChart   = null;
let _turnoverChart   = null;
let _catRevenueChart    = null;
let _catUnitsChart      = null;
let _catStockValueChart = null;

// Date filter state
let _dashPeriod = 'today';
let _dashFrom   = null;
let _dashTo     = null;

// Product performance tab state
let _perfTab = 'top';
let _allItems = [];
let _allSales = [];

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuthAsync('staff');
  if (!user) return;
  document.getElementById('staff-name').textContent = user.fullname;

  const users = await DB.getUsers();
  const me    = users.find(u => u.id === user.id);
  _staffBranchId = me?.branch_id || null;

  const branches = await DB.getBranches();
  const branch   = branches.find(b => b.id === _staffBranchId);
  const roleEl   = document.querySelector('.user-role');
  if (roleEl) roleEl.textContent = branch ? `Staff — ${branch.name}` : 'Staff Member';

  await getStockThreshold();
  _staffThreshold = stockThreshold();
  await checkLowStock(_staffBranchId);
  await updateNotifBadge(_staffBranchId);

  // Set default custom date inputs to today
  const today = todayStr();
  const el = document.getElementById('dash-from');
  const el2 = document.getElementById('dash-to');
  if (el) el.value = today;
  if (el2) el2.value = today;

  await renderStaffDashboard();
  setDefaultDates();

  setInterval(async () => {
    await checkLowStock(_staffBranchId);
    await updateNotifBadge(_staffBranchId);
    if (document.getElementById('sec-dashboard')?.classList.contains('active')) {
      await renderStaffDashboard();
    }
  }, 60000);
});

// ── showSection ───────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById(`sec-${name}`);
  if (target) target.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', inventory: 'Inventory', sales: 'Stock Verify',
    reports: 'Reports', history: 'Sale History', requests: 'Stock Requests', activitylog: 'Activity Log'
  };
  const titleEl = document.getElementById('section-title');
  if (titleEl) titleEl.textContent = titles[name] || name;

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick')?.includes(`'${name}'`)) n.classList.add('active');
  });

  if (name === 'dashboard') renderStaffDashboard();
  if (name === 'inventory') renderInventory();
  if (name === 'sales')     { renderCatPills(); renderPOSItems(); }
  if (name === 'history')   renderHistory();
  if (name === 'requests')  renderRequests();
  if (name === 'reports')   generateReport();
  if (name === 'activitylog') renderInventoryActivity();
}

// ── DATE FILTER CONTROLS ──────────────────────────────────────
function setDashPeriod(period, btn) {
  _dashPeriod = period;
  document.querySelectorAll('.dash-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const customRange = document.getElementById('dash-custom-range');
  if (period === 'custom') {
    customRange.style.display = 'flex';
    return; // wait for date inputs
  } else {
    customRange.style.display = 'none';
  }

  const labels = { today: 'Today', week: 'This Week', month: 'This Month' };
  const labelEl = document.getElementById('dash-period-label');
  if (labelEl) labelEl.textContent = 'Showing: ' + (labels[period] || period);

  renderStaffDashboard();
}

function applyCustomPeriod() {
  const from = document.getElementById('dash-from')?.value;
  const to   = document.getElementById('dash-to')?.value;
  if (!from || !to) return;
  _dashFrom = from; _dashTo = to;
  const labelEl = document.getElementById('dash-period-label');
  if (labelEl) labelEl.textContent = `Showing: ${from} → ${to}`;
  renderStaffDashboard();
}

// Returns [fromDateStr, toDateStr] for the current period
function _getPeriodRange() {
  const today = todayStr();
  if (_dashPeriod === 'today')  return [today, today];
  if (_dashPeriod === 'week') {
    const d = new Date(); d.setDate(d.getDate() - 6);
    return [d.toISOString().slice(0,10), today];
  }
  if (_dashPeriod === 'month') {
    const d = new Date(); d.setDate(1);
    return [d.toISOString().slice(0,10), today];
  }
  if (_dashPeriod === 'custom' && _dashFrom && _dashTo) return [_dashFrom, _dashTo];
  return [today, today];
}

// ── PRODUCT PERFORMANCE TAB SWITCHER ─────────────────────────
function setPerfTab(tab, btn) {
  _perfTab = tab;
  document.querySelectorAll('.perf-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.perf-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(`perf-${tab}`);
  if (panel) panel.style.display = '';
}

// ============================================================
//  MAIN DASHBOARD RENDERER
// ============================================================
async function renderStaffDashboard() {
  const [items, sales, auditLogs] = await Promise.all([
    DB.getItems(_staffBranchId),
    DB.getSales(_staffBranchId),
    getAuditLogs({ dateFrom: _sevenDaysAgo() })
  ]);

  _allItems = items;
  _allSales = sales;

  const [fromDate, toDate] = _getPeriodRange();
  const periodSales = sales.filter(s => {
    const d = s.datetime.slice(0,10);
    return d >= fromDate && d <= toDate;
  });

  _renderKPIs(items, periodSales);
  _renderSalesOverview(sales);
  _renderStockAlerts(items);
  _renderStockFlowChart(sales, fromDate, toDate);
  _renderProductPerformance(items, sales);
  _renderSalesTrendChart(sales, fromDate, toDate);
  _renderFastSlowChart(items, sales, fromDate, toDate);
  _renderTurnoverChart(items, sales, fromDate, toDate);
  _renderCategoryCharts(items, sales, fromDate, toDate);
  renderInventoryActivity();
  _renderStockMovements(auditLogs);
  _renderRecentOrders(sales);
  _renderUserActivity(auditLogs);

  // Update chart period label
  const chartLabel = document.getElementById('chart-period-label');
  if (chartLabel) {
    const labels = { today: 'Today', week: 'Last 7 Days', month: 'This Month', custom: `${fromDate} → ${toDate}` };
    chartLabel.textContent = labels[_dashPeriod] || 'Last 7 Days';
  }
}

// ── KPI CARDS ─────────────────────────────────────────────────
function _renderKPIs(items, periodSales) {
  const invValue    = items.reduce((s,i) => s + parseFloat(i.price||0) * (i.stock||0), 0);
  const periodRev   = periodSales.reduce((s,x) => s + x.total, 0);
  const periodItems = periodSales.reduce((s,x) => s + x.items.reduce((a,i)=>a+i.qty,0), 0);
  const avgPerOrder = periodSales.length ? (periodItems / periodSales.length).toFixed(1) : '0';

  document.getElementById('kpi-total-products').textContent  = items.length.toLocaleString();
  document.getElementById('kpi-total-units-sub').textContent = items.reduce((s,i)=>s+i.stock,0).toLocaleString() + ' total units';
  document.getElementById('kpi-inv-value').textContent       = formatCurrency(invValue);
  document.getElementById('kpi-period-sales').textContent    = formatCurrency(periodRev);
  document.getElementById('kpi-period-orders').textContent   = `${periodSales.length} orders`;
  document.getElementById('kpi-period-items').textContent    = periodItems.toLocaleString();
  document.getElementById('kpi-period-avg').textContent      = `${avgPerOrder} avg per order`;
}

// ── SALES OVERVIEW (always fixed: today/week/month/all) ───────
function _renderSalesOverview(allSales) {
  const today     = todayStr();
  const weekStart = (() => { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })();
  const monthStart= (() => { const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); })();

  const filter = (from, to) => allSales.filter(s => { const d=s.datetime.slice(0,10); return d>=from && d<=to; });

  const todaySales  = filter(today, today);
  const weekSales   = filter(weekStart, today);
  const monthSales  = filter(monthStart, today);

  const rev = arr => arr.reduce((s,x)=>s+x.total,0);

  document.getElementById('sov-today').textContent         = formatCurrency(rev(todaySales));
  document.getElementById('sov-today-orders').textContent  = `${todaySales.length} orders`;
  document.getElementById('sov-week').textContent          = formatCurrency(rev(weekSales));
  document.getElementById('sov-week-orders').textContent   = `${weekSales.length} orders`;
  document.getElementById('sov-month').textContent         = formatCurrency(rev(monthSales));
  document.getElementById('sov-month-orders').textContent  = `${monthSales.length} orders`;
  document.getElementById('sov-total-orders').textContent  = allSales.length.toLocaleString();
  document.getElementById('sov-total-rev').textContent     = formatCurrency(rev(allSales));
}

// ── STOCK ALERTS (Low + Out + Overstock) ─────────────────────
function _renderStockAlerts(items) {
  const OVERSTOCK = 100;
  const lowItems   = items.filter(i => i.stock > 0 && i.stock <= _staffThreshold);
  const outItems   = items.filter(i => i.stock === 0);
  const overItems  = items.filter(i => i.stock > OVERSTOCK);
  const total      = lowItems.length + outItems.length + overItems.length;

  document.getElementById('alerts-total-badge').textContent = `${total} alert${total!==1?'s':''}`;

  // Low stock
  document.getElementById('alert-low-count').textContent = lowItems.length;
  document.getElementById('alert-low-items').textContent = lowItems.length
    ? lowItems.slice(0,3).map(i=>`${i.emoji||'🏷️'} ${i.name} (${i.stock})`).join(', ') + (lowItems.length>3?`… +${lowItems.length-3} more`:'')
    : 'All good ✓';

  // Out of stock
  document.getElementById('alert-out-count').textContent = outItems.length;
  document.getElementById('alert-out-items').textContent = outItems.length
    ? outItems.slice(0,3).map(i=>`${i.emoji||'🏷️'} ${i.name}`).join(', ') + (outItems.length>3?`… +${outItems.length-3} more`:'')
    : 'All in stock ✓';

  // Overstock
  document.getElementById('alert-over-count').textContent = overItems.length;
  document.getElementById('alert-over-items').textContent = overItems.length
    ? overItems.slice(0,3).map(i=>`${i.emoji||'🏷️'} ${i.name} (${i.stock})`).join(', ') + (overItems.length>3?`… +${overItems.length-3} more`:'')
    : 'None ✓';
}

// ── STOCK FLOW CHART (respects period) ───────────────────────
function _renderStockFlowChart(allSales, fromDate, toDate) {
  // Build day-by-day labels between fromDate and toDate (max 31 days)
  const labels = [], stockInData = [], stockOutData = [];
  const from = new Date(fromDate), to = new Date(toDate);
  const diffDays = Math.round((to - from) / 86400000) + 1;
  const maxDays  = Math.min(diffDays, 31);

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(from); d.setDate(from.getDate() + i);
    const dateStr = d.toISOString().slice(0,10);
    labels.push(d.toLocaleDateString('en-PH', { month:'short', day:'numeric' }));
    const daySales = allSales.filter(s => s.datetime.slice(0,10) === dateStr);
    stockOutData.push(daySales.reduce((s,sale)=>s+sale.items.reduce((a,it)=>a+it.qty,0),0));
    stockInData.push(0);
  }

  // Fetch restock data
  getAuditLogs({ category: 'Inventory', dateFrom: fromDate, dateTo: toDate }).then(data => {
    const restocks = (data || []).filter(r => r.action === 'RESTOCK_ITEM');
    if (restocks.length) {
      for (let i = 0; i < maxDays; i++) {
        const d = new Date(from); d.setDate(from.getDate() + i);
        const dateStr = d.toISOString().slice(0,10);
        stockInData[i] = restocks.filter(r=>r.datetime.slice(0,10)===dateStr)
          .reduce((s,r)=>s+((r.meta?.added)||0),0);
      }
      if (_stockFlowChart) { _stockFlowChart.data.datasets[0].data=[...stockInData]; _stockFlowChart.update(); }
    }
  });

  const ctx = document.getElementById('stockFlowChart')?.getContext('2d');
  if (!ctx) return;
  if (_stockFlowChart) { _stockFlowChart.destroy(); _stockFlowChart = null; }

  _stockFlowChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label:'Stock In (Restock)', data:[...stockInData], backgroundColor:'rgba(22,163,74,0.7)', borderRadius:6, borderSkipped:false },
        { label:'Stock Out (Sold)',   data:[...stockOutData], backgroundColor:'rgba(59,111,240,0.7)', borderRadius:6, borderSkipped:false }
      ]
    },
    options: {
      responsive:true,
      plugins: {
        legend:{ position:'top', labels:{ font:{family:'Plus Jakarta Sans',size:11}, usePointStyle:true, pointStyle:'circle' } },
        tooltip:{ backgroundColor:'#fff', borderColor:'#e2e8f0', borderWidth:1, titleColor:'#0f172a', bodyColor:'#475569', padding:10 }
      },
      scales: {
        x:{ grid:{display:false}, ticks:{color:'#94a3b8',font:{size:11}} },
        y:{ grid:{color:'#f1f4f9'}, ticks:{color:'#94a3b8',font:{size:11},stepSize:1}, beginAtZero:true }
      }
    }
  });
}

// ── PRODUCT PERFORMANCE (Top / Slow / Dead) ───────────────────
function _renderProductPerformance(items, allSales) {
  const [fromDate, toDate] = _getPeriodRange();
  const periodSales = allSales.filter(s=>{ const d=s.datetime.slice(0,10); return d>=fromDate&&d<=toDate; });

  // Build sold qty map from period sales
  const soldMap = {};
  periodSales.forEach(s => s.items.forEach(i => {
    soldMap[i.name] = (soldMap[i.name] || 0) + i.qty;
  }));

  // Top sellers
  const topSorted = Object.entries(soldMap).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const maxQty    = topSorted[0]?.[1] || 1;
  const medals    = ['🥇','🥈','🥉'];
  const topContainer = document.getElementById('top-sellers-list');
  if (topContainer) {
    topContainer.innerHTML = topSorted.length
      ? topSorted.map(([name,qty],i) => {
          const item = items.find(it=>it.name===name);
          return `<div class="top-seller-item">
            <span class="seller-rank">${medals[i]||`<span style="font-size:0.75rem;color:var(--text-muted);">#${i+1}</span>`}</span>
            <div class="seller-info">
              <div class="seller-name">${item?.emoji||'🏷️'} ${name}</div>
              <div class="seller-bar-wrap"><div class="seller-bar" style="width:${Math.round((qty/maxQty)*100)}%"></div></div>
            </div>
            <span class="seller-sold">${qty} sold</span>
          </div>`;
        }).join('')
      : '<div class="inv-empty">No sales in this period.</div>';
  }

  // Slow movers — have stock, sold less than 3 in period, not zero sales
  const slowContainer = document.getElementById('slow-movers-list');
  if (slowContainer) {
    const slowItems = items
      .filter(i => i.stock > 0)
      .map(i => ({ ...i, sold: soldMap[i.name] || 0 }))
      .filter(i => i.sold > 0 && i.sold < 3)
      .sort((a,b) => a.sold - b.sold)
      .slice(0, 7);
    slowContainer.innerHTML = slowItems.length
      ? slowItems.map(i => `
          <div class="top-seller-item">
            <span class="seller-rank">🐢</span>
            <div class="seller-info">
              <div class="seller-name">${i.emoji||'🏷️'} ${i.name}</div>
              <div class="seller-bar-wrap"><div class="seller-bar" style="width:${Math.round((i.sold/3)*100)}%;background:linear-gradient(90deg,#f59e0b,#fbbf24);"></div></div>
            </div>
            <span class="slow-badge">${i.sold} sold</span>
          </div>`)
        .join('')
      : '<div class="inv-empty">No slow-moving items in this period.</div>';
  }

  // Dead stock — have stock but ZERO sales in period
  const deadContainer = document.getElementById('dead-stock-list');
  if (deadContainer) {
    const deadItems = items
      .filter(i => i.stock > 0 && !soldMap[i.name])
      .sort((a,b) => b.stock - a.stock)
      .slice(0, 7);
    deadContainer.innerHTML = deadItems.length
      ? deadItems.map(i => `
          <div class="top-seller-item">
            <span class="seller-rank">💀</span>
            <div class="seller-info">
              <div class="seller-name">${i.emoji||'🏷️'} ${i.name}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">Stock: ${i.stock} · ${i.category}</div>
            </div>
            <span class="dead-badge">0 sold</span>
          </div>`)
        .join('')
      : '<div class="inv-empty">No dead stock — great! 🎉</div>';
  }
}

// ── STOCK MOVEMENTS ───────────────────────────────────────────
function _renderStockMovements(logs) {
  const container = document.getElementById('stock-movements-list');
  const invLogs = logs.filter(l => l.category === 'Inventory').slice(0, 8);
  if (!invLogs.length) { container.innerHTML = '<div class="inv-empty">No recent stock activity.</div>'; return; }
  const icons = {
    'RESTOCK_ITEM':    { icon:'📦', cls:'dot-green',  label:'Restocked',  cc:'change-pos' },
    'ADD_ITEM':        { icon:'✨', cls:'dot-blue',   label:'Item Added',  cc:'change-pos' },
    'UPDATE_ITEM':     { icon:'✏️', cls:'dot-blue',   label:'Updated',    cc:'' },
    'DELETE_ITEM':     { icon:'🗑️', cls:'dot-red',    label:'Deleted',    cc:'change-neg' },
    'RESOLVE_REQUEST': { icon:'✔️', cls:'dot-orange', label:'Resolved',   cc:'' },
    'REQUEST_RESTOCK': { icon:'📢', cls:'dot-orange', label:'Requested',  cc:'' },
  };
  container.innerHTML = invLogs.map(log => {
    const cfg  = icons[log.action] || { icon:'📋', cls:'dot-blue', label:log.action, cc:'' };
    const meta = log.meta || {};
    const chg  = meta.added ? `+${meta.added}` : (meta.new_stock ? `→${meta.new_stock}` : '');
    return `<div class="movement-item">
      <div class="movement-dot ${cfg.cls}">${cfg.icon}</div>
      <div class="movement-info">
        <div class="movement-name">${meta.item_name||log.description?.split('"')[1]||cfg.label}</div>
        <div class="movement-meta">${cfg.label} · ${_timeAgo(log.datetime)} · ${log.fullname||log.username}</div>
      </div>
      ${chg?`<span class="movement-change ${cfg.cc}">${chg}</span>`:''}
    </div>`;
  }).join('');
}

// ── RECENT ORDERS ─────────────────────────────────────────────
function _renderRecentOrders(allSales) {
  const container  = document.getElementById('recent-orders-list');
  const todaySales = allSales.filter(s=>s.datetime.slice(0,10)===todayStr())
    .sort((a,b)=>new Date(b.datetime)-new Date(a.datetime)).slice(0,8);
  const badge = document.getElementById('orders-badge');
  if (badge) badge.textContent = `${todaySales.length} today`;
  if (!todaySales.length) { container.innerHTML = '<div class="inv-empty">No orders today yet.</div>'; return; }
  container.innerHTML = todaySales.map(s => {
    const shortId   = s.id.replace('TXN-','').slice(0,12);
    const timeLabel = new Date(s.datetime).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
    return `<div class="order-item">
      <span class="order-id">#${shortId}</span>
      <div class="order-info">
        <div class="order-cashier">${s.cashierName||s.cashier}</div>
        <div class="order-time">${timeLabel} · ${s.items.length} item(s)</div>
      </div>
      <span class="order-amount">${formatCurrency(s.total)}</span>
      <span class="order-status status-${s.status||'completed'}">${s.status||'completed'}</span>
    </div>`;
  }).join('');
}

// ── USER ACTIVITY ─────────────────────────────────────────────
function _renderUserActivity(logs) {
  const container = document.getElementById('user-activity-list');
  if (!container) return;
  const recent    = logs.slice(0, 8);
  if (!recent.length) { container.innerHTML = '<div class="inv-empty">No recent activity.</div>'; return; }
  container.innerHTML = recent.map(log => {
    const cls      = log.role==='admin'?'av-admin':log.role==='cashier'?'av-cashier':log.role==='staff'?'av-staff':'av-system';
    const initials = (log.fullname||log.username||'S').charAt(0).toUpperCase();
    const desc     = (log.description||log.action||'').slice(0,60)+((log.description?.length>60)?'…':'');
    return `<div class="activity-item">
      <div class="activity-avatar ${cls}">${initials}</div>
      <div class="activity-text">
        <div class="activity-action">${desc}</div>
        <div class="activity-time">${_timeAgo(log.datetime)} · ${log.fullname||log.username}</div>
      </div>
    </div>`;
  }).join('');
}

// ── HELPERS ───────────────────────────────────────────────────
function _sevenDaysAgo() {
  const d = new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10);
}
function _timeAgo(dateStr) {
  const diff = Math.floor((new Date()-new Date(dateStr))/1000);
  if (diff<60) return 'just now';
  if (diff<3600) return Math.floor(diff/60)+'m ago';
  if (diff<86400) return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}
function setDefaultDates() {
  const today   = todayStr();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-6);
  const fromEl  = document.getElementById('rep-from');
  const toEl    = document.getElementById('rep-to');
  if (fromEl) fromEl.value = weekAgo.toISOString().slice(0,10);
  if (toEl)   toEl.value   = today;
}

// ── CLOCK & DATE ──────────────────────────────────────────────
function updateClock() {
  const now = new Date();

  // Time — e.g. "02:45:30 PM"
  const timeEl = document.getElementById('current-time');
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-PH', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  }

  // Date — e.g. "Friday, March 06, 2026"
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
    });
  }
}
updateClock();
setInterval(updateClock, 1000);
// ============================================================
//  SALES TREND CHART (Daily bar chart)
// ============================================================
function _renderSalesTrendChart(allSales, fromDate, toDate) {
  const ctx = document.getElementById('salesTrendChart')?.getContext('2d');
  if (!ctx) return;

  // Build date range array
  const dates = [];
  const cur = new Date(fromDate);
  const end = new Date(toDate);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }

  // Sum revenue per day
  const revenueByDay = {};
  dates.forEach(d => revenueByDay[d] = 0);
  allSales.forEach(s => {
    const d = s.datetime.slice(0, 10);
    if (revenueByDay[d] !== undefined) revenueByDay[d] += s.total;
  });

  const labels = dates.map(d => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  });
  const values = dates.map(d => revenueByDay[d]);

  // Update label
  const lbl = document.getElementById('sales-trend-label');
  if (lbl) {
    const periodLabels = { today: 'Today', week: 'Last 7 Days', month: 'This Month', custom: `${fromDate} → ${toDate}` };
    lbl.textContent = periodLabels[_dashPeriod] || 'Last 7 Days';
  }

  if (_salesTrendChart) { _salesTrendChart.destroy(); _salesTrendChart = null; }
  _salesTrendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Daily Revenue (₱)',
        data: values,
        backgroundColor: 'rgba(59,111,240,0.25)',
        borderColor: 'rgba(59,111,240,0.9)',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(59,111,240,0.5)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => '₱' + parseFloat(ctx.raw).toLocaleString('en-PH', { minimumFractionDigits: 2 })
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        y: { grid: { color: '#f1f4f9' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => '₱' + v.toLocaleString() }, beginAtZero: true }
      }
    }
  });
}

// ============================================================
//  FAST VS SLOW MOVERS CHART (Horizontal bar)
// ============================================================
function _renderFastSlowChart(items, allSales, fromDate, toDate) {
  const ctx = document.getElementById('fastSlowChart')?.getContext('2d');
  if (!ctx) return;

  const periodSales = allSales.filter(s => {
    const d = s.datetime.slice(0, 10);
    return d >= fromDate && d <= toDate;
  });

  const soldMap = {};
  periodSales.forEach(s => s.items.forEach(i => {
    soldMap[i.name] = (soldMap[i.name] || 0) + i.qty;
  }));

  // Top 5 fast + top 5 slow (with any sales)
  const withSales = items
    .map(i => ({ name: i.name, sold: soldMap[i.name] || 0 }))
    .filter(i => i.sold > 0)
    .sort((a, b) => b.sold - a.sold);

  const fast = withSales.slice(0, 5);
  const slow = withSales.slice(-5).reverse();
  const combined = [...fast, ...slow];
  const uniqueMap = {};
  combined.forEach(i => uniqueMap[i.name] = i.sold);
  const entries = Object.entries(uniqueMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const labels = entries.map(([name]) => name.length > 14 ? name.slice(0, 13) + '…' : name);
  const values = entries.map(([, qty]) => qty);
  const maxVal = Math.max(...values, 1);
  const colors = values.map(v => v >= maxVal * 0.6
    ? 'rgba(34,197,94,0.7)'    // green = fast
    : v >= maxVal * 0.3
      ? 'rgba(249,115,22,0.7)' // orange = medium
      : 'rgba(239,68,68,0.7)'  // red = slow
  );

  if (_fastSlowChart) { _fastSlowChart.destroy(); _fastSlowChart = null; }
  _fastSlowChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Units Sold',
        data: values,
        backgroundColor: colors,
        borderRadius: 5,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw} units sold` } }
      },
      scales: {
        x: { grid: { color: '#f1f4f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
        y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }
      }
    }
  });
}

// ============================================================
//  INVENTORY TURNOVER CHART
//  Turnover = Units Sold / Avg Stock  (per item, top 8)
// ============================================================
function _renderTurnoverChart(items, allSales, fromDate, toDate) {
  const ctx = document.getElementById('turnoverChart')?.getContext('2d');
  if (!ctx) return;

  const periodSales = allSales.filter(s => {
    const d = s.datetime.slice(0, 10);
    return d >= fromDate && d <= toDate;
  });

  const soldMap = {};
  periodSales.forEach(s => s.items.forEach(i => {
    soldMap[i.name] = (soldMap[i.name] || 0) + i.qty;
  }));

  // Turnover rate = qty sold / current stock (if stock > 0)
  const turnoverData = items
    .filter(i => soldMap[i.name] && i.stock > 0)
    .map(i => ({
      name: i.name,
      rate: parseFloat((soldMap[i.name] / (i.stock + soldMap[i.name])).toFixed(2))
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);

  const labels = turnoverData.map(i => i.name.length > 14 ? i.name.slice(0, 13) + '…' : i.name);
  const values = turnoverData.map(i => i.rate);

  // Update label
  const lbl = document.getElementById('turnover-label');
  if (lbl) {
    const periodLabels = { today: 'Today', week: 'Last 7 Days', month: 'This Month', custom: `${fromDate} → ${toDate}` };
    lbl.textContent = periodLabels[_dashPeriod] || 'Last 7 Days';
  }

  if (_turnoverChart) { _turnoverChart.destroy(); _turnoverChart = null; }
  _turnoverChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Turnover Rate',
        data: values,
        backgroundColor: values.map(v =>
          v >= 0.6 ? 'rgba(34,197,94,0.75)'
          : v >= 0.3 ? 'rgba(249,115,22,0.75)'
          : 'rgba(239,68,68,0.75)'
        ),
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = (ctx.raw * 100).toFixed(0);
              return `Turnover: ${ctx.raw} (${pct}% of total stock sold)`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
        y: {
          grid: { color: '#f1f4f9' },
          ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => (v * 100).toFixed(0) + '%' },
          beginAtZero: true, max: 1
        }
      }
    }
  });
}

// ============================================================
//  CATEGORY PERFORMANCE CHARTS
// ============================================================
function _renderCategoryCharts(items, allSales, fromDate, toDate) {
  const CATS   = ['Fertilizers', 'Lubricants', 'Hardware', 'Feeds', 'Seeds', 'Chemicals', 'Others'];
  const COLORS = [
    'rgba(59,111,240,0.75)',
    'rgba(34,197,94,0.75)',
    'rgba(249,115,22,0.75)',
    'rgba(168,85,247,0.75)',
    'rgba(148,163,184,0.75)'
  ];
  const BORDERS = [
    'rgba(59,111,240,1)',
    'rgba(34,197,94,1)',
    'rgba(249,115,22,1)',
    'rgba(168,85,247,1)',
    'rgba(148,163,184,1)'
  ];

  const periodSales = allSales.filter(s => {
    const d = s.datetime.slice(0, 10);
    return d >= fromDate && d <= toDate;
  });

  // Build item → category map
  const itemCatMap = {};
  items.forEach(i => { itemCatMap[i.name] = i.category || 'Others'; });

  // Revenue & units sold per category
  const revenueMap = {};
  const unitsMap   = {};
  CATS.forEach(c => { revenueMap[c] = 0; unitsMap[c] = 0; });

  periodSales.forEach(s => s.items.forEach(i => {
    const cat = itemCatMap[i.name] || 'Others';
    if (!revenueMap[cat]) revenueMap[cat] = 0;
    if (!unitsMap[cat])   unitsMap[cat]   = 0;
    revenueMap[cat] += i.price * i.qty;
    unitsMap[cat]   += i.qty;
  }));

  // Stock value per category (price × stock)
  const stockValMap = {};
  CATS.forEach(c => { stockValMap[c] = 0; });
  items.forEach(i => {
    const cat = i.category || 'Others';
    if (!stockValMap[cat]) stockValMap[cat] = 0;
    stockValMap[cat] += (i.price || 0) * (i.stock || 0);
  });

  const revenueVals   = CATS.map(c => parseFloat((revenueMap[c] || 0).toFixed(2)));
  const unitsVals     = CATS.map(c => unitsMap[c] || 0);
  const stockValVals  = CATS.map(c => parseFloat((stockValMap[c] || 0).toFixed(2)));

  const donutOpts = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#64748b', padding: 12 } },
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct   = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            const val   = title === 'revenue' || title === 'stock'
              ? '₱' + ctx.raw.toLocaleString('en-PH', { minimumFractionDigits: 2 })
              : ctx.raw + ' units';
            return ` ${ctx.label}: ${val} (${pct}%)`;
          }
        }
      }
    }
  });

  // ── Revenue donut ──
  const ctx1 = document.getElementById('catRevenueChart')?.getContext('2d');
  if (ctx1) {
    if (_catRevenueChart) { _catRevenueChart.destroy(); _catRevenueChart = null; }
    _catRevenueChart = new Chart(ctx1, {
      type: 'doughnut',
      data: { labels: CATS, datasets: [{ data: revenueVals, backgroundColor: COLORS, borderColor: BORDERS, borderWidth: 2 }] },
      options: donutOpts('revenue')
    });
  }

  // ── Units sold bar ──
  const ctx2 = document.getElementById('catUnitsChart')?.getContext('2d');
  if (ctx2) {
    if (_catUnitsChart) { _catUnitsChart.destroy(); _catUnitsChart = null; }
    _catUnitsChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: CATS,
        datasets: [{ label: 'Units Sold', data: unitsVals, backgroundColor: COLORS, borderColor: BORDERS, borderWidth: 2, borderRadius: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw} units sold` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
          y: { grid: { color: '#f1f4f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true }
        }
      }
    });
  }

  // ── Stock value donut ──
  const ctx3 = document.getElementById('catStockValueChart')?.getContext('2d');
  if (ctx3) {
    if (_catStockValueChart) { _catStockValueChart.destroy(); _catStockValueChart = null; }
    _catStockValueChart = new Chart(ctx3, {
      type: 'doughnut',
      data: { labels: CATS, datasets: [{ data: stockValVals, backgroundColor: COLORS, borderColor: BORDERS, borderWidth: 2 }] },
      options: donutOpts('stock')
    });
  }
}

// ============================================================
//  RECENT INVENTORY ACTIVITY TABLE
// ============================================================
async function renderInventoryActivity() {
  const tbody   = document.getElementById('inventory-activity-body');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">Loading…</td></tr>`;

  const search    = document.getElementById('ia-search')?.value.toLowerCase()  || '';
  const actionFlt = document.getElementById('ia-action')?.value                || '';
  const dateFrom  = document.getElementById('ia-from')?.value                  || '';
  const dateTo    = document.getElementById('ia-to')?.value                    || '';

  // Fetch audit logs (inventory + sales categories)
  const data = await getAuditLogs({ dateFrom, dateTo });
  const filteredData = (data || []).filter(r => ['Inventory','Sales'].includes(r.category)).slice(0,300);

  const ACTION_MAP = {
    RESTOCK_ITEM:         { label: '📦 Stock Received',     cls: 'dot-green',  qtyKey: 'added'     },
    ADD_ITEM:             { label: '✨ Item Added',          cls: 'dot-blue',   qtyKey: null        },
    UPDATE_ITEM:          { label: '✏️ Adjustment',          cls: 'dot-blue',   qtyKey: 'new_stock' },
    EDIT_ITEM:            { label: '✏️ Item Edited',         cls: 'dot-blue',   qtyKey: 'new_stock' },
    DELETE_ITEM:          { label: '🗑️ Item Removed',        cls: 'dot-red',    qtyKey: null        },
    PROCESS_SALE:         { label: '🛒 Items Sold',          cls: 'dot-orange', qtyKey: 'items'     },
    REQUEST_RESTOCK:      { label: '📢 Restock Request',     cls: 'dot-orange', qtyKey: null        },
    RESOLVE_REQUEST:      { label: '✔️ Request Resolved',    cls: 'dot-green',  qtyKey: null        },
    RESOLVE_ALL_REQUESTS: { label: '✔️ All Requests Resolved', cls: 'dot-green', qtyKey: null       },
  };

  let rows = (filteredData || []).map(log => {
    const meta    = log.meta || {};
    const cfg     = ACTION_MAP[log.action] || { label: log.action, cls: 'dot-blue', qtyKey: null };
    const product = meta.item_name
      || log.description?.match(/"([^"]+)"/)?.[1]
      || meta.name
      || '—';
    let qty = '—';
    if (cfg.qtyKey === 'added'     && meta.added)     qty = `+${meta.added}`;
    if (cfg.qtyKey === 'new_stock' && meta.new_stock !== undefined) qty = `→ ${meta.new_stock}`;
    if (cfg.qtyKey === 'items'     && meta.items)     qty = `-${meta.items}`;
    return { ...log, _cfg: cfg, _product: product, _qty: qty };
  });

  // Filter
  if (actionFlt) rows = rows.filter(r => r.action === actionFlt);
  if (search)    rows = rows.filter(r =>
    r._product.toLowerCase().includes(search) ||
    (r.fullname  || '').toLowerCase().includes(search) ||
    (r.username  || '').toLowerCase().includes(search)
  );

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">No activity found.</td></tr>`;
    return;
  }

  const qtyColor = qty => {
    if (qty.startsWith('+')) return 'color:#22c55e;font-weight:700;';
    if (qty.startsWith('-')) return 'color:#ef4444;font-weight:700;';
    if (qty.startsWith('→')) return 'color:#f59e0b;font-weight:700;';
    return 'color:var(--text-muted);';
  };

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="font-size:0.78rem;white-space:nowrap;">${formatDateTime(r.datetime)}</td>
      <td style="font-weight:600;font-size:0.82rem;">${r._product}</td>
      <td><span class="audit-category-badge" style="font-size:0.72rem;">${r._cfg.label}</span></td>
      <td style="font-size:0.82rem;${qtyColor(r._qty)}">${r._qty}</td>
      <td>
        <div style="font-size:0.82rem;font-weight:600;">${r.fullname || '—'}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);">@${r.username || '—'}</div>
      </td>
      <td style="font-size:0.78rem;color:var(--text-secondary);max-width:220px;">${r.description || '—'}</td>
    </tr>
  `).join('');
}

async function exportInventoryActivity() {
  const search    = document.getElementById('ia-search')?.value.toLowerCase()  || '';
  const actionFlt = document.getElementById('ia-action')?.value                || '';
  const dateFrom  = document.getElementById('ia-from')?.value                  || '';
  const dateTo    = document.getElementById('ia-to')?.value                    || '';

  const allData = await getAuditLogs({ dateFrom, dateTo });
  let rows = (allData || []).filter(r => ['Inventory','Sales'].includes(r.category));
  if (actionFlt) rows = rows.filter(r => r.action === actionFlt);
  if (search) rows = rows.filter(r =>
    (r.meta?.item_name || '').toLowerCase().includes(search) ||
    (r.fullname || '').toLowerCase().includes(search)
  );

  const csv = [
    ['Date', 'Time', 'Product', 'Action', 'Qty Change', 'Staff', 'Username', 'Notes'],
    ...rows.map(r => {
      const meta = r.meta || {};
      const d    = new Date(r.datetime);
      const date = d.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' });
      const time = d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
      const product = meta.item_name || r.description?.match(/"([^"]+)"/)?.[1] || '—';
      const qty = meta.added ? `+${meta.added}` : meta.new_stock !== undefined ? `→${meta.new_stock}` : meta.items ? `-${meta.items}` : '—';
      return [date, time, product, r.action, qty, r.fullname || '—', r.username || '—', r.description || ''];
    })
  ].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `inventory_activity_${todayStr()}.csv`;
  a.click();
}
// ============================================================
//  STAFF — MANUAL STOCK REQUEST (saves to Supabase)
// ============================================================
async function openStaffRequestModal() {
  const sel = document.getElementById('staff-req-item');
  if (sel) {
    sel.innerHTML = '<option value="">— Select Item —</option>';
    const items = await DB.getItems(_staffBranchId);
    items.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i.id;
      opt.textContent = `${i.emoji || '🏷️'} ${i.name} (stock: ${i.stock})`;
      sel.appendChild(opt);
    });
  }
  document.getElementById('staff-request-modal').style.display = 'flex';
}

function closeStaffRequestModal() {
  document.getElementById('staff-request-modal').style.display = 'none';
  document.getElementById('staff-req-note').value = '';
  document.getElementById('staff-req-item').value = '';
}

async function submitStaffRequest() {
  const itemId = parseInt(document.getElementById('staff-req-item').value);
  const note   = document.getElementById('staff-req-note').value.trim();
  const user   = getCurrentUser();

  if (!itemId) { showToast('Please select an item.', 'error'); return; }

  const item = await DB.getItem(itemId);
  if (!item) { showToast('Item not found.', 'error'); return; }
  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Submit restock request?',
      text: `${item.name} will be added to pending stock requests.`,
      icon: 'question',
      confirmButtonText: 'Submit Request'
    });
    if (!proceed) return;
  }

  const submitBtn = document.querySelector('#staff-request-modal .btn-primary');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

  await DB.addRequest({
    itemId,
    itemName:        item.name,
    stock:           item.stock,
    type:            'manual-request',
    requestedBy:     user?.username || 'staff',
    requestedByName: user?.fullname || 'Staff',
    note:            note || 'Restock needed.',
    status:          'pending',
    datetime:        new Date().toISOString(),
    branchId:        _staffBranchId
  });

  await logAudit(
    'REQUEST_RESTOCK', 'Inventory',
    `Requested restock for "${item.name}" (current stock: ${item.stock}). Note: ${note || 'N/A'}`,
    { item_id: itemId, item_name: item.name, stock: item.stock }
  );

  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Request'; }

  closeStaffRequestModal();
  showToast('Restock request submitted!', 'success');
  await updateNotifBadge(_staffBranchId);
  renderRequests();
}
