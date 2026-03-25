<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Villaluna General Merchandise — Cashier</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/bootstrap-ux.css">
<style>

/* ── DateTime ── */
.datetime-display { display:flex; flex-direction:column; align-items:flex-end; gap:1px; line-height:1.2; min-width:0; }
.date-display { font-size:0.72rem; font-weight:600; color:var(--text-muted); letter-spacing:0.03em; white-space:nowrap; text-align:right; width:100%; }

/* ── Cashier layout ── */
.cashier-layout { display:block !important; }
.cashier-layout .main-content { margin-left:0 !important; width:100% !important; }
body, .app-layout { overflow-x:hidden; max-width:100vw; }

/* ── Topbar brand ── */
.topbar-brand { display:flex; align-items:center; gap:8px; font-family:'Syne',sans-serif; font-size:1.15rem; font-weight:800; color:var(--accent); letter-spacing:-0.3px; }

/* ── Topbar user card ── */
.topbar-user-card { display:flex; align-items:center; gap:9px; padding:7px 10px 7px 7px; background:linear-gradient(135deg,rgba(59,111,240,0.09),rgba(59,111,240,0.03)); border:1.5px solid rgba(59,111,240,0.15); border-radius:12px; }
.topbar-user-avatar { width:34px; height:34px; border-radius:10px; flex-shrink:0; background:linear-gradient(135deg,var(--accent),#6899f8); color:#fff; font-size:0.9rem; font-weight:800; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(59,111,240,0.28); }
.topbar-user-info { min-width:0; }
.topbar-user-name { font-size:0.8rem; font-weight:700; color:var(--text-primary); white-space:nowrap; }
.topbar-user-role { font-size:0.67rem; font-weight:500; color:var(--accent); margin-top:1px; }

/* ── Three-dots ── */
.user-menu-wrap { position:relative; flex-shrink:0; }
.three-dots-btn { width:30px; height:30px; border-radius:8px; border:1.5px solid var(--border); background:#fff; font-size:1.1rem; font-weight:900; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1; letter-spacing:1px; transition:background 0.15s,border-color 0.15s,color 0.15s; }
.three-dots-btn:hover { background:var(--accent-light); border-color:var(--accent); color:var(--accent); }

/* ── Dropdown ── */
.user-dropdown { position:absolute; top:calc(100% + 6px); right:0; background:#fff; border:1.5px solid var(--border); border-radius:10px; box-shadow:0 8px 24px rgba(15,23,42,0.12); min-width:140px; z-index:200; overflow:hidden; animation:dropIn 0.15s ease; }
@keyframes dropIn { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);} }
.user-dropdown-item { width:100%; padding:11px 14px; background:none; border:none; text-align:left; font-size:0.82rem; font-weight:600; font-family:inherit; cursor:pointer; display:flex; align-items:center; gap:8px; color:var(--text-primary); transition:background 0.12s; }
.user-dropdown-item:hover { background:#f8faff; }
.logout-item { color:#dc2626; }
.logout-item:hover { background:rgba(220,38,38,0.06); }

/* ── Logout modal ── */
.logout-confirm-modal { max-width:360px; text-align:center; padding:32px 28px 24px; border-radius:20px; }
.modal-sm { max-width:380px !important; width:calc(100% - 32px) !important; }
.logout-modal-icon { font-size:2.5rem; margin-bottom:12px; }
.logout-modal-title { font-size:1.1rem; font-weight:800; color:var(--text-primary); margin:0 0 8px; }
.logout-modal-msg { font-size:0.85rem; color:var(--text-muted); margin:0 0 20px; line-height:1.5; }

/* ── Cart count badge ── */
.cart-count-badge { display:inline-flex; align-items:center; justify-content:center; background:var(--accent); color:#fff; font-size:0.65rem; font-weight:700; padding:2px 9px; border-radius:20px; margin-left:6px; vertical-align:middle; }

/* ── Notification Bell ── */
.notif-wrap { position:relative; flex-shrink:0; }
.notif-btn { width:36px; height:36px; border-radius:10px; border:1.5px solid var(--border); background:#fff; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
.notif-btn:hover { background:var(--accent-light); border-color:var(--accent); }
.notif-badge { position:absolute; top:-5px; right:-5px; background:#ef4444; color:#fff; font-size:0.6rem; font-weight:800; padding:2px 5px; border-radius:10px; min-width:16px; text-align:center; line-height:1.4; border:2px solid #fff; }
.notif-panel { position:absolute; top:calc(100% + 8px); right:0; width:320px; max-width:calc(100vw - 24px); background:#fff; border:1.5px solid var(--border); border-radius:14px; box-shadow:0 8px 32px rgba(15,23,42,0.14); z-index:300; animation:dropIn 0.15s ease; overflow:hidden; }
.notif-panel-header { padding:12px 16px; border-bottom:1.5px solid var(--border); font-size:0.82rem; font-weight:700; color:var(--text-primary); background:linear-gradient(to right,#fafbff,#f4f7ff); display:flex; align-items:center; justify-content:space-between; }
.notif-list { max-height:280px; overflow-y:auto; }
.notif-item { padding:11px 16px; border-bottom:1px solid #f1f5f9; display:flex; gap:10px; align-items:flex-start; }
.notif-item:last-child { border-bottom:none; }
.notif-icon { font-size:1.2rem; flex-shrink:0; margin-top:1px; }
.notif-text { font-size:0.78rem; color:var(--text-secondary); line-height:1.4; }
.notif-text strong { color:var(--text-primary); display:block; font-size:0.8rem; margin-bottom:2px; }
.notif-empty { padding:24px 16px; text-align:center; color:var(--text-muted); font-size:0.82rem; }

/* ── Discount Toggle ── */
.discount-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0 4px; border-top:1px solid var(--border); margin-top:6px; }
.discount-label { font-size:0.78rem; font-weight:700; color:var(--text-secondary); display:flex; align-items:center; gap:5px; }
.discount-toggle-wrap { display:flex; align-items:center; gap:6px; }
.discount-type-select { font-size:0.72rem; font-weight:600; padding:3px 7px; border-radius:6px; border:1.5px solid var(--border); background:var(--bg-primary); color:var(--text-primary); font-family:inherit; cursor:pointer; }
.toggle-switch { position:relative; width:36px; height:20px; }
.toggle-switch input { opacity:0; width:0; height:0; }
.toggle-slider { position:absolute; inset:0; background:#cbd5e1; border-radius:20px; cursor:pointer; transition:0.2s; }
.toggle-slider:before { content:''; position:absolute; width:14px; height:14px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
input:checked + .toggle-slider { background:var(--accent); }
input:checked + .toggle-slider:before { transform:translateX(16px); }
.discount-amount-row { display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; color:#7c3aed; padding:2px 0; }

/* ── Recent Transactions Panel ── */
.cashier-bottom { display:grid; grid-template-columns:1fr; margin:14px 24px 20px; gap:14px; }
.recent-txn-card { background:#fff; border:1.5px solid var(--border); border-radius:14px; overflow:hidden; box-shadow:0 2px 12px rgba(15,23,42,0.06); }
.recent-txn-header { padding:13px 16px; border-bottom:1.5px solid var(--border); background:linear-gradient(to right,#fafbff,#f4f7ff); display:flex; align-items:center; justify-content:space-between; }
.recent-txn-header h4 { font-size:0.88rem; font-weight:700; color:var(--text-primary); margin:0; }
.recent-txn-table { width:100%; border-collapse:collapse; font-size:0.8rem; }
.recent-txn-table th { padding:8px 14px; text-align:left; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); background:#f8fafc; border-bottom:1px solid var(--border); }
.recent-txn-table td { padding:9px 14px; border-bottom:1px solid #f1f5f9; color:var(--text-secondary); vertical-align:middle; }
.recent-txn-table tr:last-child td { border-bottom:none; }
.recent-txn-table tr:hover td { background:#f8faff; }
.txn-id-cell { font-family:'Courier New',monospace; font-size:0.72rem; color:var(--accent); font-weight:600; }
.txn-amount { font-weight:700; color:#16a34a; }
.btn-xs { padding:3px 9px; font-size:0.7rem; border-radius:6px; border:1.5px solid var(--border); background:#fff; cursor:pointer; color:var(--text-secondary); font-family:inherit; font-weight:600; transition:all 0.15s; white-space:nowrap; }
.btn-xs:hover { background:var(--accent-light); border-color:var(--accent); color:var(--accent); }
.discount-pill { display:inline-block; font-size:0.65rem; font-weight:700; padding:1px 6px; border-radius:8px; background:#ede9fe; color:#7c3aed; margin-left:4px; }

/* ════════════════════════════════════════
   POS LAYOUT — wider cart
════════════════════════════════════════ */
.cashier-page .pos-layout {
  grid-template-columns: 1fr 390px !important;
  margin: 14px 24px 0 !important;
  height: calc(100vh - 220px) !important;
  gap: 16px;
}

/* ════════════════════════════════════════
   REDESIGNED CART PANEL
════════════════════════════════════════ */
.pos-cart {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(15,23,42,0.07);
}

/* Header */
.pos-cart > h3 {
  padding: 15px 18px;
  border-bottom: 1.5px solid var(--border);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(to right, #fafbff, #f4f7ff);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  letter-spacing: -0.1px;
}

/* Scrollable items */
.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  background: #f8fafc;
  min-height: 0;
}
.cart-items::-webkit-scrollbar { width: 4px; }
.cart-items::-webkit-scrollbar-track { background: transparent; }
.cart-items::-webkit-scrollbar-thumb { background: #d1d9e6; border-radius: 4px; }

/* Empty cart */
.cart-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex: 1; padding: 32px 16px; gap: 8px; text-align: center;
  color: var(--text-muted); font-size: 0.82rem;
}
.cart-empty-state .ei { font-size: 2.8rem; opacity: 0.35; line-height: 1; }
.cart-empty-state .et { font-size: 0.88rem; font-weight: 700; color: #94a3b8; }
.cart-empty-state .es { font-size: 0.75rem; color: #c0cad8; }

/* ── Cart Item Row — REDESIGNED ── */
.cart-item {
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 11px;
  border: 1.5px solid #e8eef7;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cart-item:hover { border-color: rgba(59,111,240,0.22); box-shadow: 0 2px 10px rgba(59,111,240,0.07); }

/* Emoji box */
.cart-item-emoji {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: #f1f5fd;
  border: 1.5px solid #e2eaf8;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem;
}

/* Name + unit price */
.cart-item-info { min-width: 0; }
.cart-item-name {
  font-size: 0.84rem; font-weight: 700; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 2px;
}
.cart-item-price { font-size: 0.71rem; color: var(--text-muted); font-weight: 500; }

/* Qty stepper */
.cart-item-qty {
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
}
.qty-btn {
  width: 27px; height: 27px;
  background: #f1f5fd; border: 1.5px solid #dce5f5;
  border-radius: 7px; cursor: pointer;
  color: var(--text-secondary); font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; line-height: 1; flex-shrink: 0;
  font-family: inherit;
}
.qty-btn:hover { background: var(--accent); border-color: var(--accent); color: #fff; }
.qty-btn.minus:hover { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
.qty-num { font-size: 0.9rem; font-weight: 800; min-width: 22px; text-align: center; color: var(--text-primary); }

/* Line total */
.cart-item-line-total {
  font-size: 0.82rem; font-weight: 800;
  color: #16a34a; white-space: nowrap;
  min-width: 54px; text-align: right; flex-shrink: 0;
}

/* ── Summary Panel ── */
.cart-summary {
  padding: 13px 16px 16px;
  border-top: 1.5px solid var(--border);
  background: #fff;
  flex-shrink: 0;
}

.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 3px 0; font-size: 0.875rem;
  color: var(--text-secondary); font-weight: 500;
}
.summary-row.total-row {
  font-size: 1.1rem; font-weight: 800; color: var(--text-primary);
  border-top: 2px solid var(--border);
  padding-top: 9px; margin-top: 5px;
}
.summary-row.total-row span:last-child { color: var(--accent); }
.summary-row.change-row { color: #16a34a; font-weight: 700; font-size: 0.9rem; }

/* Cash input */
.cash-label {
  font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.07em;
  display: block; margin: 11px 0 5px;
}
.cash-field {
  width: 100%; padding: 10px 14px;
  background: var(--bg-primary); border: 1.5px solid var(--border);
  border-radius: 9px; color: var(--text-primary);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.97rem; font-weight: 600; outline: none;
  transition: all 0.18s;
}
.cash-field:focus { border-color: var(--accent); background: #fff; box-shadow: 0 0 0 3px rgba(59,111,240,0.10); }

/* Action buttons */
.cart-actions { margin-top: 11px; display: flex; flex-direction: column; gap: 7px; }

.btn-process {
  width: 100%; padding: 12px 16px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff; font-size: 0.9rem; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all 0.18s; box-shadow: 0 3px 12px rgba(22,163,74,0.28);
  letter-spacing: 0.01em;
}
.btn-process:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(22,163,74,0.38); }
.btn-process:disabled, .btn-process.locked {
  background: linear-gradient(135deg, #94a3b8, #64748b) !important;
  box-shadow: none !important; cursor: not-allowed !important;
  transform: none !important; opacity: 0.75;
}
.drawer-lock-notice {
  display:flex; align-items:center; gap:8px; padding:9px 12px;
  background:rgba(234,108,0,0.08); border:1.5px solid rgba(234,108,0,0.25);
  border-radius:9px; font-size:0.78rem; font-weight:600;
  color:#ea6c00; margin-bottom:8px; cursor:pointer;
}
.drawer-lock-notice:hover { background:rgba(234,108,0,0.14); }

.cart-btn-row { display: flex; gap: 7px; }
.btn-clear {
  flex: 1; padding: 9px 12px; border: 1.5px solid #e2e8f0;
  border-radius: 9px; background: #fff; color: var(--text-secondary);
  font-size: 0.8rem; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
  transition: all 0.15s;
}
.btn-clear:hover { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }

.btn-restock {
  flex: 1; padding: 9px 12px; border: 1.5px solid #fde68a;
  border-radius: 9px; background: #fffbeb; color: #b45309;
  font-size: 0.8rem; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
  transition: all 0.15s;
}
.btn-restock:hover { background: #fef3c7; border-color: #fbbf24; }

/* ════════════════════════════════════════
   MOBILE CART FAB + DRAWER
════════════════════════════════════════ */
.mobile-cart-toggle {
  display: none; position: fixed; bottom: 20px; right: 20px; z-index: 300;
  background: var(--accent); color: #fff; border: none; border-radius: 50px;
  padding: 14px 20px; font-size: 0.875rem; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
  box-shadow: 0 4px 20px rgba(59,111,240,0.45);
  align-items: center; gap: 8px; transition: all 0.2s; white-space: nowrap;
}
.mobile-cart-toggle:hover { background: var(--accent-hover); transform: translateY(-2px); }
.cart-toggle-badge { background:#fff; color:var(--accent); font-size:0.72rem; font-weight:800; padding:2px 7px; border-radius:20px; min-width:20px; text-align:center; }

.mobile-cart-overlay { display:none; position:fixed; inset:0; background:rgba(15,23,42,0.5); z-index:400; backdrop-filter:blur(3px); }
.mobile-cart-overlay.open { display:block; }

.mobile-cart-drawer {
  position:fixed; bottom:0; left:0; right:0;
  background:#fff; border-radius:20px 20px 0 0;
  box-shadow:0 -8px 40px rgba(15,23,42,0.18);
  z-index:500; display:flex; flex-direction:column; max-height:92vh;
  transform:translateY(100%); transition:transform 0.32s cubic-bezier(0.4,0,0.2,1);
}
.mobile-cart-drawer.open { transform:translateY(0); }
.mobile-cart-drawer-handle { width:40px; height:4px; background:var(--border-strong); border-radius:2px; margin:12px auto 0; flex-shrink:0; }
.mobile-cart-drawer-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px 12px; border-bottom:1.5px solid var(--border); flex-shrink:0; }
.mobile-cart-drawer-header h3 { font-size:1rem; font-weight:700; color:var(--text-primary); }
.mobile-cart-close { background:var(--bg-primary); border:1.5px solid var(--border); border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.9rem; color:var(--text-muted); transition:all 0.15s; }
.mobile-cart-close:hover { background:var(--accent-light); color:var(--accent); border-color:var(--accent); }
.mobile-cart-body { flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:7px; background:#f8fafc; -webkit-overflow-scrolling:touch; }
.mobile-cart-footer { border-top:1.5px solid var(--border); background:#fff; padding:13px 16px 20px; flex-shrink:0; }

/* ════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════ */
.cashier-stats { grid-template-columns: repeat(5, 1fr) !important; }

@media (max-width: 768px) {
  .mobile-cart-toggle { display:flex !important; }
  .cashier-page .pos-layout { grid-template-columns:1fr !important; height:auto !important; margin:10px 12px 0 !important; padding-bottom:90px; }
  .pos-cart { display:none !important; }
  .pos-products { min-height:0; overflow:visible; }
  .products-grid { grid-template-columns:repeat(auto-fill,minmax(105px,1fr)) !important; gap:8px !important; }
  .product-card { padding:12px 8px; }
  .cat-pills { overflow-x:auto; flex-wrap:nowrap; padding-bottom:4px; scrollbar-width:none; }
  .cat-pills::-webkit-scrollbar { display:none; }
  .cat-pill { white-space:nowrap; flex-shrink:0; }
  .cashier-stats { grid-template-columns:repeat(3,1fr) !important; gap:8px; padding:10px 12px 0; }
  .cashier-stats > .cstat-card:nth-child(4), .cashier-stats > .cstat-card:nth-child(5) { grid-column:span 1; }
  .cstat-card { padding:10px; gap:8px; flex-direction:column; align-items:flex-start; }
  .cstat-icon { font-size:1.5rem; }
  .cstat-label { font-size:0.62rem; }
  .cstat-value { font-size:1rem; }
  .topbar-user-role { display:none; }
  .topbar-user-card { padding:5px 8px 5px 5px; gap:6px; }
  .topbar-user-avatar { width:30px; height:30px; font-size:0.78rem; }
  .topbar-user-name { font-size:0.74rem; }
  .datetime-display { min-width:auto; width:auto; }
  .date-display { display:none; }
  .time-display { min-width:86px; width:86px; font-size:0.73rem; padding:5px 8px; }
  .modal { max-width:calc(100vw - 24px); border-radius:14px; }
  .modal-body { padding:14px; }
  .modal-footer { flex-wrap:wrap; gap:8px; }
  .modal-footer .btn { flex:1; justify-content:center; }
}
@media (max-width: 480px) {
  .cashier-stats { grid-template-columns:1fr 1fr !important; }
  .cstat-card:nth-child(5) { grid-column:1/-1; flex-direction:row; align-items:center; gap:12px; }
  .products-grid { grid-template-columns:repeat(2,1fr) !important; }
  .topbar-user-name { display:none; }
}
@media (min-width: 769px) {
  .mobile-cart-toggle { display:none !important; }
  .mobile-cart-overlay { display:none !important; }
  .mobile-cart-drawer { display:none !important; }
  .pos-cart { display:flex !important; }
}
</style>
</head>
<body class="dashboard-page cashier-page">
<div class="app-layout cashier-layout">
  <main class="main-content">

    <!-- TOPBAR -->
    <div class="topbar">
      <div class="topbar-brand"><span class="brand-icon">⚡</span><span>Villaluna General Merchandise</span></div>
      <div class="topbar-right">
        <!-- Notification Bell -->
        <div class="notif-wrap">
          <button class="notif-btn" onclick="toggleNotifPanel(event)" title="Alerts">🔔<span class="notif-badge" id="notif-badge" style="display:none;">0</span></button>
          <div class="notif-panel" id="notif-panel" style="display:none;">
            <div class="notif-panel-header"><span>⚠️ Stock Alerts</span><span id="notif-count-label" style="font-weight:500;color:var(--text-muted);"></span></div>
            <div class="notif-list" id="notif-list"><div class="notif-empty">No alerts right now ✅</div></div>
          </div>
        </div>
        <div class="datetime-display">
          <span id="current-date" class="date-display"></span>
          <span id="current-time" class="time-display"></span>
        </div>
        <div class="topbar-user-card">
          <div class="topbar-user-avatar" id="cashier-avatar-letter">C</div>
          <div class="topbar-user-info">
            <div class="topbar-user-name" id="cashier-name">Cashier</div>
            <div class="topbar-user-role">Cashier</div>
          </div>
          <div class="user-menu-wrap">
            <button class="three-dots-btn" onclick="toggleUserMenu(event)" title="Options">⋯</button>
            <div class="user-dropdown" id="user-dropdown" style="display:none;">
              <button class="user-dropdown-item logout-item" onclick="openLogoutModal()">🚪 <span>Logout</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STATS -->
    <div class="cashier-stats">
      <div class="cstat-card" id="starting-cash-card" onclick="openStartingCashModal()" style="cursor:pointer;" title="Click to set starting cash">
        <div class="cstat-icon">📂</div>
        <div>
          <div class="cstat-label">Starting Cash</div>
          <div class="cstat-value" id="cashier-starting-cash">—</div>
          <div style="font-size:0.65rem;color:var(--accent);font-weight:600;margin-top:2px;" id="starting-cash-hint">Tap to set</div>
        </div>
      </div>
      <div class="cstat-card">
        <div class="cstat-icon">🛒</div>
        <div><div class="cstat-label">Transactions Today</div><div class="cstat-value" id="cashier-orders">0</div></div>
      </div>
      <div class="cstat-card">
        <div class="cstat-icon">💰</div>
        <div><div class="cstat-label">Total Sales Today</div><div class="cstat-value" id="cashier-sales">₱0.00</div></div>
      </div>
      <div class="cstat-card">
        <div class="cstat-icon">🏷️</div>
        <div><div class="cstat-label">Items Sold Today</div><div class="cstat-value" id="cashier-items-sold">0</div></div>
      </div>
      <div class="cstat-card">
        <div class="cstat-icon">💵</div>
        <div><div class="cstat-label">Cash Collected</div><div class="cstat-value" id="cashier-cash">₱0.00</div></div>
      </div>
    </div>

    <!-- POS LAYOUT -->
    <div class="pos-layout">

      <!-- Products -->
      <div class="pos-products">
        <div class="section-toolbar">
          <div class="search-box">
            <input type="text" id="pos-search" placeholder="Search or scan barcode / product #..." onkeydown="handleBarcodeSearch(event)" oninput="renderPOSItems()" autocomplete="off">
            <span>🔍</span>
          </div>
        </div>
        <div class="cat-pills" id="pos-cat-pills"></div>
        <div class="products-grid" id="pos-products-grid"></div>
      </div>

      <!-- ── REDESIGNED CART ── -->
      <div class="pos-cart" id="desktop-cart">

        <h3>Current Order <span id="cart-item-count" class="cart-count-badge" style="display:none;"></span></h3>

        <!-- Items list -->
        <div class="cart-items" id="cart-items-list">
          <div class="cart-empty-state" id="cart-empty-msg">
            <span class="ei">🛒</span>
            <span class="et">Cart is empty</span>
            <span class="es">Tap a product to add it</span>
          </div>
        </div>

        <!-- Summary -->
        <div class="cart-summary">
          <div class="summary-row" id="cart-items-summary" style="display:none;font-size:0.8rem;padding:4px 0 10px;border-bottom:1px solid var(--border);margin-bottom:4px;color:var(--text-muted);"></div>
          <div class="summary-row"><span>Subtotal</span><span id="cart-subtotal">₱0.00</span></div>
          
          <!-- Senior/PWD Discount -->
          <div class="discount-row">
            <span class="discount-label">🪪 Senior / PWD</span>
            <div class="discount-toggle-wrap">
              <select class="discount-type-select" id="discount-type" onchange="renderCart()">
                <option value="senior">Senior</option>
                <option value="pwd">PWD</option>
              </select>
              <label class="toggle-switch">
                <input type="checkbox" id="discount-toggle" onchange="renderCart()">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="discount-amount-row" id="discount-amount-row" style="display:none;">
            <span>Discount (20%)</span><span id="cart-discount">-₱0.00</span>
          </div>

          <div class="summary-row total-row"><span>TOTAL</span><span id="cart-total">₱0.00</span></div>

          <span class="cash-label">Cash Tendered</span>
          <input type="number" id="cash-tendered" class="cash-field" placeholder="0.00" oninput="calcChange()">

          <div class="summary-row change-row" style="margin-top:6px;margin-bottom:2px;">
            <span>Change</span><span id="cart-change">₱0.00</span>
          </div>

          <div class="cart-actions">
            <div class="drawer-lock-notice" id="drawer-lock-notice" style="display:none" onclick="openStartingCashModal(true)">
              🔒 Set your starting cash to enable payments
            </div>
            <button class="btn-process" id="btn-process-desktop" onclick="processSale()">💳 Process Payment</button>
            <div class="cart-btn-row">
              <button class="btn-clear" onclick="clearCart()">🗑 Clear Order</button>
              <button class="btn-restock" onclick="openRequestModal()">📢 Request Restock</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </main>
</div>

<!-- RECENT TRANSACTIONS PANEL -->
<div class="cashier-bottom" id="cashier-bottom-panel">
  <div class="recent-txn-card">
    <div class="recent-txn-header">
      <h4>🧾 Recent Transactions</h4>
      <span style="font-size:0.73rem;color:var(--text-muted);">Today's last 10</span>
    </div>
    <div style="overflow-x:auto;">
      <table class="recent-txn-table">
        <thead>
          <tr>
            <th>TXN ID</th>
            <th>Time</th>
            <th>Items</th>
            <th>Discount</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="recent-txn-body">
          <tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">Loading…</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Mobile Cart FAB -->
<button class="mobile-cart-toggle" id="mobile-cart-btn" onclick="openMobileCart()">
  🛒 View Cart <span class="cart-toggle-badge" id="mobile-cart-badge">0</span>
</button>

<!-- Mobile Cart Overlay -->
<div class="mobile-cart-overlay" id="mobile-cart-overlay" onclick="closeMobileCart()"></div>

<!-- Mobile Cart Drawer -->
<div class="mobile-cart-drawer" id="mobile-cart-drawer">
  <div class="mobile-cart-drawer-handle"></div>
  <div class="mobile-cart-drawer-header">
    <h3>Current Order <span id="mobile-cart-count" class="cart-count-badge" style="display:none;"></span></h3>
    <button class="mobile-cart-close" onclick="closeMobileCart()">✕</button>
  </div>
  <div class="mobile-cart-body" id="mobile-cart-items-list">
    <div class="cart-empty-state">
      <span class="ei">🛒</span><span class="et">Cart is empty</span><span class="es">Add products first</span>
    </div>
  </div>
  <div class="mobile-cart-footer">
    <div class="summary-row" id="mobile-cart-items-summary" style="display:none;font-size:0.82rem;padding:4px 0 8px;border-bottom:1px solid var(--border);margin-bottom:6px;"></div>
    <div class="summary-row"><span>Subtotal</span><span id="mobile-cart-subtotal">₱0.00</span></div>
        <div class="discount-row">
      <span class="discount-label">🪪 Senior / PWD</span>
      <div class="discount-toggle-wrap">
        <select class="discount-type-select" id="mobile-discount-type" onchange="syncDiscountFromMobile()">
          <option value="senior">Senior</option>
          <option value="pwd">PWD</option>
        </select>
        <label class="toggle-switch">
          <input type="checkbox" id="mobile-discount-toggle" onchange="syncDiscountFromMobile()">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="discount-amount-row" id="mobile-discount-amount-row" style="display:none;">
      <span>Discount (20%)</span><span id="mobile-cart-discount">-₱0.00</span>
    </div>
    <div class="summary-row total-row" style="margin-bottom:10px;"><span>TOTAL</span><span id="mobile-cart-total">₱0.00</span></div>
    <span class="cash-label">Cash Tendered</span>
    <input type="number" id="mobile-cash-tendered" class="cash-field" placeholder="0.00" oninput="calcChangeMobile()" style="margin-bottom:8px;">
    <div class="summary-row change-row" style="margin-bottom:12px;"><span>Change</span><span id="mobile-cart-change">₱0.00</span></div>
    <div class="cart-actions">
      <div class="drawer-lock-notice" id="drawer-lock-notice-mobile" style="display:none" onclick="openStartingCashModal(true)">
        🔒 Set your starting cash to enable payments
      </div>
      <button class="btn-process" id="btn-process-mobile" onclick="processSaleMobile()">💳 Process Payment</button>
      <div class="cart-btn-row">
        <button class="btn-clear" onclick="clearCart();closeMobileCart();">🗑 Clear</button>
        <button class="btn-restock" onclick="openRequestModal();closeMobileCart();">📢 Restock</button>
      </div>
    </div>
  </div>
</div>

<!-- REQUEST MODAL -->
<div id="request-modal" class="modal-overlay" style="display:none">
  <div class="modal">
    <div class="modal-header"><h3>Request Stock Restock</h3><button class="modal-close" onclick="closeRequestModal()">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label for="req-item">Select Item</label><select id="req-item"><option value="">— Select Item —</option></select></div>
      <div class="form-group"><label for="req-note">Note / Reason</label><textarea id="req-note" rows="3" placeholder="e.g. Running low on this item..." style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-secondary);color:var(--text-primary);resize:none;font-family:inherit;"></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeRequestModal()">Cancel</button>
      <button class="btn btn-warning" onclick="submitRequest()">Send Request</button>
    </div>
  </div>
</div>

<!-- RECEIPT MODAL -->
<div id="receipt-modal" class="modal-overlay" style="display:none">
  <div class="modal receipt-modal">
    <div class="modal-header"><h3>🧾 Receipt</h3><button class="modal-close" onclick="closeReceipt()">✕</button></div>
    <div id="receipt-content" class="receipt-content"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="confirmSale(true)">🖨 Print & Done</button>
      <button class="btn btn-primary" onclick="confirmSale(false)">✔ Done</button>
    </div>
  </div>
</div>

<!-- LOGOUT CONFIRM MODAL -->
<div id="logout-modal" class="modal-overlay" style="display:none">
  <div class="modal logout-confirm-modal">
    <div class="logout-modal-icon">🚪</div>
    <h3 class="logout-modal-title">Log Out?</h3>
    <p class="logout-modal-msg">Are you sure you want to log out of Villaluna General Merchandise?</p>
    <div class="modal-footer" style="justify-content:center;gap:12px;padding-top:8px;">
      <button class="btn btn-outline" style="min-width:100px;" onclick="closeLogoutModal()">Cancel</button>
      <button class="btn btn-danger" style="min-width:100px;" onclick="logout()">Yes, Logout</button>
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

<!-- STARTING CASH MODAL -->
<div id="starting-cash-modal" class="modal-overlay" style="display:none">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3>📂 Cash Drawer</h3>
      <button class="modal-close" onclick="closeStartingCashModal()">✕</button>
    </div>
    <div class="modal-body">
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px;line-height:1.5;">
        Enter the amount of cash in your drawer at the <strong>start of your shift</strong>.
      </p>
      <div class="form-group">
        <label for="starting-cash-input">Starting Cash Amount (₱)</label>
        <input type="number" id="starting-cash-input" placeholder="e.g. 5000.00" step="0.01" min="0"
          style="font-size:1.3rem;font-weight:700;text-align:center;padding:14px;"
          onkeydown="if(event.key==='Enter') saveStartingCash()">
      </div>
      <div id="starting-cash-set-info" style="display:none;font-size:0.78rem;color:var(--text-muted);text-align:center;margin-top:4px;"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeStartingCashModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveStartingCash()">💾 Save</button>
    </div>
  </div>
</div>



<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/sweetalert.js"></script>
<script src="js/supabase.js"></script>
<script src="js/db.js"></script>
<script src="js/auth.js"></script>
<script src="js/audit.js"></script>
<script src="js/pos.js"></script>
<script src="js/cashier.js"></script>

<script>
/* ── Mobile Cart ── */
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
  const src = document.getElementById('cart-items-list');
  const dst = document.getElementById('mobile-cart-items-list');
  if (src && dst) dst.innerHTML = src.innerHTML;
  const copy = (a,b) => { const fa=document.getElementById(a),fb=document.getElementById(b); if(fa&&fb) fb.textContent=fa.textContent; };
  copy('cart-subtotal','mobile-cart-subtotal');
  copy('cart-total','mobile-cart-total'); copy('cart-change','mobile-cart-change');
  copy('cart-discount','mobile-cart-discount');
  const s=document.getElementById('cart-items-summary'), ms=document.getElementById('mobile-cart-items-summary');
  if(s&&ms){ms.innerHTML=s.innerHTML;ms.style.display=s.style.display;}
  const b=document.getElementById('cart-item-count'), mb=document.getElementById('mobile-cart-count');
  if(b&&mb){mb.textContent=b.textContent;mb.style.display=b.style.display;}
  const cash=document.getElementById('cash-tendered'), mc=document.getElementById('mobile-cash-tendered');
  if(cash&&mc) mc.value=cash.value;
  // Sync discount toggle state desktop -> mobile
  const dt=document.getElementById('discount-toggle'), mdt=document.getElementById('mobile-discount-toggle');
  const dty=document.getElementById('discount-type'), mdty=document.getElementById('mobile-discount-type');
  if(dt&&mdt) mdt.checked=dt.checked;
  if(dty&&mdty) mdty.value=dty.value;
  const dr=document.getElementById('discount-amount-row'), mdr=document.getElementById('mobile-discount-amount-row');
  if(dr&&mdr) mdr.style.display=dr.style.display;
}
function syncDiscountFromMobile() {
  const mdt=document.getElementById('mobile-discount-toggle'), dt=document.getElementById('discount-toggle');
  const mdty=document.getElementById('mobile-discount-type'), dty=document.getElementById('discount-type');
  if(mdt&&dt) dt.checked=mdt.checked;
  if(mdty&&dty) dty.value=mdty.value;
  if(typeof renderCart==='function') renderCart();
  syncMobileCart();
}
function calcChangeMobile() {
  const mc=document.getElementById('mobile-cash-tendered'), dc=document.getElementById('cash-tendered');
  if(mc&&dc){dc.value=mc.value; if(typeof calcChange==='function') calcChange();
  setTimeout(()=>{ const ch=document.getElementById('cart-change'),mch=document.getElementById('mobile-cart-change'); if(ch&&mch) mch.textContent=ch.textContent; },50);}
}
function processSaleMobile() {
  const mc=document.getElementById('mobile-cash-tendered'),dc=document.getElementById('cash-tendered');
  if(mc&&dc) dc.value=mc.value; closeMobileCart();
  if(typeof processSale==='function') processSale();
}
function updateMobileCartBadge() {
  const b=document.getElementById('cart-item-count'),fb=document.getElementById('mobile-cart-badge');
  if(b&&fb) fb.textContent=b.textContent||'0';
}
document.addEventListener('DOMContentLoaded',()=>{
  const cartList=document.getElementById('cart-items-list');
  if(cartList){
    new MutationObserver(()=>{
      updateMobileCartBadge();
      const emptyMsg=document.getElementById('cart-empty-msg');
      const hasItems=cartList.querySelectorAll('.cart-item').length>0;
      if(emptyMsg) emptyMsg.style.display=hasItems?'none':'flex';
      const drawer=document.getElementById('mobile-cart-drawer');
      if(drawer?.classList.contains('open')) syncMobileCart();
    }).observe(cartList,{childList:true,subtree:true,characterData:true});
  }
  const badge=document.getElementById('cart-item-count');
  if(badge) new MutationObserver(updateMobileCartBadge).observe(badge,{childList:true,characterData:true,subtree:true});
  let startY=0;
  const drawer=document.getElementById('mobile-cart-drawer');
  if(drawer){
    drawer.addEventListener('touchstart',e=>{startY=e.touches[0].clientY;},{passive:true});
    drawer.addEventListener('touchmove',e=>{if(e.touches[0].clientY-startY>60)closeMobileCart();},{passive:true});
  }
});
</script>
</body>
</html>
