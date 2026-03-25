<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Villaluna General Merchandise — Staff</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/bootstrap-ux.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<style>

/* ═══════════════════════════════════════════════════════════════
   STAFF DASHBOARD — COMPONENT STYLES
═══════════════════════════════════════════════════════════════ */
.inv-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.inv-kpi-card { background: #fff; border: 1.5px solid var(--border); border-radius: 14px; padding: 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px; transition: box-shadow 0.2s, transform 0.2s; }
.inv-kpi-card:hover { box-shadow: 0 6px 24px rgba(15,23,42,0.10); transform: translateY(-2px); }
.inv-kpi-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
.kpi-blue   { background: rgba(59,111,240,0.10); }
.kpi-orange { background: rgba(234,108,0,0.10); }
.kpi-red    { background: rgba(220,38,38,0.10); }
.kpi-green  { background: rgba(22,163,74,0.10); }
.kpi-purple { background: rgba(139,92,246,0.10); }
.kpi-teal   { background: rgba(20,184,166,0.10); }
.inv-kpi-label { font-size: 0.73rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
.inv-kpi-value { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1; letter-spacing: -0.5px; }
.inv-kpi-sub   { font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; }

.inv-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.inv-main-grid.three-col { grid-template-columns: 1fr 1fr 1fr; }
.inv-widget { background: #fff; border: 1.5px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-sm); }
.inv-widget-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1.5px solid #f1f4f9; background: linear-gradient(to right, #fafbff, #f8faff); }
.inv-widget-title { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
.inv-widget-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(59,111,240,0.1); color: var(--accent); }
.inv-widget-body  { padding: 16px 20px; }
.inv-chart-card { background: #fff; border: 1.5px solid var(--border); border-radius: 14px; padding: 20px; box-shadow: var(--shadow-sm); }
.inv-chart-card h3 { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }

.movement-list { display: flex; flex-direction: column; gap: 10px; }
.movement-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: #f8faff; border: 1px solid #eef2fc; }
.movement-item:hover { background: #eff3fe; }
.movement-dot { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
.dot-green { background: rgba(22,163,74,0.12); } .dot-blue { background: rgba(59,111,240,0.12); } .dot-orange { background: rgba(234,108,0,0.12); } .dot-red { background: rgba(220,38,38,0.12); }
.movement-info { flex: 1; min-width: 0; }
.movement-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.movement-meta { font-size: 0.72rem; color: var(--text-muted); margin-top: 1px; }
.movement-change { font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
.change-pos { color: var(--accent-green); } .change-neg { color: var(--accent-red); }

.order-list { display: flex; flex-direction: column; gap: 8px; }
.order-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: #f8faff; border: 1px solid #eef2fc; }
.order-item:hover { background: #eff3fe; }
.order-id { font-size: 0.76rem; font-weight: 700; font-family: 'Courier New', monospace; color: var(--accent); flex-shrink: 0; min-width: 110px; }
.order-info { flex: 1; min-width: 0; }
.order-cashier { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
.order-time { font-size: 0.72rem; color: var(--text-muted); }
.order-amount { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); flex-shrink: 0; }
.order-status { font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 20px; flex-shrink: 0; }
.status-completed { background: rgba(22,163,74,0.12); color: #15803d; } .status-pending { background: rgba(234,108,0,0.12); color: #ea6c00; }

.top-seller-list { display: flex; flex-direction: column; gap: 10px; }
.top-seller-item { display: flex; align-items: center; gap: 12px; }
.seller-rank { font-size: 1rem; width: 24px; text-align: center; flex-shrink: 0; }
.seller-info { flex: 1; min-width: 0; }
.seller-name { font-size: 0.83rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.seller-bar-wrap { height: 5px; background: #f0f4f9; border-radius: 10px; margin-top: 5px; overflow: hidden; }
.seller-bar { height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--accent), #6899f8); transition: width 0.6s ease; }
.seller-sold { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }

.activity-list { display: flex; flex-direction: column; gap: 8px; }
.activity-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #f8faff; border: 1px solid #eef2fc; }
.activity-avatar { width: 30px; height: 30px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.av-staff { background: linear-gradient(135deg, #ea6c00, #fb923c); } .av-admin { background: linear-gradient(135deg, #7c3aed, #a78bfa); } .av-cashier { background: linear-gradient(135deg, #b45309, #fbbf24); } .av-system { background: linear-gradient(135deg, #475569, #94a3b8); }
.activity-text { flex: 1; min-width: 0; }
.activity-action { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
.activity-time { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }

.inv-empty { text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 0.83rem; }
@keyframes pulse-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.pulse-red { animation: pulse-red 1.8s ease-in-out infinite; }

/* Date filter bar */
.dash-filter-bar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  background: #fff; border: 1.5px solid var(--border); border-radius: 12px;
  padding: 12px 18px; margin-bottom: 18px; box-shadow: var(--shadow-sm);
}
.dash-filter-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); white-space: nowrap; }
.dash-filter-pills { display: flex; gap: 6px; }
.dash-pill {
  padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border);
  background: #fff; font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.dash-pill:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.dash-pill.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 2px 8px rgba(59,111,240,0.25); }
.dash-period-label { margin-left: auto; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; white-space: nowrap; }

/* Sales Overview grid */
.sales-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sales-ov-card {
  background: #f8faff; border: 1.5px solid #eef2fc; border-radius: 12px;
  padding: 14px 16px; transition: background 0.15s;
}
.sales-ov-card:hover { background: #eff3fe; }
.sales-ov-card.accent-card { background: var(--accent-light); border-color: rgba(59,111,240,0.2); }
.sales-ov-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.sales-ov-value { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; }
.sales-ov-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; }

/* Stock Alerts */
.alert-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 10px; margin-bottom: 8px;
  background: #f8faff; border: 1px solid #eef2fc; transition: background 0.15s;
}
.alert-row:last-child { margin-bottom: 0; }
.alert-row:hover { background: #eff3fe; }
.alert-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
.alert-icon-wrap.orange { background: rgba(234,108,0,0.10); }
.alert-icon-wrap.red    { background: rgba(220,38,38,0.10); }
.alert-icon-wrap.blue   { background: rgba(59,111,240,0.10); }
.alert-info { flex: 1; min-width: 0; }
.alert-label { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
.alert-items { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alert-count { font-size: 1.1rem; font-weight: 800; flex-shrink: 0; min-width: 28px; text-align: right; }
.alert-count.orange { color: var(--accent-orange); }
.alert-count.red    { color: var(--accent-red); }
.alert-count.blue   { color: var(--accent); }

/* Product Performance tabs */
.perf-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.perf-tab {
  padding: 4px 10px; border-radius: 8px; border: 1.5px solid var(--border);
  background: #fff; font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.perf-tab:hover { border-color: var(--accent); color: var(--accent); }
.perf-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }

.dead-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; background: rgba(220,38,38,0.1); color: var(--accent-red); flex-shrink: 0; }
.slow-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; background: rgba(234,108,0,0.1); color: var(--accent-orange); flex-shrink: 0; }

/* DateTime display */
.datetime-display { display:flex; flex-direction:column; align-items:flex-end; gap:1px; line-height:1.2; min-width:160px; width:160px; }
.date-display { font-size:0.72rem; font-weight:600; color:var(--text-muted); letter-spacing:0.03em; white-space:nowrap; text-align:right; width:100%; }
.cart-count-badge { display: inline-block; background: var(--accent); color: #fff; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; margin-left: 6px; vertical-align: middle; letter-spacing: 0.03em; }

/* ═══════════════════════════════════════════════════════════════
   MOBILE CART TOGGLE + DRAWER (Sales section)
═══════════════════════════════════════════════════════════════ */
.mobile-cart-toggle {
  display: none;
  position: fixed;
  bottom: 20px; right: 20px;
  z-index: 300;
  background: var(--accent); color: #fff;
  border: none; border-radius: 50px;
  padding: 14px 20px;
  font-size: 0.875rem; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(59,111,240,0.45);
  align-items: center; gap: 8px;
  transition: all 0.2s; white-space: nowrap;
}
.mobile-cart-toggle:hover { background: var(--accent-hover); transform: translateY(-2px); }
.cart-toggle-badge { background: #fff; color: var(--accent); font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 20px; min-width: 20px; text-align: center; }

.mobile-cart-overlay { display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 400; backdrop-filter: blur(3px); }
.mobile-cart-overlay.open { display: block; }

.mobile-cart-drawer {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: #fff; border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 40px rgba(15,23,42,0.18);
  z-index: 500; display: flex; flex-direction: column;
  max-height: 90vh;
  transform: translateY(100%);
  transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
}
.mobile-cart-drawer.open { transform: translateY(0); }
.mobile-cart-drawer-handle { width: 40px; height: 4px; background: var(--border-strong); border-radius: 2px; margin: 12px auto 0; flex-shrink: 0; }
.mobile-cart-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 12px; border-bottom: 1.5px solid var(--border); flex-shrink: 0; }
.mobile-cart-drawer-header h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.mobile-cart-close { background: var(--bg-primary); border: 1.5px solid var(--border); border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; color: var(--text-muted); transition: all 0.15s; }
.mobile-cart-close:hover { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
.mobile-cart-body { flex: 1; overflow-y: auto; padding: 8px; -webkit-overflow-scrolling: touch; }
.mobile-cart-footer { border-top: 1.5px solid var(--border); background: var(--bg-primary); padding: 12px 16px; flex-shrink: 0; }

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
═══════════════════════════════════════════════════════════════ */

/* ── ≤1100px: Tablet ── */
@media (max-width: 1100px) {
  .inv-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .inv-main-grid, .inv-main-grid.three-col { grid-template-columns: 1fr 1fr; }
  .sales-overview-grid { grid-template-columns: 1fr 1fr; }
  .dash-filter-bar { gap: 8px; }
  .dash-period-label { display: none; }
}

/* ── ≤900px: Small tablet / large phone ── */
@media (max-width: 900px) {
  .inv-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
  .inv-kpi-card { padding: 14px; gap: 12px; }
  .inv-kpi-icon { width: 44px; height: 44px; font-size: 1.3rem; }
  .inv-kpi-value { font-size: 1.3rem; }

  .inv-main-grid, .inv-main-grid.three-col { grid-template-columns: 1fr; gap: 12px; }

  .dash-filter-bar { padding: 10px 14px; gap: 8px; }
  .dash-filter-pills { flex-wrap: wrap; gap: 5px; }

  /* Topbar */
  .datetime-display { min-width: auto; width: auto; }
  .date-display { display: none; }
  .time-display { min-width: 86px; width: 86px; font-size: 0.73rem; padding: 5px 8px; }

  /* Sales POS on mobile */
  .pos-layout { grid-template-columns: 1fr !important; height: auto !important; }
  .pos-cart { display: none !important; }
  .pos-products { min-height: 0; overflow: visible; }
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)) !important; gap: 8px !important; }
  .product-card { padding: 12px 8px; }
  .cat-pills { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; scrollbar-width: none; }
  .cat-pills::-webkit-scrollbar { display: none; }
  .cat-pill { flex-shrink: 0; }
  .mobile-cart-toggle { display: flex !important; }

  /* Section padding */
  .section { padding: 12px 14px !important; }
}

/* ── ≤640px: Phone ── */
@media (max-width: 640px) {
  .inv-kpi-grid { grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .inv-kpi-card { padding: 12px 10px; gap: 10px; }
  .inv-kpi-icon { width: 38px; height: 38px; font-size: 1.1rem; border-radius: 10px; }
  .inv-kpi-label { font-size: 0.65rem; }
  .inv-kpi-value { font-size: 1.1rem; }
  .inv-kpi-sub { font-size: 0.67rem; }

  .inv-widget-header { padding: 12px 14px; flex-wrap: wrap; gap: 6px; }
  .inv-widget-body { padding: 12px 14px; }
  .inv-widget-title { font-size: 0.82rem; }
  .inv-chart-card { padding: 14px; }
  .inv-chart-card h3 { font-size: 0.82rem; margin-bottom: 12px; }

  /* Sales overview — 2 col tight */
  .sales-overview-grid { gap: 8px; }
  .sales-ov-card { padding: 10px 12px; }
  .sales-ov-value { font-size: 1rem; }

  /* Alert rows */
  .alert-row { padding: 10px; gap: 10px; }
  .alert-icon-wrap { width: 30px; height: 30px; font-size: 0.85rem; }
  .alert-label { font-size: 0.78rem; }
  .alert-items { font-size: 0.68rem; }
  .alert-count { font-size: 0.95rem; }

  /* Filter bar */
  .dash-filter-bar { padding: 10px 12px; gap: 8px; }
  .dash-filter-label { font-size: 0.74rem; }
  .dash-pill { padding: 5px 10px; font-size: 0.73rem; }
  #dash-custom-range { flex-wrap: wrap; gap: 6px !important; }
  #dash-custom-range input { font-size: 0.82rem; padding: 7px 10px; flex: 1; min-width: 120px; }

  /* Movement / order / activity items */
  .movement-item, .order-item, .activity-item { padding: 8px 10px; gap: 8px; }
  .movement-name, .order-cashier, .activity-action { font-size: 0.78rem; }
  .movement-meta, .order-time, .activity-time { font-size: 0.68rem; }
  .order-id { min-width: 80px; font-size: 0.7rem; }
  .order-amount { font-size: 0.78rem; }
  .order-status { display: none; } /* hide on very small to save space */

  /* Product performance */
  .seller-name { font-size: 0.78rem; }
  .seller-sold { font-size: 0.72rem; }
  .perf-tab { font-size: 0.68rem; padding: 3px 8px; }

  /* Section toolbar — stack */
  .section-toolbar { flex-direction: column; align-items: stretch; gap: 8px; }
  .section-toolbar .btn { width: 100%; justify-content: center; }
  .section-toolbar select { width: 100%; }

  /* Tables */
  .table-card { overflow-x: auto; }
  .data-table { min-width: 520px; font-size: 0.8rem; }
  .data-table th, .data-table td { padding: 10px 12px; }

  /* Reports filters */
  .reports-filters { flex-direction: column; align-items: stretch; gap: 10px; }
  .reports-filters .form-group { width: 100%; }
  .reports-filters .btn { width: 100%; justify-content: center; }

  /* History toolbar */
  #hist-date { width: 100%; }

  /* Topbar */
  .topbar { padding: 8px 12px; }
  .topbar h2 { font-size: 0.88rem; }

  /* Modals */
  .modal { max-width: calc(100vw - 20px); border-radius: 14px; }
  .modal-body { padding: 14px; }
  .modal-footer { flex-wrap: wrap; gap: 8px; }
  .modal-footer .btn { flex: 1; justify-content: center; }
  .form-row { grid-template-columns: 1fr; gap: 10px; }

  /* Toast */
  .toast { bottom: 14px; right: 12px; left: 12px; max-width: none; font-size: 0.8rem; }

  /* Stats grid in reports */
  .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 8px; }
  .stat-value { font-size: 1.4rem; }

  /* POS */
  .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .mobile-cart-toggle { bottom: 16px; right: 14px; padding: 12px 16px; font-size: 0.82rem; }

  /* Section */
  .section { padding: 10px 10px !important; }
}

/* ── ≥901px: Desktop — hide mobile cart elements ── */
@media (min-width: 901px) {
  .mobile-cart-toggle { display: none !important; }
  .mobile-cart-overlay { display: none !important; }
  .mobile-cart-drawer { display: none !important; }
  .pos-cart { display: flex !important; }
}
</style>
</head>
<body class="dashboard-page">
<div class="app-layout">

  <!-- SIDEBAR -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <span class="brand-icon">⚡</span>
      <span>Villaluna General Merchandise</span>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active" onclick="showSection('dashboard')"><span class="nav-icon">📊</span>Dashboard</a>
      <a href="#" class="nav-item" onclick="showSection('sales')"><span class="nav-icon">🔍</span>Stock Verify</a>
      <a href="#" class="nav-item" onclick="showSection('inventory')"><span class="nav-icon">📦</span>Inventory</a>
      
      <a href="#" class="nav-item" onclick="showSection('reports')"><span class="nav-icon">📊</span>Reports</a>
      <a href="#" class="nav-item" onclick="showSection('history')"><span class="nav-icon">🕑</span>Sale History</a>
      <a href="#" class="nav-item" onclick="showSection('requests')">
        <span class="nav-icon">🔔</span>Stock Requests
        <span id="req-badge" class="badge" style="display:none">0</span>
      </a>
      <a href="#" class="nav-item" onclick="showSection('activitylog')">
        <span class="nav-icon">📋</span>Activity Log
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-pill">
        <div class="user-avatar">S</div>
        <div>
          <div class="user-name" id="staff-name">Staff</div>
          <div class="user-role">Staff Member</div>
        </div>
      </div>
      <button class="btn-logout" onclick="logout()">Logout</button>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <main class="main-content">
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
        <button class="sidebar-toggle" onclick="toggleSidebar()" title="Menu">☰</button>
        <h2 id="section-title">Dashboard</h2>
      </div>
      <div class="topbar-right">
        <div id="notif-bell" class="notif-bell" onclick="showSection('requests')">
          🔔 <span id="notif-count" class="notif-count" style="display:none">0</span>
        </div>
        <div class="datetime-display">
          <span id="current-date" class="date-display"></span>
          <span id="current-time" class="time-display"></span>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         DASHBOARD SECTION
    ═══════════════════════════════════════════════ -->
    <section id="sec-dashboard" class="section active">

      <!-- DATE FILTER BAR -->
      <div class="dash-filter-bar">
        <span class="dash-filter-label">📅 Period:</span>
        <div class="dash-filter-pills">
          <button class="dash-pill active" onclick="setDashPeriod('today',this)">Today</button>
          <button class="dash-pill" onclick="setDashPeriod('week',this)">This Week</button>
          <button class="dash-pill" onclick="setDashPeriod('month',this)">This Month</button>
          <button class="dash-pill" onclick="setDashPeriod('custom',this)">Custom</button>
        </div>
        <div id="dash-custom-range" style="display:none;align-items:center;gap:8px;">
          <input type="date" id="dash-from" onchange="applyCustomPeriod()">
          <span style="color:var(--text-muted);font-size:0.8rem;">to</span>
          <input type="date" id="dash-to" onchange="applyCustomPeriod()">
        </div>
        <span class="dash-period-label" id="dash-period-label">Showing: Today</span>
      </div>

      <!-- ROW 1: KPI Cards -->
      <div class="inv-kpi-grid">
        <div class="inv-kpi-card">
          <div class="inv-kpi-icon kpi-blue">📦</div>
          <div>
            <div class="inv-kpi-label">Total Products</div>
            <div class="inv-kpi-value" id="kpi-total-products">—</div>
            <div class="inv-kpi-sub" id="kpi-total-units-sub">total units</div>
          </div>
        </div>
        <div class="inv-kpi-card">
          <div class="inv-kpi-icon kpi-green">💰</div>
          <div>
            <div class="inv-kpi-label">Inventory Value</div>
            <div class="inv-kpi-value" id="kpi-inv-value" style="font-size:1.1rem;">—</div>
            <div class="inv-kpi-sub">total stock worth</div>
          </div>
        </div>
        <div class="inv-kpi-card">
          <div class="inv-kpi-icon kpi-purple">🛒</div>
          <div>
            <div class="inv-kpi-label">Sales (Period)</div>
            <div class="inv-kpi-value" id="kpi-period-sales" style="font-size:1.1rem;">—</div>
            <div class="inv-kpi-sub" id="kpi-period-orders">0 orders</div>
          </div>
        </div>
        <div class="inv-kpi-card">
          <div class="inv-kpi-icon kpi-teal">📈</div>
          <div>
            <div class="inv-kpi-label">Items Sold (Period)</div>
            <div class="inv-kpi-value" id="kpi-period-items">—</div>
            <div class="inv-kpi-sub" id="kpi-period-avg">avg per order</div>
          </div>
        </div>
      </div>

      <!-- ROW 2: Sales Overview + Stock Alerts -->
      <div class="inv-main-grid">
        <div class="inv-widget">
          <div class="inv-widget-header">
            <div class="inv-widget-title"><span>🛒</span> Sales Overview</div>
          </div>
          <div class="inv-widget-body">
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
                <div class="sales-ov-label">Total All-Time</div>
                <div class="sales-ov-value" id="sov-total-orders">—</div>
                <div class="sales-ov-sub" id="sov-total-rev">all orders</div>
              </div>
            </div>
          </div>
        </div>

        <div class="inv-widget">
          <div class="inv-widget-header">
            <div class="inv-widget-title"><span>⚠️</span> Stock Alerts</div>
            <span class="inv-widget-badge" id="alerts-total-badge">0 alerts</span>
          </div>
          <div class="inv-widget-body" style="padding:12px 16px;">
            <div class="alert-row">
              <div class="alert-icon-wrap orange">📉</div>
              <div class="alert-info">
                <div class="alert-label">Low Stock</div>
                <div class="alert-items" id="alert-low-items">—</div>
              </div>
              <span class="alert-count orange" id="alert-low-count">0</span>
            </div>
            <div class="alert-row">
              <div class="alert-icon-wrap red">❌</div>
              <div class="alert-info">
                <div class="alert-label">Out of Stock</div>
                <div class="alert-items" id="alert-out-items">—</div>
              </div>
              <span class="alert-count red" id="alert-out-count">0</span>
            </div>
            <div class="alert-row">
              <div class="alert-icon-wrap blue">📦</div>
              <div class="alert-info">
                <div class="alert-label">Overstocked <span style="font-size:0.68rem;color:var(--text-muted);">(>100)</span></div>
                <div class="alert-items" id="alert-over-items">—</div>
              </div>
              <span class="alert-count blue" id="alert-over-count">0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ROW 3: Chart + Product Performance -->
      <div class="inv-main-grid">
        <div class="inv-chart-card">
          <h3>📊 Stock In vs Stock Out — <span id="chart-period-label">Last 7 Days</span></h3>
          <canvas id="stockFlowChart" height="160"></canvas>
        </div>
        <div class="inv-widget">
          <div class="inv-widget-header">
            <div class="inv-widget-title"><span>📈</span> Product Performance</div>
            <div class="perf-tabs">
              <button class="perf-tab active" onclick="setPerfTab('top',this)">🏆 Top</button>
              <button class="perf-tab" onclick="setPerfTab('slow',this)">🐢 Slow</button>
              <button class="perf-tab" onclick="setPerfTab('dead',this)">💀 Dead</button>
            </div>
          </div>
          <div class="inv-widget-body">
            <div id="perf-top" class="perf-panel">
              <div class="top-seller-list" id="top-sellers-list"><div class="inv-empty">Loading…</div></div>
            </div>
            <div id="perf-slow" class="perf-panel" style="display:none">
              <div class="top-seller-list" id="slow-movers-list"><div class="inv-empty">Loading…</div></div>
            </div>
            <div id="perf-dead" class="perf-panel" style="display:none">
              <div class="top-seller-list" id="dead-stock-list"><div class="inv-empty">Loading…</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ROW 3B: Sales Trend + Fast vs Slow Chart -->
      <div class="inv-main-grid" style="margin-top:16px;">
        <div class="inv-chart-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <h3 style="margin:0;">📅 Daily Sales Trend — <span id="sales-trend-label">Last 7 Days</span></h3>
          </div>
          <canvas id="salesTrendChart" height="160"></canvas>
        </div>
        <div class="inv-chart-card">
          <h3>⚡ Fast vs Slow Movers</h3>
          <canvas id="fastSlowChart" height="160"></canvas>
        </div>
      </div>

      <!-- ROW 3C: Inventory Turnover -->
      <div style="margin-top:16px;">
        <div class="inv-chart-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <h3 style="margin:0;">🔄 Inventory Turnover Rate — <span id="turnover-label">Last 7 Days</span></h3>
            <span style="font-size:0.72rem;color:var(--text-muted);">Higher = faster selling</span>
          </div>
          <canvas id="turnoverChart" height="100"></canvas>
        </div>
      </div>

      <!-- ROW 3D: Category Performance -->
      <div class="inv-main-grid" style="margin-top:16px;">
        <div class="inv-chart-card">
          <h3>🏷️ Revenue by Category</h3>
          <div style="position:relative;height:180px;">
            <canvas id="catRevenueChart"></canvas>
          </div>
        </div>
        <div class="inv-chart-card">
          <h3>📦 Units Sold by Category</h3>
          <div style="position:relative;height:180px;">
            <canvas id="catUnitsChart"></canvas>
          </div>
        </div>
        <div class="inv-chart-card">
          <h3>💰 Stock Value by Category</h3>
          <div style="position:relative;height:180px;">
            <canvas id="catStockValueChart"></canvas>
          </div>
        </div>
      </div>
      <!-- ROW 4: Recent Orders + Stock Movements -->
      <div class="inv-main-grid" style="margin-top:16px;">
        <div class="inv-widget">
          <div class="inv-widget-header">
            <div class="inv-widget-title"><span>🛒</span> Recent Orders / Sales</div>
            <span class="inv-widget-badge" id="orders-badge">Today</span>
          </div>
          <div class="inv-widget-body">
            <div class="order-list" id="recent-orders-list"><div class="inv-empty">Loading…</div></div>
          </div>
        </div>
        <div class="inv-widget">
          <div class="inv-widget-header">
            <div class="inv-widget-title"><span>📈</span> Stock Movements</div>
          </div>
          <div class="inv-widget-body">
            <div class="movement-list" id="stock-movements-list"><div class="inv-empty">Loading…</div></div>
          </div>
        </div>
      </div>

    </section>

    <!-- ═══════════════════════════════════════════════
         INVENTORY SECTION
    ═══════════════════════════════════════════════ -->
    <section id="sec-inventory" class="section">
      <div class="section-toolbar">
        <div class="search-box">
          <input type="text" id="inv-search" placeholder="Search by name or product / barcode #..." oninput="renderInventory()">
          <span>🔍</span>
        </div>
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
          <thead>
            <tr><th style="text-align:center;">Barcode / Item #</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="inventory-body"></tbody>
        </table>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         SALES SECTION
    ═══════════════════════════════════════════════ -->
    

    <!-- ═══════════════════════════════════════════════
         REPORTS SECTION
    ═══════════════════════════════════════════════ -->
    <section id="sec-sales" class="section">
      <div style="margin-bottom:14px;padding:10px 16px;background:rgba(59,111,240,0.08);border:1.5px solid rgba(59,111,240,0.2);border-radius:10px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.1rem;">👁️</span>
        <span style="font-size:0.85rem;color:var(--accent);font-weight:600;">Stock Verification View — Browse items and confirm stock levels. Go to Inventory to make changes.</span>
      </div>
      <div class="pos-layout">
        <div class="pos-products">
          <div class="section-toolbar">
            <div class="search-box">
              <input type="text" id="pos-search" placeholder="Search or scan barcode / product #..." onkeydown="handleBarcodeSearch(event)" oninput="renderPOSItems()" autocomplete="off">
              <span>🔍</span>
            </div>
          </div>
          <div class="cat-pills" id="pos-cat-pills"></div>
          <div class="products-grid" id="pos-products-grid" style="pointer-events:none;opacity:0.85;"></div>
        </div>
        <div class="pos-cart" id="desktop-cart">
          <h3>Stock Summary <span style="font-size:0.7rem;font-weight:500;color:var(--text-muted);margin-left:6px;">(view only)</span></h3>
          <div style="margin-top:20px;padding:20px;background:var(--bg-hover);border-radius:10px;text-align:center;">
            <div style="font-size:2.5rem;margin-bottom:10px;">📦</div>
            <div style="font-size:0.88rem;font-weight:600;color:var(--text-primary);margin-bottom:6px;">Inventory Verification</div>
            <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.6;">Browse items on the left to verify stock levels are correct.<br>To add or update stock, go to the <strong>Inventory</strong> section.</div>
          </div>
          <div style="margin-top:12px;padding:12px;background:var(--bg-hover);border-radius:8px;text-align:center;font-size:0.8rem;color:var(--text-muted);">
            🔒 Payment processing is restricted to cashier accounts only.
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
    <section id="sec-reports" class="section">
      <div class="reports-filters">
        <div class="form-group"><label for="rep-from">From Date</label><input type="date" id="rep-from"></div>
        <div class="form-group"><label for="rep-to">To Date</label><input type="date" id="rep-to"></div>
        <button class="btn btn-primary" onclick="generateReport()">Generate</button>
        <button class="btn btn-outline" onclick="exportReport()">⬇ Export CSV</button>
      </div>
      <div class="stats-grid" id="report-stats"></div>
      <div class="charts-row">
        <div class="chart-card wide"><h3>Revenue Trend</h3><canvas id="reportChart" height="130"></canvas></div>
      </div>
      <div class="table-card">
        <h3>Sales Summary</h3>
        <table class="data-table">
          <thead><tr><th>Date</th><th>Orders</th><th>Items Sold</th><th>Revenue</th></tr></thead>
          <tbody id="report-body"></tbody>
        </table>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         HISTORY SECTION
    ═══════════════════════════════════════════════ -->
    <section id="sec-history" class="section">
      <div class="section-toolbar">
        <div class="search-box">
          <input type="text" id="hist-search" placeholder="Search transactions..." oninput="renderHistory()">
          <span>🔍</span>
        </div>
        <input type="date" id="hist-date" onchange="renderHistory()">
      </div>
      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>TXN ID</th><th>Date &amp; Time</th><th>Cashier</th><th>Items</th><th>Total</th><th>Cash</th><th>Change</th><th>Action</th></tr></thead>
          <tbody id="history-body"></tbody>
        </table>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         ACTIVITY LOG SECTION
    ═══════════════════════════════════════════════ -->
    <section id="sec-activitylog" class="section">
      <div class="inv-chart-card" style="padding:0;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="font-size:0.88rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
            <span>📋</span> Recent Inventory Activity
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <input type="text" id="ia-search" placeholder="Search product or staff…" oninput="renderInventoryActivity()" style="padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:0.78rem;background:var(--bg-hover);color:var(--text-primary);width:180px;">
            <select id="ia-action" onchange="renderInventoryActivity()" style="padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:0.78rem;background:var(--bg-hover);color:var(--text-primary);">
              <option value="">All Actions</option>
              <option value="RESTOCK_ITEM">Stock Received</option>
              <option value="PROCESS_SALE">Items Sold</option>
              <option value="UPDATE_ITEM">Adjustment</option>
              <option value="EDIT_ITEM">Item Edited</option>
              <option value="ADD_ITEM">Item Added</option>
              <option value="DELETE_ITEM">Item Removed</option>
              <option value="REQUEST_RESTOCK">Restock Request</option>
              <option value="RESOLVE_REQUEST">Request Resolved</option>
              <option value="RESOLVE_ALL_REQUESTS">Resolve All Requests</option>
            </select>
            <input type="date" id="ia-from" onchange="renderInventoryActivity()" style="padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:0.78rem;background:var(--bg-hover);color:var(--text-primary);">
            <input type="date" id="ia-to" onchange="renderInventoryActivity()" style="padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:0.78rem;background:var(--bg-hover);color:var(--text-primary);">
            <button onclick="exportInventoryActivity()" style="padding:6px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:0.78rem;background:var(--bg-hover);color:var(--text-secondary);cursor:pointer;font-family:inherit;">⬇ Export</button>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table" style="min-width:700px;">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Action</th>
                <th>Qty Change</th>
                <th>Staff / User</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody id="inventory-activity-body">
              <tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">Loading…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         REQUESTS SECTION
    ═══════════════════════════════════════════════ -->
    <section id="sec-requests" class="section">
      <div class="table-card">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;border-bottom:1px solid #f1f4f9;">
          <h3 style="font-size:1rem;font-weight:700;margin:0;">Stock Requests &amp; Alerts</h3>
          <button class="btn btn-primary btn-sm" onclick="openStaffRequestModal()">&#128226; New Request</button>
        </div>
        <table class="data-table">
          <thead><tr><th>Time</th><th>Item</th><th>Current Stock</th><th>Type</th><th>Requested By</th><th>Status</th><th>Action</th></tr></thead>
          <tbody id="requests-body"></tbody>
        </table>
      </div>
    </section>

    <!-- Staff Request Modal -->
    <div id="staff-request-modal" class="modal-overlay" style="display:none;">
      <div class="modal-box" style="max-width:420px;">
        <div class="modal-header">
          <h3>&#128226; Request Restock</h3>
          <button class="modal-close" onclick="closeStaffRequestModal()">&#x2715;</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px;">
          <div class="form-group" style="margin:0;">
            <label>Item</label>
            <select id="staff-req-item">
              <option value="">&#8212; Select Item &#8212;</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label>Note <span style="color:var(--text-muted);font-weight:400;">(optional)</span></label>
            <textarea id="staff-req-note" rows="3" placeholder="Reason for restock request..." style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:0.875rem;resize:vertical;outline:none;background:var(--bg-primary);color:var(--text-primary);"></textarea>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;gap:10px;justify-content:flex-end;">
          <button class="btn btn-outline" onclick="closeStaffRequestModal()">Cancel</button>
          <button class="btn btn-primary" onclick="submitStaffRequest()">Submit Request</button>
        </div>
      </div>
    </div>

  </main>
</div>



<!-- Mobile Cart Overlay -->
<div class="mobile-cart-overlay" id="mobile-cart-overlay" onclick="closeMobileCart()"></div>

<!-- Mobile Cart Drawer -->
<div class="mobile-cart-drawer" id="mobile-cart-drawer">
  <div class="mobile-cart-drawer-handle"></div>
  <div class="mobile-cart-drawer-header">
    <h3>Current Order <span id="mobile-cart-count" class="cart-count-badge" style="display:none;"></span></h3>
    <button class="mobile-cart-close" onclick="closeMobileCart()">✕</button>
  </div>
  <div class="mobile-cart-body">
    <div class="cart-items" id="mobile-cart-items-list"></div>
  </div>
  <div class="mobile-cart-footer">
    <div class="summary-row" id="mobile-cart-items-summary" style="display:none;font-size:0.82rem;padding:4px 0 8px;border-bottom:1px solid var(--border);margin-bottom:6px;"></div>
    <div class="summary-row"><span>Subtotal</span><span id="mobile-cart-subtotal">₱0.00</span></div>
    <div class="summary-row"><span>Tax (12%)</span><span id="mobile-cart-tax">₱0.00</span></div>
    <div class="summary-row total-row"><span>TOTAL</span><span id="mobile-cart-total">₱0.00</span></div>
    <div class="form-group" style="margin-top:10px;margin-bottom:8px;">
      <label for="mobile-cash-tendered">Cash Tendered</label>
      <input type="number" id="mobile-cash-tendered" placeholder="0.00" oninput="calcChangeMobile()" style="font-size:1rem;">
    </div>
    <div class="summary-row change-row" style="margin-bottom:10px;"><span>Change</span><span id="mobile-cart-change">₱0.00</span></div>
    <button class="btn btn-success btn-full" style="margin-bottom:8px;" onclick="processSaleMobile()">💳 Process Payment</button>
    <button class="btn btn-outline btn-full" onclick="clearCart(); closeMobileCart();">🗑 Clear Order</button>
  </div>
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
    </div>
    <div class="modal-footer" id="item-modal-footer" style="justify-content:flex-end;">
      <button class="btn btn-danger" id="item-delete-btn" style="display:none;margin-right:auto;" onclick="deleteItemFromModal()">&#128465; Delete</button>
      <button class="btn btn-outline" onclick="closeItemModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveItem()">Save Item</button>
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
      <h3>🧾 Receipt</h3>
      <button class="modal-close" onclick="closeReceipt()">✕</button>
    </div>
    <div id="receipt-content" class="receipt-content"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="confirmSale(true)">🖨 Print & Done</button>
      <button class="btn btn-primary" onclick="confirmSale(false)">✔ Done</button>
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
/* ── Sidebar toggle ── */
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
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
});

/* ── Mobile cart FAB: only show on Sales section ── */
function _updateMobileCartVisibility() {
  const salesActive = document.getElementById('sec-sales')?.classList.contains('active');
  const btn = document.getElementById('mobile-cart-btn');
  if (!btn) return;
  if (salesActive && window.innerWidth <= 900) {
    btn.style.display = 'flex';
  } else {
    btn.style.display = 'none';
    closeMobileCart();
  }
}

/* Patch showSection to toggle FAB */
const _origShowSection = window.showSection;
document.addEventListener('DOMContentLoaded', () => {
  // Wait for staff.js to load, then wrap showSection
  setTimeout(() => {
    const origFn = window.showSection;
    if (origFn) {
      window.showSection = function(name) {
        origFn(name);
        setTimeout(_updateMobileCartVisibility, 50);
      };
    }
  }, 500);
  _updateMobileCartVisibility();
});
window.addEventListener('resize', _updateMobileCartVisibility);

/* ── Mobile Cart Drawer ── */
function openMobileCart() {
  document.getElementById('mobile-cart-overlay').classList.add('open');
  document.getElementById('mobile-cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  syncMobileCart();
}
function closeMobileCart() {
  document.getElementById('mobile-cart-overlay').classList.remove('open');
  document.getElementById('mobile-cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}
function syncMobileCart() {
  const desktopItems = document.getElementById('cart-items-list');
  const mobileItems  = document.getElementById('mobile-cart-items-list');
  if (desktopItems && mobileItems) mobileItems.innerHTML = desktopItems.innerHTML;

  const copyText = (a, b) => { const fa=document.getElementById(a), fb=document.getElementById(b); if(fa&&fb) fb.textContent=fa.textContent; };
  copyText('cart-subtotal','mobile-cart-subtotal');
  copyText('cart-tax','mobile-cart-tax');
  copyText('cart-total','mobile-cart-total');
  copyText('cart-change','mobile-cart-change');

  const s = document.getElementById('cart-items-summary'), ms = document.getElementById('mobile-cart-items-summary');
  if (s && ms) { ms.innerHTML = s.innerHTML; ms.style.display = s.style.display; }

  const b = document.getElementById('cart-item-count'), mb = document.getElementById('mobile-cart-count');
  if (b && mb) { mb.textContent = b.textContent; mb.style.display = b.style.display; }

  const cash = document.getElementById('cash-tendered'), mcash = document.getElementById('mobile-cash-tendered');
  if (cash && mcash) mcash.value = cash.value;
}
function calcChangeMobile() {
  const mc = document.getElementById('mobile-cash-tendered'), dc = document.getElementById('cash-tendered');
  if (mc && dc) {
    dc.value = mc.value;
    if (typeof calcChange === 'function') calcChange();
    setTimeout(() => {
      const ch = document.getElementById('cart-change'), mch = document.getElementById('mobile-cart-change');
      if (ch && mch) mch.textContent = ch.textContent;
    }, 50);
  }
}
function processSaleMobile() {
  const mc = document.getElementById('mobile-cash-tendered'), dc = document.getElementById('cash-tendered');
  if (mc && dc) dc.value = mc.value;
  closeMobileCart();
  if (typeof processSale === 'function') processSale();
}
function updateMobileCartBadge() {
  const b = document.getElementById('cart-item-count'), fb = document.getElementById('mobile-cart-badge');
  if (b && fb) fb.textContent = b.textContent || '0';
}

/* Watch cart changes */
document.addEventListener('DOMContentLoaded', () => {
  const cartList = document.getElementById('cart-items-list');
  if (cartList) {
    new MutationObserver(() => {
      updateMobileCartBadge();
      const drawer = document.getElementById('mobile-cart-drawer');
      if (drawer?.classList.contains('open')) syncMobileCart();
    }).observe(cartList, { childList: true, subtree: true, characterData: true });
  }
  const badge = document.getElementById('cart-item-count');
  if (badge) new MutationObserver(updateMobileCartBadge).observe(badge, { childList: true, characterData: true, subtree: true });

  /* Swipe down to close drawer */
  let startY = 0;
  const drawer = document.getElementById('mobile-cart-drawer');
  if (drawer) {
    drawer.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    drawer.addEventListener('touchmove', e => { if (e.touches[0].clientY - startY > 60) closeMobileCart(); }, { passive: true });
  }
});
</script>



<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/sweetalert.js"></script>
<script src="js/supabase.js"></script>
<script src="js/db.js"></script>
<script src="js/auth.js"></script>
<script src="js/audit.js"></script>
<script src="js/pos.js"></script>
<script src="js/staff.js"></script>
<script src="js/calendar.js"></script>
</body>
</html>
