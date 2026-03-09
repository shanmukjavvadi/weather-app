// ============================================
// WeatherNow — API / Data Fetching Module
// ============================================

const WeatherAPI = (() => {

  /**
   * Fetch current weather + forecast + AQI in parallel
   * @param {string} city
   * @returns {Promise<{current, forecast, aqi}>}
   */
  async function fetchAll(city) {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(buildUrl('weather',  { q: city, units: 'metric' })),
      fetch(buildUrl('forecast', { q: city, units: 'metric' })),
    ]);

    if (!currentRes.ok) {
      throw new Error(currentRes.status === 404
        ? 'City not found. Please check the spelling.'
        : 'Could not fetch weather data. Try again.');
    }

    const current  = await currentRes.json();
    const forecast = await forecastRes.json();

    // Fetch AQI using coordinates from current weather
    const aqiRes = await fetch(buildUrl('air_pollution', {
      lat: current.coord.lat,
      lon: current.coord.lon,
    }));
    const aqi = aqiRes.ok ? await aqiRes.json() : null;

    return { current, forecast, aqi };
  }

  return { fetchAll };

})();
