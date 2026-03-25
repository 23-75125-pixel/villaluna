// ============================================================
//  SwiftPOS — Database Layer (Supabase)
// ============================================================

function getDbClient() {
  return window.getSupabaseClient();
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function buildAuthEmail(username) {
  const value = normalizeUsername(username);
  if (!value) return '';
  if (value.includes('@')) return value;
  return `${value}@swiftpos.local`;
}

function sanitizeAuthUser(user) {
  if (!user) return null;
  const rawMeta = user.user_metadata || {};
  const appMeta = user.app_metadata || {};
  const role = (rawMeta.role || appMeta.role || 'cashier').toLowerCase();
  const branchId = rawMeta.branch_id ?? appMeta.branch_id ?? null;
  const status = (rawMeta.status || appMeta.status || 'active').toLowerCase();
  return {
    auth_user_id: user.id,
    email: user.email || null,
    username: rawMeta.username || (user.email ? user.email.split('@')[0] : ''),
    fullname: rawMeta.full_name || rawMeta.fullname || rawMeta.username || 'User',
    role: ['admin', 'staff', 'cashier'].includes(role) ? role : 'cashier',
    branch_id: branchId ? parseInt(branchId, 10) : null,
    status: ['active', 'inactive', 'terminated'].includes(status) ? status : 'active'
  };
}

function assertSupabaseConfigured() {
  if (!window.isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Add your project URL and publishable key in js/supabase.js');
  }
}

async function fetchCurrentProfile() {
  assertSupabaseConfigured();
  const client = getDbClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  const authUser = authData?.user;
  if (!authUser) return null;

  const { data, error } = await client
    .from('pos_users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return sanitizeAuthUser(authUser);
  return data;
}

async function requireCurrentProfile() {
  const profile = await fetchCurrentProfile();
  if (!profile) throw new Error('No active user session.');
  return profile;
}

async function verifyPasswordForCurrentUser(password) {
  const client = getDbClient();
  const profile = await requireCurrentProfile();
  const email = profile.email || buildAuthEmail(profile.username);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return true;
}

async function restoreSession(session) {
  if (!session?.access_token || !session?.refresh_token) return;
  const client = getDbClient();
  await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });
}

