// ============================================
// WeatherNow — UI Rendering Module
// ============================================

const UI = (() => {

  function showError(msg) {
    const el = document.getElementById('errBox');
    el.textContent = '⚠ ' + msg;
    el.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result').style.display = 'none';
  }

  function showLoading() {
    document.getElementById('errBox').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
  }

  function showResult() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('errBox').style.display = 'none';
  }

  function renderHero(data, useFahrenheit) {
    const temp = data.main.temp;
    const tempColor = getTempColor(temp);

    document.getElementById('heroCard').style.setProperty('--card-glow', `${tempColor}22`);
    document.getElementById('tempBig').style.color = tempColor;
    document.getElementById('tempBig').textContent = fmtTemp(temp, useFahrenheit);
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('cityMeta').textContent = `${data.sys.country} · ${data.coord.lat.toFixed(2)}°N ${Math.abs(data.coord.lon).toFixed(2)}°${data.coord.lon >= 0 ? 'E' : 'W'}`;
    document.getElementById('wEmoji').textContent = WEATHER_ICONS[data.weather[0].main] || '🌤';
    document.getElementById('wLabel').textContent = data.weather[0].description;
    document.getElementById('wFeels').textContent = `Feels like ${fmtTemp(data.main.feels_like, useFahrenheit)}`;
    document.getElementById('wHiLo').textContent = `↑ ${fmtTemp(data.main.temp_max, useFahrenheit)}  ↓ ${fmtTemp(data.main.temp_min, useFahrenheit)}`;

    document.getElementById('s-hum').textContent   = data.main.humidity + '%';
    document.getElementById('s-wind').textContent  = Math.round(data.wind.speed * 3.6) + ' km/h';
    document.getElementById('s-vis').textContent   = (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('s-pres').textContent  = data.main.pressure + ' hPa';
    document.getElementById('s-cloud').textContent = data.clouds.all + '%';
  }

  function renderTime(offset) {
    const d = new Date();
    const now = Math.floor(d.getTime() / 1000);
    document.getElementById('liveTime').textContent = formatTimeFull(now, offset);
    document.getElementById('liveDate').textContent = new Date((now + offset) * 1000)
      .toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }

  function renderSunInfo(data, offset) {
    const sr = formatTime(data.sys.sunrise, offset);
    const ss = formatTime(data.sys.sunset, offset);

    document.getElementById('sunTimes').innerHTML = `
      <div>
        <div style="font-size:1.5rem">🌅</div>
        <div style="font-weight:700;font-size:1rem">${sr}</div>
        <div style="font-family:var(--mono);font-size:.65rem;color:var(--muted)">Sunrise</div>
      </div>
      <div>
        <div style="font-size:1.5rem">🌇</div>
        <div style="font-weight:700;font-size:1rem">${ss}</div>
        <div style="font-family:var(--mono);font-size:.65rem;color:var(--muted)">Sunset</div>
      </div>`;

    // Sun arc SVG
    const now   = Math.floor(Date.now() / 1000) + offset;
    const sr2   = data.sys.sunrise + offset;
    const ss2   = data.sys.sunset + offset;
    const dayLen = ss2 - sr2;
    const pct   = Math.max(0, Math.min(1, (now - sr2) / dayLen));
    const ax    = pct * 200;
    const ay    = 60 - Math.sin(pct * Math.PI) * 55;

    document.getElementById('arcSvg').innerHTML = `
      <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,60 Q100,5 200,60" stroke="rgba(255,255,255,.1)" stroke-width="1.5" fill="none"/>
      <path d="M0,60 Q${ax/2},${ay+(60-ay)/2} ${ax},${ay}" stroke="rgba(251,191,36,.6)" stroke-width="1.5" fill="none"/>
      <circle cx="${ax}" cy="${ay}" r="5" fill="#fbbf24" filter="url(#glow)"/>`;
  }

  function renderAQI(aqiData) {
    if (!aqiData) return;
    const aqi = aqiData.list[0].main.aqi;
    document.getElementById('aqiVal').textContent  = `${AQI_LABELS[aqi]} (AQI ${aqi})`;
    document.getElementById('aqiVal').style.color  = AQI_COLORS[aqi];
    document.getElementById('aqiFill').style.cssText = `width:${(aqi/5)*100}%;background:${AQI_COLORS[aqi]}`;
    document.getElementById('aqiSub').textContent  = `PM2.5: ${aqiData.list[0].components.pm2_5.toFixed(1)} μg/m³`;
  }

  function renderUV(clouds) {
    const uv = estimateUV(clouds);
    const color = uv <= 2 ? '#22c55e' : uv <= 5 ? '#facc15' : uv <= 7 ? '#fb923c' : '#ef4444';
    document.getElementById('uvVal').textContent  = `${uv} — ${UV_LABELS[Math.min(uv, 11)]}`;
    document.getElementById('uvFill').style.cssText = `width:${(uv/11)*100}%;background:${color}`;
    document.getElementById('uvSub').textContent  = uv <= 2 ? 'No protection needed'
      : uv <= 5 ? 'Wear sunscreen' : uv <= 7 ? 'SPF 30+ recommended' : 'Avoid prolonged exposure';
  }

  function renderHourly(foreData, offset, useFahrenheit) {
    document.getElementById('hourlyRow').innerHTML = foreData.list.slice(0, 8).map(h => {
      const d = new Date((h.dt + offset) * 1000);
      let hr = d.getUTCHours(), ap = hr >= 12 ? 'PM' : 'AM';
      hr = hr % 12 || 12;
      const pop = Math.round((h.pop || 0) * 100);
      return `
        <div class="h-item">
          <div class="h-time">${hr}:00 ${ap}</div>
          <span class="h-emoji">${WEATHER_ICONS[h.weather[0].main] || '🌤'}</span>
          <div class="h-temp">${fmtTemp(h.main.temp, useFahrenheit)}</div>
          ${pop > 0 ? `<div class="h-pop">💧 ${pop}%</div>` : ''}
        </div>`;
    }).join('');
  }

  function renderForecast(foreData, useFahrenheit) {
    const daily = {};
    foreData.list.forEach(i => {
      const k = new Date(i.dt * 1000).toDateString();
      if (!daily[k]) daily[k] = [];
      daily[k].push(i);
    });

    document.getElementById('foreRow').innerHTML = Object.entries(daily).slice(0, 5).map(([ds, items]) => {
      const d    = new Date(ds);
      const hi   = Math.round(Math.max(...items.map(i => i.main.temp_max)));
      const lo   = Math.round(Math.min(...items.map(i => i.main.temp_min)));
      const mid  = items[Math.floor(items.length / 2)];
      const isTd = d.toDateString() === new Date().toDateString();
      return `
        <div class="fc-day" style="${isTd ? 'border-color:var(--accent);background:rgba(56,189,248,.05)' : ''}">
          <div class="fc-name">${isTd ? 'Today' : DAYS[d.getDay()]}</div>
          <span class="fc-emoji">${WEATHER_ICONS[mid.weather[0].main] || '🌤'}</span>
          <div class="fc-hi">${fmtTemp(hi, useFahrenheit)}</div>
          <div class="fc-lo">${fmtTemp(lo, useFahrenheit)}</div>
          <div class="fc-desc">${mid.weather[0].description}</div>
        </div>`;
    }).join('');
  }

  return { showError, showLoading, showResult, renderHero, renderTime, renderSunInfo, renderAQI, renderUV, renderHourly, renderForecast };

})();
