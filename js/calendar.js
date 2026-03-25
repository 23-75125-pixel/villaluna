// ============================================================
//  SwiftPOS — Custom Calendar Modal
//  Replaces native <input type="date"> with a styled popup
// ============================================================

(function () {
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  let activeInput  = null;
  let currentYear  = 0;
  let currentMonth = 0;
  let selectedDate = null; // {y,m,d}

  // ── Build DOM ──────────────────────────────────────────────
  function buildCalendarModal() {
    if (document.getElementById('swiftcal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'swiftcal-overlay';
    overlay.innerHTML = `
      <div id="swiftcal-modal" role="dialog" aria-label="Date Picker">
        <div class="swiftcal-header">
          <button id="swiftcal-prev" aria-label="Previous month">&#8592;</button>
          <div class="swiftcal-month-year">
            <span id="swiftcal-month-label"></span>
            <span id="swiftcal-year-label"></span>
          </div>
          <button id="swiftcal-next" aria-label="Next month">&#8594;</button>
        </div>
        <div class="swiftcal-weekdays">
          ${DAYS.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="swiftcal-grid" id="swiftcal-grid"></div>
        <div class="swiftcal-footer">
          <button id="swiftcal-clear">Clear</button>
          <button id="swiftcal-today">Today</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) closeCalendar(); });
    document.getElementById('swiftcal-prev').addEventListener('click', () => navigate(-1));
    document.getElementById('swiftcal-next').addEventListener('click', () => navigate(1));
    document.getElementById('swiftcal-clear').addEventListener('click', clearDate);
    document.getElementById('swiftcal-today').addEventListener('click', goToday);
  }

  // ── Render grid ───────────────────────────────────────────
  function renderGrid() {
    document.getElementById('swiftcal-month-label').textContent = MONTHS[currentMonth];
    document.getElementById('swiftcal-year-label').textContent  = currentYear;

    const grid      = document.getElementById('swiftcal-grid');
    const firstDay  = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMon = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today     = new Date();

    let html = '';

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) html += `<span class="swiftcal-cell empty"></span>`;

    for (let d = 1; d <= daysInMon; d++) {
      const isToday = (d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear());
      const isSel   = selectedDate && (d === selectedDate.d && currentMonth === selectedDate.m && currentYear === selectedDate.y);
      let cls = 'swiftcal-cell';
      if (isToday) cls += ' today';
      if (isSel)   cls += ' selected';
      html += `<span class="${cls}" data-day="${d}">${d}</span>`;
    }

    grid.innerHTML = html;
    grid.querySelectorAll('.swiftcal-cell[data-day]').forEach(cell => {
      cell.addEventListener('click', () => selectDay(parseInt(cell.dataset.day)));
    });
  }

  // ── Actions ───────────────────────────────────────────────
  function navigate(dir) {
    currentMonth += dir;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
    renderGrid();
  }

  function selectDay(d) {
    selectedDate = { y: currentYear, m: currentMonth, d };
    const padded = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (activeInput) {
      activeInput.value = padded;
      activeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    renderGrid();
    setTimeout(closeCalendar, 180);
  }

  function clearDate() {
    selectedDate = null;
    if (activeInput) {
      activeInput.value = '';
      activeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    renderGrid();
    closeCalendar();
  }

  function goToday() {
    const t = new Date();
    currentYear  = t.getFullYear();
    currentMonth = t.getMonth();
    selectDay(t.getDate());
  }

  // ── Open / Close ──────────────────────────────────────────
  function openCalendar(inputEl) {
    buildCalendarModal();
    activeInput = inputEl;

    // Parse existing value
    const val = inputEl.value;
    if (val) {
      const parts = val.split('-');
      currentYear  = parseInt(parts[0]);
      currentMonth = parseInt(parts[1]) - 1;
      selectedDate = { y: currentYear, m: currentMonth, d: parseInt(parts[2]) };
    } else {
      const t = new Date();
      currentYear  = t.getFullYear();
      currentMonth = t.getMonth();
      selectedDate = null;
    }

    renderGrid();

    // Position near input
    const overlay = document.getElementById('swiftcal-overlay');
    const modal   = document.getElementById('swiftcal-modal');
    overlay.classList.add('visible');
    modal.classList.add('visible');
  }

  function closeCalendar() {
    const overlay = document.getElementById('swiftcal-overlay');
    const modal   = document.getElementById('swiftcal-modal');
    if (!overlay) return;
    modal.classList.remove('visible');
    overlay.classList.remove('visible');
    activeInput = null;
  }

  // ── Intercept all date inputs ─────────────────────────────
  function interceptDateInputs() {
    document.querySelectorAll('input[type="date"]').forEach(input => {
      if (input.dataset.swiftcalBound) return;
      input.dataset.swiftcalBound = '1';
      input.setAttribute('readonly', true);
      input.style.cursor = 'pointer';
      input.addEventListener('click', () => openCalendar(input));
      input.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openCalendar(input); });
    });
  }

  // Run on load + watch for dynamically added inputs
  document.addEventListener('DOMContentLoaded', () => {
    interceptDateInputs();
    const observer = new MutationObserver(interceptDateInputs);
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Keyboard close
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCalendar(); });

})();