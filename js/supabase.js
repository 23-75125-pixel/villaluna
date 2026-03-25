// ============================================================
//  SwiftPOS — Supabase Client Config
//  Paste your Supabase project URL and anon key below.
//  Do NOT put the service_role key in this file.
// ============================================================

window.SUPABASE_CONFIG = {
  url: 'https://lictthhdaqddxodzyzpq.supabase.co',
  anonKey: 'sb_publishable_KIYrblmijTHGl4j7vkL7Iw_2RFTT-rO'
};

if (window.RENDER_SUPABASE_CONFIG) {
  window.SUPABASE_CONFIG = {
    ...window.SUPABASE_CONFIG,
    ...window.RENDER_SUPABASE_CONFIG
  };
}


window.isSupabaseConfigured = function isSupabaseConfigured() {
  const cfg = window.SUPABASE_CONFIG || {};
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('https://') &&
    cfg.url.includes('.supabase.co') &&
    !cfg.url.includes('YOUR_PROJECT_ID') &&
    !cfg.anonKey.includes('YOUR_SUPABASE_ANON_KEY')
  );
};

window.getSupabaseClient = function getSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('Supabase library failed to load.');
  }

  if (!window.isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Add your project URL and anon key in js/supabase.js');
  }

  if (!window.__swiftposSupabase) {
    window.__swiftposSupabase = window.supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  return window.__swiftposSupabase;
};
