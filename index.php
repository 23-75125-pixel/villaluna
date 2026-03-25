<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Villaluna General Merchandise — Login</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/bootstrap-ux.css">
</head>
<body class="login-page">

  <div id="offline-banner" class="offline-banner" style="display:none;">
    <span class="offline-icon">📡</span>
    <span class="offline-text">No internet connection — please check your network and try again.</span>
    <span id="offline-retry" class="offline-retry" onclick="checkConnection()">Retry</span>
  </div>

  <div class="login-bg">
    <div class="bg-orb orb1"></div>
    <div class="bg-orb orb2"></div>
    <div class="bg-orb orb3"></div>
  </div>

  <div class="login-container">
    <div class="login-shell">
      <div class="login-media">
        <img
          src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80"
          alt="Agricultural products display"
          class="login-media-image"
        >
        <div class="login-media-overlay"></div>
        <div class="login-media-content">
          <div class="login-brand">
            <div class="brand-icon">⚡</div>
            <h1>Villaluna General Merchandise</h1>
            <p>Modern agri-supply point of sale</p>
          </div>
        </div>
      </div>

      <div class="login-card">
        <div class="login-card-header">
          <span class="login-kicker">Store Access</span>
          <h2>Welcome back</h2>
          <p class="login-subtitle">Sign in to your account</p>
        </div>

        <div id="login-error" class="alert alert-error" style="display:none;"></div>

        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" placeholder="Enter username" autocomplete="off">
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="Enter password">
        </div>

        <button class="btn btn-primary btn-full login-submit-btn" onclick="onSignIn()">Sign In</button>

        <div class="login-meta">
          <span>Villaluna General Merchandise</span>
          <span>Powered by Supabase</span>
        </div>
      </div>
    </div>
  </div>

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

  <script>
    const offlineBanner = document.getElementById('offline-banner');

    function showBanner() {
      offlineBanner.style.display = 'flex';
    }

    function hideBanner() {
      offlineBanner.style.display = 'none';
    }

    function checkConnection() {
      const retryBtn = document.getElementById('offline-retry');
      retryBtn.textContent = 'Checking...';
      retryBtn.style.pointerEvents = 'none';

      if (!window.isSupabaseConfigured()) {
        showBanner();
        retryBtn.textContent = 'Retry';
        retryBtn.style.pointerEvents = 'auto';
        return;
      }

      fetch(`${window.SUPABASE_CONFIG.url}/auth/v1/settings`, {
        method: 'GET',
        cache: 'no-store',
        headers: { apikey: window.SUPABASE_CONFIG.anonKey }
      })
        .then(() => {
          hideBanner();
          retryBtn.textContent = 'Retry';
          retryBtn.style.pointerEvents = 'auto';
        })
        .catch(() => {
          showBanner();
          retryBtn.textContent = 'Retry';
          retryBtn.style.pointerEvents = 'auto';
        });
    }

    function onSignIn() {
      if (!navigator.onLine) {
        showBanner();
        return;
      }
      hideBanner();
      handleLogin();
    }

    window.addEventListener('online', () => checkConnection());
    window.addEventListener('offline', () => showBanner());
  </script>
</body>
</html>
