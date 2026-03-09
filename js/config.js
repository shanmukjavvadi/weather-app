// ============================================
// WeatherNow — Configuration
// Author: Javvadi Shanmuk Sai Vardhan
// ============================================

const CONFIG = {
  API_KEY: 'bd5e378503939ddaee76f12ad7a97608',
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  DEFAULT_CITY: 'Hyderabad',
};

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
  Haze: '🌫️', Smoke: '🌫️', Dust: '🌪️', Tornado: '🌪️',
};

const AQI_LABELS = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
const AQI_COLORS = ['', '#22c55e', '#38bdf8', '#fb923c', '#ef4444', '#dc2626'];
const UV_LABELS  = ['Low','Low','Moderate','Moderate','High','High','Very High','Very High','Very High','Extreme','Extreme','Extreme+'];
const DAYS       = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
