// ============================================================
//  SwiftPOS — Auth (Supabase)
// ============================================================

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 200);
}

function setCurrentUser(profile) {
  if (!profile) {
    sessionStorage.removeItem('pos_current_user');
    return;
  }
  sessionStorage.setItem('pos_current_user', JSON.stringify({
    id: profile.id,
    auth_user_id: profile.auth_user_id || null,
    username: profile.username,
    fullname: profile.fullname,
    role: profile.role,
    branch_id: profile.branch_id ?? null,
    email: profile.email || null
  }));
}

function getLoginHelpMessage(err) {
  const msg = err?.message || '';
  if (!window.isSupabaseConfigured()) {
    return 'Supabase is not configured yet. Add your project URL and publishable key in js/supabase.js';
  }
  return msg || 'Invalid username or password.';
}

async function handleLogin() {
  const rawUsername = document.getElementById('username').value;
  const rawPassword = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.querySelector('.btn-primary');

  const username = sanitize(rawUsername).toLowerCase();
  const password = sanitize(rawPassword);

  errEl.style.display = 'none';

  if (!username || !password) {
    errEl.textContent = 'Please enter your username and password.';
    errEl.style.display = 'block';
    return;
  }

  if (window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Sign in now?',
      text: `Continue login as ${username}?`,
      icon: 'question',
      confirmButtonText: 'Sign In'
    });
    if (!proceed) return;
  }

  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const profile = await apiLogin(username, password);
    setCurrentUser(profile);
    if (window.swalNotice) {
      await window.swalNotice({
        icon: 'success',
        title: 'Login successful',
        text: `Welcome, ${profile.fullname || profile.username}!`,
        timer: 1200,
        showConfirmButton: false
      });
    }

    if (profile.role === 'admin') window.location.href = 'admin.php';
    else if (profile.role === 'staff') window.location.href = 'staff.php';
    else if (profile.role === 'cashier') window.location.href = 'cashier.php';
    else throw new Error('Unknown role. Contact your administrator.');
  } catch (err) {
    errEl.textContent = getLoginHelpMessage(err);
    errEl.style.display = 'block';
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

function getCurrentUser() {
  const data = sessionStorage.getItem('pos_current_user');
  return data ? JSON.parse(data) : null;
}

function requireAuth(expectedRole) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.php';
    return null;
  }
  if (expectedRole && user.role !== expectedRole) {
    window.location.href = 'index.php';
    return null;
  }
  return user;
}

async function requireAuthAsync(expectedRole) {
  try {
    const profile = await apiValidateSession();
    if (expectedRole && profile.role !== expectedRole) {
      setCurrentUser(null);
      window.location.href = 'index.php';
      return null;
    }
    setCurrentUser(profile);
    return profile;
  } catch {
    setCurrentUser(null);
    window.location.href = 'index.php';
    return null;
  }
}

async function logout(skipConfirm = false) {
  const user = getCurrentUser();
  if (!skipConfirm && window.swalConfirm) {
    const proceed = await window.swalConfirm({
      title: 'Log out now?',
      text: 'Your current session will be ended.',
      icon: 'question',
      confirmButtonText: 'Log Out',
      confirmButtonColor: '#dc2626'
    });
    if (!proceed) return;
  }
  try {
    await apiLogout(user);
  } catch (_) {
    // ignore logout logging issues
  }
  if (window.swalNotice) {
    await window.swalNotice({
      icon: 'success',
      title: 'Logged out',
      text: 'You have been signed out successfully.',
      timer: 1000,
      showConfirmButton: false
    });
  }
  setCurrentUser(null);
  window.location.href = 'index.php';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('username')) handleLogin();
});

function updateClock() {
  const el = document.getElementById('current-time');
  if (el) {
    el.textContent = new Date().toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

setInterval(updateClock, 1000);
updateClock();