async function waitForUserProfile(username, retries = 8, delayMs = 500) {
  const client = getDbClient();
  const target = normalizeUsername(username);

  for (let i = 0; i < retries; i++) {
    const { data, error } = await client
      .from('pos_users')
      .select('*')
      .eq('username', target)
      .maybeSingle();

    if (!error && data) return data;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('User profile was created in Auth but is not available in pos_users yet.');
}

async function apiLogin(username, password) {
  assertSupabaseConfigured();
  const client = getDbClient();
  const email = buildAuthEmail(username);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const profile = await requireCurrentProfile();
  if (profile.status && profile.status !== 'active') {
    await client.auth.signOut();
    throw new Error(profile.status === 'terminated' ? 'Account disabled.' : 'Account is not active.');
  }

  await logAudit(
    'LOGIN',
    'Auth',
    `${profile.fullname} (${profile.role}) logged in`
  ).catch(() => {});

  return profile;
}

async function apiValidateSession() {
  assertSupabaseConfigured();
  const client = getDbClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (!data?.session) throw new Error('Session invalid');

  const profile = await requireCurrentProfile();
  if (profile.status && profile.status !== 'active') throw new Error('Session invalid');
  return profile;
}

async function apiLogout(user) {
  assertSupabaseConfigured();
  if (user) {
    await logAudit(
      'LOGOUT',
      'Auth',
      `${user.fullname || user.username || 'User'} logged out`
    ).catch(() => {});
  }
  const client = getDbClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
  return { ok: true };
}

const DB = {
  async getBranches() {
    const { data, error } = await getDbClient()
      .from('pos_branches')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addBranch(branch) {
    const { data, error } = await getDbClient()
      .from('pos_branches')
      .insert({
        name: branch.name,
        branch_number: branch.branch_number || null,
        address: branch.address || null,
        contact_number: branch.contact_number || null,
        status: branch.status || 'active'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBranch(id, updates) {
    const payload = {};
    ['name', 'branch_number', 'address', 'contact_number', 'status'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(updates, key)) payload[key] = updates[key];
    });
    const { data, error } = await getDbClient()
      .from('pos_branches')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUsers() {
    const { data, error } = await getDbClient()
      .from('pos_users')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addUser(user) {
    const client = getDbClient();
    const currentSession = (await client.auth.getSession()).data.session;
    const username = normalizeUsername(user.username);
    const email = (user.email || buildAuthEmail(username)).toLowerCase();
    const branchId = user.branch_id ? parseInt(user.branch_id, 10) : null;

    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email,
      password: user.password,
      options: {
        data: {
          username,
          full_name: user.fullname,
          fullname: user.fullname,
          role: user.role || 'cashier',
          branch_id: branchId
        }
      }
    });
    if (signUpError) throw signUpError;

    if (signUpData?.session && currentSession) {
      await restoreSession(currentSession);
    }

    const created = await waitForUserProfile(username);
    if (user.status && user.status !== created.status) {
      await this.updateUser(created.id, { status: user.status });
      return waitForUserProfile(username);
    }
    return created;
  },

  async updateUser(id, updates) {
    const client = getDbClient();
    const current = await requireCurrentProfile();
    const users = await this.getUsers();
    const target = users.find(u => String(u.id) === String(id));
    if (!target) throw new Error('User not found.');

    if (Object.prototype.hasOwnProperty.call(updates, 'password')) {
      if (String(current.id) !== String(id)) {
        throw new Error('Password changes for other users are not supported in the frontend. Use Supabase Auth dashboard or a secure server function.');
      }
      const { error } = await client.auth.updateUser({ password: updates.password });
      if (error) throw error;
    }

    if (String(current.id) === String(id)) {
      const authUpdates = {};
      if (Object.prototype.hasOwnProperty.call(updates, 'email')) {
        authUpdates.email = updates.email || null;
      }
      const metadata = {};
      if (Object.prototype.hasOwnProperty.call(updates, 'fullname')) {
        metadata.full_name = updates.fullname;
        metadata.fullname = updates.fullname;
      }
      if (Object.prototype.hasOwnProperty.call(updates, 'username')) {
        metadata.username = normalizeUsername(updates.username);
      }
      if (Object.keys(metadata).length) authUpdates.data = metadata;
      if (Object.keys(authUpdates).length) {
        const { error } = await client.auth.updateUser(authUpdates);
        if (error) throw error;
      }
    }

    const payload = {};
    ['username', 'fullname', 'email', 'contact_number', 'role', 'status', 'branch_id', 'failed_attempts', 'locked_until'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(updates, key)) payload[key] = updates[key];
    });

    if (!Object.keys(payload).length) return target;

    const { data, error } = await client
      .from('pos_users')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteUser(id) {
    const { error } = await getDbClient()
      .from('pos_users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { ok: true };
  },

  async getItems(branchId = null) {
    let query = getDbClient()
      .from('pos_items')
      .select('*')
      .order('id', { ascending: true });

    if (branchId != null) {
      query = query.or(`branch_id.is.null,branch_id.eq.${branchId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getItemsStrict(branchId) {
    if (branchId == null) return [];
    const { data, error } = await getDbClient()
      .from('pos_items')
      .select('*')
      .eq('branch_id', branchId)
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getItem(id) {
    const { data, error } = await getDbClient()
      .from('pos_items')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async addItem(item) {
    const payload = {
      name: item.name,
      product_number: item.product_number || null,
      emoji: item.emoji || '🏷️',
      price: parseFloat(item.price || 0),
      stock: parseInt(item.stock || 0, 10),
      category: item.category || 'Others',
      branch_id: item.branch_id ?? null
    };
    const { data, error } = await getDbClient()
      .from('pos_items')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateItem(id, updates) {
    const payload = {};
    ['name', 'product_number', 'emoji', 'price', 'stock', 'category', 'branch_id'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(updates, key)) payload[key] = updates[key];
    });
    const { data, error } = await getDbClient()
      .from('pos_items')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteItem(id) {
    const { error } = await getDbClient()
      .from('pos_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { ok: true };
  },

  async deductStock(cartItems) {
    for (const item of cartItems || []) {
      const current = await this.getItem(item.id);
      const nextStock = Math.max(0, parseInt(current.stock || 0, 10) - parseInt(item.qty || 0, 10));
      const { error } = await getDbClient()
        .from('pos_items')
        .update({ stock: nextStock })
        .eq('id', item.id);
      if (error) throw error;
    }
    return { ok: true };
  },

  async getSales(branchId = null) {
    let query = getDbClient()
      .from('pos_sales')
      .select('*')
      .order('sold_at', { ascending: true });

    if (branchId != null) query = query.eq('branch_id', branchId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeSale);
  },

  async addSale(sale) {
    const current = await requireCurrentProfile();
    const row = {
      id: sale.id,
      sold_at: sale.datetime || new Date().toISOString(),
      cashier_user_id: current.id,
      cashier: sale.cashier,
      cashier_name: sale.cashierName,
      items: sale.items || [],
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount_type: sale.discount_type || null,
      discount_amt: sale.discount_amt || 0,
      total: sale.total,
      cash: sale.cash,
      change: sale.change,
      status: sale.status || 'completed',
      branch_id: sale.branchId ?? current.branch_id ?? null
    };
    const { data, error } = await getDbClient()
      .from('pos_sales')
      .insert(row)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeSale(data);
  },

  async getRequests(branchId = null) {
    let query = getDbClient()
      .from('pos_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (branchId != null) query = query.eq('branch_id', branchId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeRequest);
  },

  async addRequest(req) {
    const current = await requireCurrentProfile();
    const row = {
      item_id: req.itemId || null,
      item_name: req.itemName,
      stock: req.stock || 0,
      type: req.type || 'manual-request',
      requested_by_user_id: req.requestedByUserId || current.id,
      requested_by: req.requestedBy || current.username,
      requested_by_name: req.requestedByName || current.fullname,
      note: req.note || null,
      status: req.status || 'pending',
      requested_at: req.datetime || new Date().toISOString(),
      branch_id: req.branchId ?? current.branch_id ?? null
    };
    const { data, error } = await getDbClient()
      .from('pos_requests')
      .insert(row)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRequest(data);
  },

  async updateRequest(id, updates) {
    const payload = {};
    ['item_id', 'item_name', 'stock', 'type', 'requested_by', 'requested_by_name', 'note', 'status', 'requested_at', 'branch_id'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(updates, key)) payload[key] = updates[key];
    });
    const { data, error } = await getDbClient()
      .from('pos_requests')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRequest(data);
  },

  async getPendingRequestCount(branchId = null) {
    let query = getDbClient()
      .from('pos_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (branchId != null) query = query.eq('branch_id', branchId);

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  async upsertCashierDailySummary(sale) {
    const current = await requireCurrentProfile();
    const salesDate = (sale.datetime || new Date().toISOString()).slice(0, 10);
    const branchId = sale.branchId ?? current.branch_id;

    const { data: existing, error: selectError } = await getDbClient()
      .from('pos_cashier_daily_summary')
      .select('*')
      .eq('sales_date', salesDate)
      .eq('cashier_user_id', current.id)
      .eq('branch_id', branchId)
      .maybeSingle();
    if (selectError) throw selectError;

    const transactionCount = 1;
    const itemsSold = (sale.items || []).reduce((sum, item) => sum + parseInt(item.qty || 0, 10), 0);
    const totalSales = parseFloat(sale.total || 0);

    if (existing) {
      const { data, error } = await getDbClient()
        .from('pos_cashier_daily_summary')
        .update({
          transactions: parseInt(existing.transactions || 0, 10) + transactionCount,
          items_sold: parseInt(existing.items_sold || 0, 10) + itemsSold,
          total_sales: parseFloat(existing.total_sales || 0) + totalSales
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await getDbClient()
      .from('pos_cashier_daily_summary')
      .insert({
        sales_date: salesDate,
        cashier_user_id: current.id,
        cashier: current.username,
        cashier_name: current.fullname,
        branch_id: branchId,
        transactions: transactionCount,
        items_sold: itemsSold,
        total_sales: totalSales,
        starting_cash: null
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async getCashierDailySummary(date = null, branchId = null) {
    let query = getDbClient()
      .from('pos_cashier_daily_summary')
      .select('*')
      .order('sales_date', { ascending: false });
    if (date) query = query.eq('sales_date', date);
    if (branchId != null) query = query.eq('branch_id', branchId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getStartingCash(cashier, date, branchId = null) {
    let query = getDbClient()
      .from('pos_cashier_daily_summary')
      .select('starting_cash')
      .eq('cashier', cashier)
      .eq('sales_date', date);
    if (branchId != null) query = query.eq('branch_id', branchId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data?.starting_cash ?? null;
  },

  async setStartingCash(cashier, cashierName, date, branchId, amount) {
    const current = await requireCurrentProfile();
    const { data: existing, error: selectError } = await getDbClient()
      .from('pos_cashier_daily_summary')
      .select('*')
      .eq('sales_date', date)
      .eq('cashier_user_id', current.id)
      .eq('branch_id', branchId)
      .maybeSingle();
    if (selectError) throw selectError;

    if (existing) {
      const { data, error } = await getDbClient()
        .from('pos_cashier_daily_summary')
        .update({ starting_cash: amount })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await getDbClient()
      .from('pos_cashier_daily_summary')
      .insert({
        sales_date: date,
        cashier_user_id: current.id,
        cashier,
        cashier_name: cashierName,
        branch_id: branchId,
        transactions: 0,
        items_sold: 0,
        total_sales: 0,
        starting_cash: amount
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async getSetting(key) {
    const { data, error } = await getDbClient()
      .from('pos_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data?.value ?? null;
  },

  async setSetting(key, value) {
    const { data, error } = await getDbClient()
      .from('pos_settings')
      .upsert({ key, value: String(value) }, { onConflict: 'key' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async verifyCurrentPassword(password) {
    return verifyPasswordForCurrentUser(password);
  }
};

async function logAudit(action, category, description, meta = null) {
  const current = getCurrentUser();
  if (!current) return;

  const payload = {
    actor_user_id: current.id,
    username: current.username,
    fullname: current.fullname,
    role: current.role,
    action,
    category,
    description,
    meta: meta || null,
    branch_id: current.branch_id ?? null
  };

  const { error } = await getDbClient()
    .from('pos_audit_log')
    .insert(payload);
  if (error) throw error;
}

async function getAuditLogs({ search = '', role = '', category = '', dateFrom = '', dateTo = '' } = {}) {
  let query = getDbClient()
    .from('pos_audit_log')
    .select('*')
    .order('logged_at', { ascending: false });

  if (role) query = query.eq('role', role);
  if (category) query = query.eq('category', category);
  if (dateFrom) query = query.gte('logged_at', `${dateFrom}T00:00:00`);
  if (dateTo) query = query.lte('logged_at', `${dateTo}T23:59:59`);
  if (search) query = query.or(`username.ilike.%${search}%,fullname.ilike.%${search}%,action.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row => ({
    ...row,
    datetime: row.logged_at
  }));
}

function normalizeSale(row) {
  return {
    id: row.id,
    datetime: row.sold_at,
    cashier: row.cashier,
    cashierName: row.cashier_name,
    items: Array.isArray(row.items) ? row.items : (row.items || []),
    subtotal: parseFloat(row.subtotal || 0),
    tax: parseFloat(row.tax || 0),
    discount_type: row.discount_type || null,
    discount_amt: parseFloat(row.discount_amt || 0),
    total: parseFloat(row.total || 0),
    cash: parseFloat(row.cash || 0),
    change: parseFloat(row.change || 0),
    status: row.status,
    branchId: row.branch_id
  };
}

function normalizeRequest(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name,
    stock: row.stock,
    type: row.type,
    requestedBy: row.requested_by,
    requestedByName: row.requested_by_name,
    note: row.note,
    status: row.status,
    datetime: row.requested_at,
    branchId: row.branch_id
  };
}

function formatCurrency(n) {
  return '₱' + parseFloat(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' });
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('en-PH', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function showToast(msg, type = 'success') {
  if (window.hasSweetAlert && window.hasSweetAlert()) {
    window.Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type === 'info' ? 'info' : type === 'warning' ? 'warning' : type === 'error' ? 'error' : 'success',
      title: String(msg || ''),
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true
    });
    return;
  }
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.display = 'none'; }, 3200);
}

async function checkLowStock(branchId = null) {
  const current = getCurrentUser();
  if (!current) return;

  const items = await DB.getItems(branchId);
  const low = items.filter(i => i.stock > 0 && i.stock <= stockThreshold());
  const reqs = await DB.getRequests(branchId);

  for (const item of low) {
    const alreadyAlerted = reqs.some(
      r => r.itemId === item.id && r.type === 'auto-alert' && r.status === 'pending'
    );
    if (!alreadyAlerted) {
      await DB.addRequest({
        itemId: item.id,
        itemName: item.name,
        stock: item.stock,
        type: 'auto-alert',
        requestedBy: current.username,
        requestedByName: current.fullname,
        status: 'pending',
        note: `Stock critically low: only ${item.stock} remaining.`,
        branchId: item.branch_id || null
      });
    }
  }
}

async function updateNotifBadge(branchId = null) {
  const pending = await DB.getPendingRequestCount(branchId);
  const badge = document.getElementById('req-badge');
  const notifCount = document.getElementById('notif-count');
  if (badge) {
    badge.textContent = pending;
    badge.style.display = pending ? 'inline' : 'none';
  }
  if (notifCount) {
    notifCount.textContent = pending;
    notifCount.style.display = pending ? 'inline' : 'none';
  }
}

let _stockThreshold = 5;

async function getStockThreshold() {
  const val = await DB.getSetting('stock_threshold');
  _stockThreshold = val ? parseInt(val, 10) : 5;
  return _stockThreshold;
}

function stockThreshold() {
  return _stockThreshold;
}
