// ============================================
// WeatherNow — Utility Functions
// ============================================

/**
 * Format a Unix timestamp + timezone offset into 12-hour time string
 */
function formatTime(unix, offset) {
  const d = new Date((unix + offset) * 1000);
  let h = d.getUTCHours(), m = d.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Format a Unix timestamp + offset into a full time string with seconds
 */
function formatTimeFull(unixNow, offset) {
  const d = new Date((unixNow + offset) * 1000);
  let h = d.getUTCHours(), m = d.getUTCMinutes(), s = d.getUTCSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ampm}`;
}

/**
 * Convert Celsius to Fahrenheit
 */
function toFahrenheit(c) {
  return Math.round(c * 9 / 5 + 32);
}

/**
 * Format temperature based on current unit preference
 */
function fmtTemp(c, useFahrenheit) {
  return useFahrenheit ? `${toFahrenheit(c)}°F` : `${Math.round(c)}°C`;
}

/**
 * Get background glow color based on temperature
 */
function getTempColor(temp) {
  if (temp > 38) return '#ef4444';
  if (temp > 28) return '#fb923c';
  if (temp > 18) return '#38bdf8';
  if (temp > 8)  return '#93c5fd';
  return '#bfdbfe';
}

/**
 * Estimate UV index from cloud coverage
 */
function estimateUV(clouds) {
  return Math.round(Math.max(0, 8 * (1 - clouds / 100)));
}

/**
 * Build a fetch URL for the OpenWeatherMap API
 */
function buildUrl(endpoint, params) {
  const base = `${CONFIG.BASE_URL}/${endpoint}`;
  const query = new URLSearchParams({ ...params, appid: CONFIG.API_KEY });
  return `${base}?${query}`;
}
