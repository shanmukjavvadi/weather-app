// ============================================
// WeatherNow — Main App Controller
// ============================================

const App = (() => {

  let currentData   = null;
  let useFahrenheit = false;
  let timeInterval  = null;
  let tzOffset      = 0;

  // ── Cursor ──────────────────────────────────
  function initCursor() {
    const cur  = document.getElementById('cur');
    const cur2 = document.getElementById('cur2');
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px';
      cur.style.top  = my + 'px';
    });

    (function animateCursor() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cur2.style.left = rx + 'px';
      cur2.style.top  = ry + 'px';
      requestAnimationFrame(animateCursor);
    })();
  }

  // ── Particle Background ─────────────────────
  function initBackground() {
    const canvas = document.getElementById('bgCanvas');
    const ctx    = canvas.getContext('2d');
    let W, H;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * 9999, y: Math.random() * 9999,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      o: Math.random() * 0.4 + 0.1,
    }));

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    (function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.o})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
  }

  // ── Search ──────────────────────────────────
  async function search(city) {
    if (!city.trim()) return;
    UI.showLoading();

    try {
      const { current, forecast, aqi } = await WeatherAPI.fetchAll(city);
      currentData = { current, forecast, aqi };
      tzOffset = current.timezone;
      render();
    } catch (err) {
      UI.showError(err.message);
    }
  }

  // ── Render ───────────────────────────────────
  function render() {
    const { current, forecast, aqi } = currentData;
    UI.showResult();
    UI.renderHero(current, useFahrenheit);
    UI.renderSunInfo(current, tzOffset);
    UI.renderAQI(aqi);
    UI.renderUV(current.clouds.all);
    UI.renderHourly(forecast, tzOffset, useFahrenheit);
    UI.renderForecast(forecast, useFahrenheit);

    // Live clock
    if (timeInterval) clearInterval(timeInterval);
    UI.renderTime(tzOffset);
    timeInterval = setInterval(() => UI.renderTime(tzOffset), 1000);
  }

  // ── Toggle Unit ──────────────────────────────
  function toggleUnit() {
    useFahrenheit = document.getElementById('unitToggle').checked;
    if (currentData) render();
  }

  // ── Event Listeners ──────────────────────────
  function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
      search(document.getElementById('city').value);
    });

    document.getElementById('city').addEventListener('keydown', e => {
      if (e.key === 'Enter') search(document.getElementById('city').value);
    });

    document.querySelectorAll('.q-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        document.getElementById('city').value = city;
        search(city);
      });
    });

    document.getElementById('unitToggle').addEventListener('change', toggleUnit);
  }

  // ── Init ─────────────────────────────────────
  function init() {
    initCursor();
    initBackground();
    bindEvents();
    search(CONFIG.DEFAULT_CITY);
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', App.init);
