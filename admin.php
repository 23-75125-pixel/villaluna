<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Villaluna General Merchandise — Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/bootstrap-ux.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<style>
  /* Audit Log Styles */
  .audit-category-badge {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 20px; font-size: 0.72rem; font-weight: 600;
  }
  .cat-auth      { background: rgba(139,92,246,0.15); color: #a78bfa; }
  .cat-sales     { background: rgba(34,197,94,0.15);  color: #22c55e; }
  .cat-inventory { background: rgba(249,115,22,0.15); color: #f97316; }
  .cat-users     { background: rgba(79,124,255,0.15); color: #4f7cff; }
  .cat-reports   { background: rgba(234,179,8,0.15);  color: #eab308; }
  .audit-action  {
    font-family: 'Courier New', monospace; font-size: 0.78rem;
    background: rgba(255,255,255,0.05); padding: 2px 8px;
    border-radius: 4px; color: var(--text-primary);
  }
  .audit-filters {
    display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px; margin-bottom: 16px;
  }
  .audit-filters .form-group { margin-bottom: 0; }

  /* ── Admin Dashboard Upgrades ── */
  .dash-filter-bar {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 12px;
    padding: 12px 18px; margin-bottom: 18px; box-shadow: var(--shadow-sm);
  }
  .dash-filter-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); white-space: nowrap; }
  .dash-filter-pills { display: flex; gap: 6px; }
  .dash-pill {
    padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border);
    background: var(--bg-card); font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);
    cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  .dash-pill:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .dash-pill.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 2px 8px rgba(59,111,240,0.25); }
  .dash-period-label { margin-left: auto; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; white-space: nowrap; }

  .admin-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .admin-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .adm-widget { background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-sm); }
  .adm-widget-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1.5px solid var(--border); background: var(--bg-card); }
  .adm-widget-title { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
  .adm-widget-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(59,111,240,0.1); color: var(--accent); }
  .adm-widget-body { padding: 16px 18px; }

  .sales-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .sales-ov-card { background: var(--bg-hover); border: 1.5px solid var(--border); border-radius: 12px; padding: 14px 16px; transition: background 0.15s; }
  .sales-ov-card:hover { background: var(--accent-light); }
  .sales-ov-card.accent-card { background: var(--accent-light); border-color: rgba(59,111,240,0.2); }
  .sales-ov-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .sales-ov-value { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; }
  .sales-ov-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; }

  .alert-row { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; margin-bottom: 8px; background: var(--bg-hover); border: 1px solid var(--border); transition: background 0.15s; }
  .alert-row:last-child { margin-bottom: 0; }
  .alert-row:hover { background: var(--accent-light); }
  .alert-icon-wrap { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
  .alert-icon-wrap.orange { background: var(--accent-orange-light); }
  .alert-icon-wrap.red    { background: var(--accent-red-light); }
  .alert-icon-wrap.blue   { background: var(--accent-light); }
  .alert-info { flex: 1; min-width: 0; }
  .alert-label { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
  .alert-items { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .alert-count { font-size: 1.05rem; font-weight: 800; flex-shrink: 0; min-width: 24px; text-align: right; }
  .alert-count.orange { color: var(--accent-orange); }
  .alert-count.red    { color: var(--accent-red); }
  .alert-count.blue   { color: var(--accent); }

  .perf-tabs { display: flex; gap: 4px; }
  .perf-tab { padding: 4px 10px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--bg-card); font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all 0.15s; font-family: inherit; }
  .perf-tab:hover { border-color: var(--accent); color: var(--accent); }
  .perf-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }

  .top-seller-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .top-seller-item:last-child { margin-bottom: 0; }
  .seller-rank { font-size: 1rem; width: 22px; text-align: center; flex-shrink: 0; }
  .seller-info { flex: 1; min-width: 0; }
  .seller-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .seller-bar-wrap { height: 4px; background: var(--bg-hover); border-radius: 10px; margin-top: 4px; overflow: hidden; }
  .seller-bar { height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--accent), #6899f8); transition: width 0.6s ease; }
  .seller-sold { font-size: 0.76rem; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }
  .dead-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; background: var(--accent-red-light); color: var(--accent-red); flex-shrink: 0; }
  .slow-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; background: var(--accent-orange-light); color: var(--accent-orange); flex-shrink: 0; }

  .activity-list { display: flex; flex-direction: column; gap: 8px; }
  .activity-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--bg-hover); border: 1px solid var(--border); }
  .activity-avatar { width: 30px; height: 30px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .av-staff   { background: linear-gradient(135deg, #ea6c00, #fb923c); }
  .av-admin   { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
  .av-cashier { background: linear-gradient(135deg, #b45309, #fbbf24); }
  .av-system  { background: linear-gradient(135deg, #475569, #94a3b8); }
  .activity-text { flex: 1; min-width: 0; }
  .activity-action { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
  .activity-time { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }
  .adm-empty { text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.83rem; }

  @media (max-width: 1100px) {
    .admin-2col, .admin-3col { grid-template-columns: 1fr; }
    .sales-overview-grid { grid-template-columns: 1fr 1fr; }
  }

  .datetime-display {
    display: flex; flex-direction: column; align-items: flex-end; gap: 1px;
    min-width: 160px; width: 160px;
  }
  .date-display {
    font-size: 0.72rem; color: var(--text-muted); font-weight: 500;
    letter-spacing: 0.02em; white-space: nowrap; text-align: right; width: 100%;
  }
</style>
</head>
<body class="dashboard-page">
<div class="app-layout">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <span class="brand-icon">⚡</span>
      <span>Villaluna General Merchandise</span>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active" onclick="showSection('dashboard')"><span class="nav-icon">🏠</span>Dashboard</a>
      <a href="#" class="nav-item" onclick="showSection('branches')"><span class="nav-icon">🏪</span>Branches</a>
      <a href="#" class="nav-item" onclick="showSection('inventory')"><span class="nav-icon">📦</span>Inventory</a>
      <a href="#" class="nav-item" onclick="showSection('sales')"><span class="nav-icon">🛒</span>POS Preview</a>
      <a href="#" class="nav-item" onclick="showSection('reports')"><span class="nav-icon">📊</span>Reports</a>
      <a href="#" class="nav-item" onclick="showSection('history')"><span class="nav-icon">🕑</span>Sale History</a>
      <a href="#" class="nav-item" onclick="showSection('cashierday')"><span class="nav-icon">📋</span>Cashier Daily Sales</a>
      <a href="#" class="nav-item" onclick="showSection('users')"><span class="nav-icon">👥</span>User Management</a>
      <a href="#" class="nav-item" onclick="showSection('requests')"><span class="nav-icon">🔔</span>Stock Requests <span id="req-badge" class="badge" style="display:none">0</span></a>
      <a href="#" class="nav-item" onclick="showSection('loginlogs')"><span class="nav-icon">🔐</span>Login History</a>
      <a href="#" class="nav-item" onclick="showSection('auditlog')"><span class="nav-icon">🗂️</span>Audit Log</a>
      <a href="#" class="nav-item" onclick="showSection('settings')"><span class="nav-icon">⚙️</span>Settings</a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-pill">
        <div class="user-avatar">A</div>
        <div>
          <div class="user-name" id="admin-name">Admin</div>
          <div class="user-role">Administrator</div>
        </div>
      </div>
      <button class="btn-logout" onclick="logout()">Logout</button>
    </div>
  </aside>

  <main class="main-content">
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;">
        <button class="sidebar-toggle" id="sidebar-toggle" onclick="toggleSidebar()" title="Menu">☰</button>
        <h2 id="section-title">Dashboard</h2>
      </div>
      <div class="topbar-right">
        <div id="branch-selector"></div>
        <div id="notif-bell" class="notif-bell" onclick="showSection('requests')">
          🔔 <span id="notif-count" class="notif-count" style="display:none">0</span>
        </div>
        <div class="datetime-display">
          <span id="current-date" class="date-display"></span>
          <span id="current-time" class="time-display"></span>
        </div>
      </div>
    </div>

    <!-- DASHBOARD -->
    <section id="sec-dashboard" class="section active">

      <!-- DATE FILTER BAR -->
      <div class="dash-filter-bar">
        <span class="dash-filter-label">📅 Period:</span>
        <div class="dash-filter-pills">
          <button class="dash-pill active" onclick="setAdminPeriod('today',this)">Today</button>
          <button class="dash-pill" onclick="setAdminPeriod('week',this)">This Week</button>
          <button class="dash-pill" onclick="setAdminPeriod('month',this)">This Month</button>
          <button class="dash-pill" onclick="setAdminPeriod('custom',this)">Custom</button>
        </div>
        <div id="admin-custom-range" style="display:none;align-items:center;gap:8px;">
          <input type="date" id="admin-dash-from" onchange="applyAdminCustomPeriod()">
          <span style="color:var(--text-muted);font-size:0.8rem;">to</span>
          <input type="date" id="admin-dash-to" onchange="applyAdminCustomPeriod()">
        </div>
        <span class="dash-period-label" id="admin-period-label">Showing: Today</span>
      </div>

      <!-- ROW 1: KPI Stats -->
      <div class="stats-grid">
        <div class="stat-card accent-green">
          <div class="stat-label">Today's Sales</div>
          <div class="stat-value" id="stat-today">₱0.00</div>
          <div class="stat-sub" id="stat-today-sub">+0 transactions</div>
        </div>
        <div class="stat-card accent-blue">
          <div class="stat-label">Period Revenue</div>
          <div class="stat-value" id="stat-period">₱0.00</div>
          <div class="stat-sub" id="stat-period-sub">selected period</div>
        </div>
        <div class="stat-card accent-orange">
          <div class="stat-label">Items in Stock</div>
          <div class="stat-value" id="stat-stock">0</div>
          <div class="stat-sub">Across all categories</div>
        </div>
        <div class="stat-card accent-red">
          <div class="stat-label">Stock Alerts</div>
          <div class="stat-value" id="stat-low">0</div>
          <div class="stat-sub" id="stat-low-sub">items need attention</div>
        </div>

      </div>

      <!-- ROW 2: Sales Overview + Stock Alerts -->
      <div class="admin-2col">
        <div class="adm-widget">
          <div class="adm-widget-header">
            <div class="adm-widget-title"><span>🛒</span> Sales Overview</div>
          </div>
          <div class="adm-widget-body">
            <div class="sales-overview-grid">
              <div class="sales-ov-card">
                <div class="sales-ov-label">Today</div>
                <div class="sales-ov-value" id="sov-today">—</div>
                <div class="sales-ov-sub" id="sov-today-orders">0 orders</div>
              </div>
              <div class="sales-ov-card">
                <div class="sales-ov-label">This Week</div>
                <div class="sales-ov-value" id="sov-week">—</div>
                <div class="sales-ov-sub" id="sov-week-orders">0 orders</div>
              </div>
              <div class="sales-ov-card">
                <div class="sales-ov-label">This Month</div>
                <div class="sales-ov-value" id="sov-month">—</div>
                <div class="sales-ov-sub" id="sov-month-orders">0 orders</div>
              </div>
              <div class="sales-ov-card accent-card">
                <div class="sales-ov-label">All Time</div>
                <div class="sales-ov-value" id="sov-alltime">—</div>
                <div class="sales-ov-sub" id="sov-alltime-orders">total orders</div>
              </div>
            </div>
          </div>
        </div>

        <div class="adm-widget">
          <div class="adm-widget-header">
            <div class="adm-widget-title"><span>⚠️</span> Stock Alerts</div>
            <span class="adm-widget-badge" id="admin-alerts-badge">0 alerts</span>
          </div>
          <div class="adm-widget-body" style="padding:12px 16px;">
            <div class="alert-row">
              <div class="alert-icon-wrap orange">📉</div>
              <div class="alert-info">
                <div class="alert-label">Low Stock</div>
                <div class="alert-items" id="admin-alert-low-items">—</div>
              </div>
              <span class="alert-count orange" id="admin-alert-low-count">0</span>
            </div>
            <div class="alert-row">
              <div class="alert-icon-wrap red">❌</div>
              <div class="alert-info">
                <div class="alert-label">Out of Stock</div>
                <div class="alert-items" id="admin-alert-out-items">—</div>
              </div>
              <span class="alert-count red" id="admin-alert-out-count">0</span>
            </div>
            <div class="alert-row">
              <div class="alert-icon-wrap blue">📦</div>
              <div class="alert-info">
                <div class="alert-label">Overstocked <span style="font-size:0.68rem;color:var(--text-muted);">(>100 units)</span></div>
                <div class="alert-items" id="admin-alert-over-items">—</div>
              </div>
              <span class="alert-count blue" id="admin-alert-over-count">0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ROW 3: Charts -->
      <div class="charts-row">
        <div class="chart-card wide">
          <h3>Sales — <span id="admin-chart-label">This Week</span></h3>
          <canvas id="salesChart"></canvas>
        </div>
        <div class="chart-card">
          <h3>Sales by Category</h3>
          <canvas id="categoryChart"></canvas>
        </div>
      </div>

      <!-- ROW 4: Product Performance + User Activity -->
      <div class="admin-2col">
        <div class="adm-widget">
          <div class="adm-widget-header">
            <div class="adm-widget-title"><span>📈</span> Product Performance</div>
            <div class="perf-tabs">
              <button class="perf-tab active" onclick="setAdminPerfTab('top',this)">🏆 Top</button>
              <button class="perf-tab" onclick="setAdminPerfTab('slow',this)">🐢 Slow</button>
              <button class="perf-tab" onclick="setAdminPerfTab('dead',this)">💀 Dead</button>
            </div>
          </div>
          <div class="adm-widget-body">
            <div id="admin-perf-top">
              <div class="top-seller-list" id="admin-top-sellers"><div class="adm-empty">Loading…</div></div>
            </div>
            <div id="admin-perf-slow" style="display:none">
              <div id="admin-slow-movers"><div class="adm-empty">Loading…</div></div>
            </div>
            <div id="admin-perf-dead" style="display:none">
              <div id="admin-dead-stock"><div class="adm-empty">Loading…</div></div>
            </div>
          </div>
        </div>

        <div class="adm-widget">
          <div class="adm-widget-header">
            <div class="adm-widget-title"><span>👤</span> User Activity</div>
            <span class="adm-widget-badge">Recent</span>
          </div>
          <div class="adm-widget-body">
            <div class="activity-list" id="admin-activity-list"><div class="adm-empty">Loading…</div></div>
          </div>
        </div>
      </div>

      <!-- ROW 5: Recent Transactions -->
      <div class="table-card">
        <h3>Recent Transactions</h3>
        <table class="data-table">
          <thead><tr><th>Date</th><th>Cashier</th><th>Branch</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
          <tbody id="recent-sales-body"></tbody>
        </table>
      </div>

    </section>

    <!-- CASHIER DAILY SALES -->
    <section id="sec-cashierday" class="section">
      <div class="section-toolbar">
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.82rem;color:var(--text-muted);font-weight:600;">Date</label>
          <input type="date" id="cashier-breakdown-date" onchange="renderCashierBreakdown()" style="padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:0.82rem;background:var(--bg-hover);color:var(--text-primary);font-family:inherit;">
        </div>
        <select id="cashier-breakdown-filter" onchange="renderCashierBreakdown()" style="padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:0.82rem;background:var(--bg-hover);color:var(--text-primary);font-family:inherit;cursor:pointer;">
          <option value="">All Cashiers</option>
        </select>
        <span class="adm-widget-badge" id="cashier-breakdown-badge" style="font-size:0.82rem;padding:6px 14px;">Today</span>
      </div>

      <!-- Summary stat cards -->
      <div class="stats-grid" id="cashier-day-stats" style="margin-bottom:20px;"></div>

      <div class="table-card">
        <h3>👤 Cashier Sales Breakdown</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Cashier</th>
              <th>Branch</th>
              <th>Starting Cash</th>
              <th>Transactions</th>
              <th>Items Sold</th>
              <th>Total Sales</th>
              <th>Expected in Drawer</th>
            </tr>
          </thead>
          <tbody id="cashier-breakdown-body">
            <tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- BRANCHES -->
    <section id="sec-branches" class="section">
      <div class="stats-grid" id="branch-stats-grid"></div>
      <div class="table-card" style="margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">All Branches Overview</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Staff</th>
              <th>Cashiers</th>
              <th>Items in Stock</th>
              <th>Low Stock</th>
              <th>Today's Sales</th>
              <th>Total Revenue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="branch-overview-body"></tbody>
        </table>
      </div>
    </section>

    <!-- INVENTORY -->
    <section id="sec-inventory" class="section">
      <div class="section-toolbar">
        <div class="search-box"><input type="text" id="inv-search" placeholder="Search items..." oninput="renderInventory()"><span>🔍</span></div>
        <select id="inv-cat-filter" onchange="renderInventory()">
          <option value="">All Categories</option>
          <option value="Fertilizers">Fertilizers</option>
          <option value="Lubricants">Lubricants</option>
          <option value="Hardware">Hardware</option>
          <option value="Feeds">Feeds</option>
          <option value="Seeds">Seeds</option>
          <option value="Chemicals">Chemicals</option>
          <option value="Others">Others</option>
        </select>
        <select id="inv-stock-filter" onchange="renderInventory()">
          <option value="">All Stock Status</option>
          <option value="in-stock">✅ In Stock</option>
          <option value="low-stock">⚠️ Low Stock</option>
          <option value="out-of-stock">🚫 Out of Stock</option>
          <option value="overstock">📦 Overstock</option>
        </select>
        <button class="btn btn-primary" onclick="openItemModal()">+ Add Item</button>
      </div>
      <div class="table-card">
        <table class="data-table">
          <thead><tr><th style="text-align:center;">Barcode / Item #</th><th>Icon</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="inventory-body"></tbody>
        </table>
      </div>
    </section>

    <!-- SALES -->
    <section id="sec-sales" class="section">
      <div style="margin-bottom:14px;padding:10px 16px;background:rgba(59,111,240,0.08);border:1.5px solid rgba(59,111,240,0.2);border-radius:10px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.1rem;">👁️</span>
        <span style="font-size:0.85rem;color:var(--accent);font-weight:600;">View Only — This is a preview of the cashier's point of sale screen. Transactions can only be processed by cashiers.</span>
      </div>
      <div class="pos-layout">
        <div class="pos-products">
          <div class="section-toolbar">
            <div class="search-box"><input type="text" id="pos-search" placeholder="Search items..." oninput="renderPOSItems()"><span>🔍</span></div>
            <div class="cat-pills" id="pos-cat-pills"></div>
          </div>
          <div class="products-grid" id="pos-products-grid" style="pointer-events:none;opacity:0.85;"></div>
        </div>
        <div class="pos-cart">
          <h3>Current Order <span style="font-size:0.7rem;font-weight:500;color:var(--text-muted);margin-left:6px;">(view only)</span></h3>
          <div class="cart-items" id="cart-items-list"></div>
          <div class="cart-summary">
            <div class="summary-row"><span>Subtotal</span><span id="cart-subtotal">₱0.00</span></div>
            <div class="summary-row"><span>Tax (12%)</span><span id="cart-tax">₱0.00</span></div>
            <div class="summary-row total-row"><span>Total</span><span id="cart-total">₱0.00</span></div>
            <div style="margin-top:14px;padding:12px;background:var(--bg-hover);border-radius:8px;text-align:center;font-size:0.8rem;color:var(--text-muted);">
              🔒 Payment processing is restricted to cashier accounts only.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REPORTS -->
    <section id="sec-reports" class="section">
      <div class="reports-filters">
        <div class="form-group"><label for="rep-from">From Date</label><input type="date" id="rep-from"></div>
        <div class="form-group"><label for="rep-to">To Date</label><input type="date" id="rep-to"></div>
        <button class="btn btn-primary" onclick="generateReport()">Generate</button>
        <button class="btn btn-outline" onclick="exportReport()">⬇ Export CSV</button>
      </div>
      <div class="stats-grid" id="report-stats"></div>
      <div class="charts-row">
        <div class="chart-card wide"><h3 style="margin-bottom:16px;">Revenue Trend</h3><canvas id="reportChart" height="130"></canvas></div>
      </div>
      <div class="table-card">
        <h3>Sales Summary</h3>
        <table class="data-table">
          <thead><tr><th>Date</th><th>Orders</th><th>Items Sold</th><th>Revenue</th></tr></thead>
          <tbody id="report-body"></tbody>
        </table>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
        <div class="table-card">
          <h3>👤 Cashier Performance</h3>
          <table class="data-table">
            <thead><tr><th>Cashier</th><th>Orders</th><th>Items Sold</th><th>Revenue</th></tr></thead>
            <tbody id="cashier-report-body"></tbody>
          </table>
        </div>
        <div class="table-card">
          <h3>🏆 Best-Selling Items (Top 10)</h3>
          <table class="data-table">
            <thead><tr><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
            <tbody id="bestseller-body"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- HISTORY -->
    <section id="sec-history" class="section">
      <div class="section-toolbar">
        <div class="search-box"><input type="text" id="hist-search" placeholder="Search transactions..." oninput="renderHistory()"><span>🔍</span></div>
        <input type="date" id="hist-date" onchange="renderHistory()">
        <select id="hist-cashier-filter" onchange="renderHistory()" style="padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:0.82rem;background:var(--bg-hover);color:var(--text-primary);font-family:inherit;cursor:pointer;">
          <option value="">All Cashiers</option>
        </select>
        <button class="btn btn-outline" onclick="exportHistory()">⬇ Export CSV</button>
      </div>
      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>TXN ID</th><th>Date & Time</th><th>Cashier</th><th>Items</th><th>Discount</th><th>Total</th><th>Cash</th><th>Change</th><th>Action</th></tr></thead>
          <tbody id="history-body"></tbody>
        </table>
      </div>
    </section>

    <!-- USERS -->
    <section id="sec-users" class="section">
      <div class="section-toolbar">
        <div class="search-box"><input type="text" id="user-search" placeholder="Search users..." oninput="renderUsers()"><span>🔍</span></div>
        <select id="user-role-filter" onchange="renderUsers()">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="cashier">Cashier</option>
        </select>
        <select id="user-branch-filter" onchange="renderUsers()">
          <option value="">All Branches</option>
        </select>
        <button class="btn btn-primary" onclick="openUserModal()">+ Add User</button>
      </div>
      <div class="table-card" style="overflow-x:auto;overflow-y:visible;">
        <table class="data-table" style="min-width:860px;table-layout:auto;">
          <thead>
            <tr>
              <th style="min-width:160px;">Name</th>
              <th style="min-width:140px;">Email</th>
              <th style="min-width:120px;">Contact</th>
              <th style="min-width:90px;">Role</th>
              <th style="min-width:100px;">Branch</th>
              <th style="min-width:100px;">Status</th>
              <th style="min-width:160px;">Action</th>
            </tr>
          </thead>
          <tbody id="users-body"></tbody>
        </table>
      </div>
    </section>

    <!-- REQUESTS -->
    <section id="sec-requests" class="section">
      <div class="table-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">Stock Requests & Alerts</h3>
          <button class="btn btn-success" onclick="resolveAllRequests()">✔ Resolve All Pending</button>
        </div>
        <table class="data-table">
          <thead><tr><th>Time</th><th>Item</th><th>Current Stock</th><th>Type</th><th>Requested By</th><th>Status</th><th>Action</th></tr></thead>
          <tbody id="requests-body"></tbody>
        </table>
      </div>
    </section>

    <!-- AUDIT LOG -->
    <section id="sec-auditlog" class="section">
      <div class="audit-filters">
        <div class="form-group">
          <label for="audit-search">Search</label>
          <input type="text" id="audit-search" placeholder="Name, action…" oninput="renderAuditLog()" style="width:180px;">
        </div>
        <div class="form-group">
          <label for="audit-role">Role</label>
          <select id="audit-role" onchange="renderAuditLog()">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>
        <div class="form-group">
          <label for="audit-category">Category</label>
          <select id="audit-category" onchange="renderAuditLog()">
            <option value="">All Categories</option>
            <option value="Auth">Auth</option>
            <option value="Sales">Sales</option>
            <option value="Inventory">Inventory</option>
            <option value="Users">Users</option>
            <option value="Reports">Reports</option>
          </select>
        </div>
        <div class="form-group">
          <label for="audit-from">From</label>
          <input type="date" id="audit-from" onchange="renderAuditLog()">
        </div>
        <div class="form-group">
          <label for="audit-to">To</label>
          <input type="date" id="audit-to" onchange="renderAuditLog()">
        </div>
        <button class="btn btn-primary" onclick="renderAuditLog()">🔍 Filter</button>
        <button class="btn btn-outline" onclick="exportAuditLog()">⬇ Export CSV</button>
      </div>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User</th>
              <th>Role</th>
              <th>Category</th>
              <th>Action</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody id="audit-body"></tbody>
        </table>
      </div>
    </section>

    <!-- LOGIN HISTORY -->
    <section id="sec-loginlogs" class="section">
      <div class="audit-filters">
        <div class="form-group">
          <label for="ll-search">Search</label>
          <input type="text" id="ll-search" placeholder="Name, username…" oninput="renderLoginLogs()" style="width:180px;">
        </div>
        <div class="form-group">
          <label for="ll-role">Role</label>
          <select id="ll-role" onchange="renderLoginLogs()">
            <option value="">All Roles</option>
            <option value="cashier">Cashier</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label for="ll-action">Action</label>
          <select id="ll-action" onchange="renderLoginLogs()">
            <option value="">Login &amp; Logout</option>
            <option value="LOGIN">Login Only</option>
            <option value="LOGOUT">Logout Only</option>
          </select>
        </div>
        <div class="form-group">
          <label for="ll-from">From</label>
          <input type="date" id="ll-from" onchange="renderLoginLogs()">
        </div>
        <div class="form-group">
          <label for="ll-to">To</label>
          <input type="date" id="ll-to" onchange="renderLoginLogs()">
        </div>
        <button class="btn btn-primary" onclick="renderLoginLogs()">🔍 Filter</button>
        <button class="btn btn-outline" onclick="exportLoginLogs()">⬇ Export CSV</button>
      </div>

      <!-- Summary cards -->
      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card accent-blue">
          <div class="stat-label">Total Logins Today</div>
          <div class="stat-value" id="ll-stat-today">0</div>
          <div class="stat-sub">cashiers &amp; staff</div>
        </div>
        <div class="stat-card accent-green">
          <div class="stat-label">Cashier Logins Today</div>
          <div class="stat-value" id="ll-stat-cashier">0</div>
          <div class="stat-sub">cashier accounts</div>
        </div>
        <div class="stat-card accent-orange">
          <div class="stat-label">Staff Logins Today</div>
          <div class="stat-value" id="ll-stat-staff">0</div>
          <div class="stat-sub">inventory staff</div>
        </div>
        <div class="stat-card accent-purple">
          <div class="stat-label">Currently Active</div>
          <div class="stat-value" id="ll-stat-active">—</div>
          <div class="stat-sub">logged in (no logout yet)</div>
        </div>
      </div>

      <div class="table-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <h3 style="margin:0;">🔐 Login &amp; Logout History</h3>
          <span id="ll-count-label" style="font-size:0.78rem;color:var(--text-muted);margin-left:12px;"></span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody id="loginlogs-body"></tbody>
        </table>
      </div>
    </section>

    <!-- SETTINGS -->
    <section id="sec-settings" class="section">
      <div class="settings-grid">

        <!-- LEFT COLUMN -->
        <div class="settings-col">

          <!-- Admin Profile Card -->
          <div class="settings-card">
            <div class="settings-card-header">
              <div class="settings-card-eyebrow">Account</div>
              <div class="settings-card-title">👤 My Profile</div>
              <div class="settings-card-subtitle">Update your admin name, email, and contact.</div>
            </div>
            <div class="settings-card-body">
              <div class="form-group"><label for="profile-fullname">Full Name</label><input type="text" id="profile-fullname" placeholder="Your full name"></div>
              <div class="form-group"><label for="profile-email">Email Address</label><input type="email" id="profile-email" placeholder="email@example.com"></div>
              <div class="form-group"><label for="profile-contact">Contact Number</label><input type="tel" id="profile-contact" placeholder="e.g. 09123456789"></div>
              <div style="display:flex;gap:10px;margin-top:8px;">
                <button class="btn btn-primary" onclick="saveAdminProfile()">💾 Save Profile</button>
              </div>
            </div>
          </div>

          <!-- System Settings Card -->
          <div class="settings-card">
            <div class="settings-card-header">
              <div class="settings-card-eyebrow">Configuration</div>
              <div class="settings-card-title">⚙️ System Settings</div>
            </div>
            <div class="settings-card-body">
              <div class="settings-row-item">
                <div class="settings-row-info">
                  <div class="settings-row-label">📦 Low Stock Alert Threshold</div>
                  <div class="settings-row-desc">Items at or below this quantity will be flagged as low stock and trigger automatic alerts to staff.</div>
                </div>
                <div class="settings-row-control">
                  <input type="number" id="setting-threshold" min="1" max="100" value="5" class="settings-number-input">
                  <span class="settings-unit">units</span>
                </div>
              </div>
              <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="btn btn-primary" onclick="saveSettings()">💾 Save Settings</button>
                <button class="btn btn-outline" onclick="renderSettings()">↺ Reset</button>
              </div>
            </div>
            <div class="settings-card-info">
              <div class="settings-info-title">ℹ️ How it works</div>
              <div class="settings-info-body">
                When any item's stock drops to or below the threshold, the system will:
                <ul class="settings-info-list">
                  <li>Show a <span style="color:var(--accent-orange);font-weight:700;">Low Stock</span> badge on the product card</li>
                  <li>Mark the item as <span style="color:var(--accent-orange);font-weight:700;">Low Stock</span> in the inventory table</li>
                  <li>Automatically create a <span style="color:var(--accent-red);font-weight:700;">stock alert</span> in Stock Requests</li>
                  <li>Show a 🔔 notification badge in the sidebar</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="settings-col">

          <!-- Change Password Card -->
          <div class="settings-card">
            <div class="settings-card-header">
              <div class="settings-card-eyebrow">Security</div>
              <div class="settings-card-title">🔐 Change Admin Password</div>
              <div class="settings-card-subtitle">Enter your current password to confirm the change.</div>
            </div>
            <div class="settings-card-body">
              <div id="chpw-error" class="settings-alert settings-alert-error" style="display:none;"></div>
              <div id="chpw-success" class="settings-alert settings-alert-success" style="display:none;"></div>

              <div class="form-group">
                <label for="chpw-old">Current Password</label>
                <div style="position:relative;">
                  <input type="password" id="chpw-old" placeholder="Enter your current password" style="padding-right:44px;">
                  <button type="button" onclick="toggleChpwEye('chpw-old', this)" class="pw-eye-btn">👁️</button>
                </div>
              </div>
              <div class="form-group">
                <label for="chpw-new">New Password</label>
                <div style="position:relative;">
                  <input type="password" id="chpw-new" placeholder="Enter new password" style="padding-right:44px;">
                  <button type="button" onclick="toggleChpwEye('chpw-new', this)" class="pw-eye-btn">👁️</button>
                </div>
              </div>
              <div class="form-group">
                <label for="chpw-confirm">Confirm New Password</label>
                <div style="position:relative;">
                  <input type="password" id="chpw-confirm" placeholder="Re-enter new password" style="padding-right:44px;">
                  <button type="button" onclick="toggleChpwEye('chpw-confirm', this)" class="pw-eye-btn">👁️</button>
                </div>
              </div>
              <div style="display:flex; gap:10px; margin-top:4px;">
                <button class="btn btn-primary" onclick="changeAdminPassword()">🔒 Update Password</button>
                <button class="btn btn-outline" onclick="clearChpwForm()">✕ Clear</button>
              </div>
            </div>
          </div>

          <!-- Branch Info Card -->
          <div class="settings-card">
            <div class="settings-card-header">
              <div class="settings-card-eyebrow">Store</div>
              <div class="settings-card-title">🏪 Branch Info</div>
              <div class="settings-card-subtitle">Edit the branch name, number, and address shown on receipts.</div>
            </div>
            <div class="settings-card-body">
              <div class="form-group">
                <label for="branch-setting-select">Select Branch</label>
                <select id="branch-setting-select" onchange="loadBranchSettings()"></select>
              </div>
              <div class="form-group"><label for="branch-setting-contact">Contact Number</label><input type="tel" id="branch-setting-contact" placeholder="e.g. 09123456789"></div>
              <div class="form-group"><label for="branch-setting-address">Branch Address</label><input type="text" id="branch-setting-address" placeholder="e.g. 123 Main St, Quezon City"></div>
              <div style="display:flex;gap:10px;margin-top:8px;">
                <button class="btn btn-primary" onclick="saveBranchSettings()">💾 Save Branch</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  </main>
</div>

<!-- ITEM MODAL -->
<div id="item-modal" class="modal-overlay" style="display:none">
  <div class="modal">
    <div class="modal-header">
      <h3 id="item-modal-title">Add Item</h3>
      <button class="modal-close" onclick="closeItemModal()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="item-id">
      <div class="form-group"><label for="item-number">Product / Barcode Number <span style="font-size:0.8rem;color:var(--text-muted);">(optional)</span></label><input type="text" id="item-number" placeholder="e.g. 5021889330014" style="font-family:monospace;"></div>
      <div class="form-group"><label for="item-name">Item Name</label><input type="text" id="item-name" placeholder="e.g. Iced Coffee"></div>
      <div class="form-row">
        <div class="form-group"><label for="item-cat">Category</label>
          <select id="item-cat">
            <option value="Fertilizers">Fertilizers</option>
            <option value="Lubricants">Lubricants</option>
            <option value="Hardware">Hardware</option>
            <option value="Feeds">Feeds</option>
            <option value="Seeds">Seeds</option>
            <option value="Chemicals">Chemicals</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <div class="form-group"><label for="item-price">Price (₱)</label><input type="number" id="item-price" placeholder="0.00" step="0.01"></div>
      </div>
      <div class="form-group"><label for="item-stock">Stock Quantity</label><input type="number" id="item-stock" placeholder="0"></div>
      <div class="form-group"><label for="item-emoji">Emoji / Icon</label><input type="text" id="item-emoji" placeholder="🧋" maxlength="4"></div>
      <div class="form-group">
        <label for="item-branch">Assign to Branch</label>
        <select id="item-branch">
          <option value="">🌐 Shared (All Branches)</option>
        </select>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Items assigned to a branch are only visible to that branch. Shared items are visible to all.</div>
      </div>
    </div>
    <div class="modal-footer" id="item-modal-footer" style="justify-content:flex-end;">
      <button class="btn btn-danger" id="item-delete-btn" style="display:none;margin-right:auto;" onclick="deleteItemFromModal()">&#128465; Delete</button>
      <button class="btn btn-outline" onclick="closeItemModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveItem()">Save Item</button>
    </div>
  </div>
</div>

<!-- USER MODAL -->
<div id="user-modal" class="modal-overlay" style="display:none">
  <div class="modal">
    <div class="modal-header">
      <h3 id="user-modal-title">Add User</h3>
      <button class="modal-close" onclick="closeUserModal()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="user-id">
      <div class="form-group"><label for="user-fullname">Full Name</label><input type="text" id="user-fullname" placeholder="Full Name"></div>
      <div class="form-group"><label for="user-username">Username</label><input type="text" id="user-username" placeholder="username"></div>
      <div class="form-group">
        <label id="pw-label" for="user-password">Password</label>
        <div style="position:relative;">
          <input type="password" id="user-password" placeholder="Min. 8 characters" style="padding-right:44px;">
          <button type="button" onclick="togglePasswordVisibility()" id="pw-toggle"
            style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
            background:none;border:none;cursor:pointer;font-size:1rem;color:var(--text-secondary);
            padding:4px;border-radius:4px;transition:color 0.15s;"
            title="Show/hide password">👁️</button>
        </div>
      </div>
      <div class="form-group"><label for="user-role">Role</label>
        <select id="user-role">
          <option value="staff">Staff</option>
          <option value="cashier">Cashier</option>
        </select>
      </div>
      <div class="form-group"><label for="user-branch">Branch</label>
        <select id="user-branch">
          <option value="">— No Branch (Admin) —</option>
        </select>
      </div>
      <!-- Admin password confirmation — only shown when creating a new account -->
      <div class="form-group" id="admin-pw-group" style="display:none; border-top: 1px solid var(--border); padding-top: 14px; margin-top: 4px;">
        <label for="admin-confirm-password" style="color: var(--accent);">🔐 Your Admin Password (required to create account)</label>
        <div style="position:relative;">
          <input type="password" id="admin-confirm-password" placeholder="Enter your admin password" style="padding-right:44px;">
          <button type="button" onclick="toggleAdminPwVisibility()" id="admin-pw-toggle"
            style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
            background:none;border:none;cursor:pointer;font-size:1rem;color:var(--text-secondary);
            padding:4px;border-radius:4px;transition:color 0.15s;"
            title="Show/hide password">👁️</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeUserModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveUser()">Save User</button>
    </div>
  </div>
</div>

<!-- CONFIRM MODAL -->
<div id="confirm-modal" class="modal-overlay" style="display:none">
  <div class="modal" style="max-width:420px;">
    <div class="modal-header">
      <h3 id="confirm-modal-title">Confirm</h3>
      <button class="modal-close" onclick="closeConfirmModal()">✕</button>
    </div>
    <div class="modal-body">
      <p id="confirm-modal-message" style="color:var(--text-secondary);line-height:1.6;"></p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeConfirmModal()">Cancel</button>
      <button class="btn btn-danger" onclick="executeConfirm()">Yes, Delete</button>
    </div>
  </div>
</div>

<!-- RESTOCK MODAL -->
<div id="restock-modal" class="modal-overlay" style="display:none">
  <div class="modal" style="max-width:380px;">
    <div class="modal-header">
      <h3>📦 Quick Restock</h3>
      <button class="modal-close" onclick="closeRestockModal()">✕</button>
    </div>
    <div class="modal-body">
      <p style="color:var(--text-secondary);margin-bottom:16px;">Adding stock to: <strong id="restock-item-name"></strong></p>
      <input type="hidden" id="restock-item-id">
      <div class="form-group">
        <label for="restock-qty">Current Stock: <span id="restock-current" style="color:var(--accent);font-weight:600;"></span></label>
        <input type="number" id="restock-qty" placeholder="Units to add" min="1">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeRestockModal()">Cancel</button>
      <button class="btn btn-success" onclick="submitRestock()">✅ Add Stock</button>
    </div>
  </div>
</div>


<!-- PRICE MODAL -->
<div id="price-modal" class="modal-overlay" style="display:none">
  <div class="modal" style="max-width:380px;">
    <div class="modal-header">
      <h3>💲 Update Price</h3>
      <button class="modal-close" onclick="closePriceModal()">✕</button>
    </div>
    <div class="modal-body">
      <p style="color:var(--text-secondary);margin-bottom:16px;">Updating price for: <strong id="price-item-name"></strong></p>
      <input type="hidden" id="price-item-id">
      <div class="form-group">
        <label for="price-new">Current Price: <span id="price-current" style="color:var(--accent);font-weight:600;"></span></label>
        <input type="number" id="price-new" placeholder="0.00" step="0.01" min="0"
          style="font-size:1.3rem;font-weight:700;text-align:center;padding:14px;"
          onkeydown="if(event.key==='Enter') submitPriceUpdate()">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closePriceModal()">Cancel</button>
      <button class="btn btn-primary" onclick="submitPriceUpdate()">✅ Save Price</button>
    </div>
  </div>
</div>
<!-- RECEIPT MODAL -->
<div id="receipt-modal" class="modal-overlay" style="display:none">
  <div class="modal receipt-modal">
    <div class="modal-header">
      <h3>Receipt</h3>
      <button class="modal-close" onclick="closeReceipt()">✕</button>
    </div>
    <div id="receipt-content" class="receipt-content"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="window.print()">🖨 Print</button>
      <button class="btn btn-primary" onclick="closeReceipt()">Done</button>
    </div>
  </div>
</div>

<!-- VIEW USER MODAL -->
<div id="view-user-modal" class="modal-overlay" style="display:none">
  <div class="modal" style="max-width:480px;">
    <div class="modal-header">
      <h3>👤 User Details</h3>
      <button class="modal-close" onclick="closeViewUserModal()">✕</button>
    </div>
    <div class="modal-body">
      <!-- Avatar + Name -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border);">
        <div id="view-avatar" style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-purple));display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:#fff;flex-shrink:0;">A</div>
        <div>
          <div id="view-fullname" style="font-size:1.1rem;font-weight:700;color:var(--text-primary);"></div>
          <div id="view-username" style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;"></div>
          <div id="view-role-badge" style="margin-top:6px;"></div>
        </div>
      </div>
      <!-- Info rows -->
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:var(--text-muted);font-weight:500;">🏪 Branch</span>
          <span id="view-branch" style="font-size:0.87rem;color:var(--text-secondary);"></span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:var(--text-muted);font-weight:500;">📧 Email</span>
          <span id="view-email" style="font-size:0.87rem;color:var(--text-secondary);"></span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:var(--text-muted);font-weight:500;">📞 Contact</span>
          <span id="view-contact" style="font-size:0.87rem;color:var(--text-secondary);"></span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:var(--text-muted);font-weight:500;">🔖 Status</span>
          <span id="view-status-badge"></span>
        </div>
      </div>

      <!-- Termination Warning (shown only when terminated) -->
      <div id="view-terminated-notice" style="display:none;margin-top:20px;padding:12px 14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;font-size:0.82rem;color:#f87171;line-height:1.6;">
        ⛔ This account has been <strong>terminated</strong>. The user cannot log in until the account is reactivated.
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center;">
      <div id="view-terminate-actions" style="display:flex;gap:8px;"></div>
      <button class="btn btn-outline" onclick="closeViewUserModal()">Close</button>
    </div>
  </div>
</div>


<!-- CLEAR CART CONFIRM MODAL -->
<div id="clear-cart-modal" class="modal-overlay" style="display:none">
  <div class="modal" style="max-width:380px;">
    <div class="modal-header">
      <h3>🗑 Clear Order</h3>
      <button class="modal-close" onclick="cancelClearCart()">✕</button>
    </div>
    <div class="modal-body">
      <p style="color:var(--text-secondary);line-height:1.6;">Are you sure you want to clear the current order? This cannot be undone.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="cancelClearCart()">Cancel</button>
      <button class="btn btn-danger" onclick="confirmClearCart()">Yes, Clear</button>
    </div>
  </div>
</div>
<div id="toast" class="toast" style="display:none"></div>


<div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>
<script>
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) { sidebar.classList.remove('open'); overlay.classList.remove('visible'); }
  else { sidebar.classList.add('open'); overlay.classList.add('visible'); }
}
function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}
// Close sidebar on nav item click on mobile
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
});
</script>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/sweetalert.js"></script>
<script>
window.RENDER_SUPABASE_CONFIG = {
  url: <?= json_encode(getenv('SUPABASE_URL') ?: '') ?>,
  anonKey: <?= json_encode(getenv('SUPABASE_ANON_KEY') ?: '') ?>
};
</script>
<script src="js/supabase.js"></script>
<script src="js/db.js"></script>
<script src="js/auth.js"></script>
<script src="js/audit.js"></script>
<script src="js/pos.js"></script>
<script src="js/admin.js"></script>
<script src="js/calendar.js"></script>
</body>
</html>
