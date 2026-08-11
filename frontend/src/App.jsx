import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Search, MapPin, ArrowRight, Wind, Droplets, AlertTriangle } from 'lucide-react';

// ==================== ANIMATED WEATHER EFFECTS ====================
const RainEffect = ({ heavy = false }) => (
  <div className="weather-rain" aria-hidden="true">
    {Array.from({ length: heavy ? 110 : 75 }, (_, i) => (
      <span
        key={i}
        className="rain-drop"
        style={{
          left: `${(i * 37) % 101}%`,
          animationDelay: `${-((i * 0.071) % 1.8)}s`,
          animationDuration: `${0.55 + ((i * 0.017) % 0.55)}s`,
          opacity: `${0.28 + ((i * 13) % 55) / 100}`,
        }}
      />
    ))}
  </div>
);

const SnowEffect = () => (
  <div className="weather-snow" aria-hidden="true">
    {Array.from({ length: 55 }, (_, i) => (
      <span
        key={i}
        className="snow-flake"
        style={{
          left: `${(i * 41) % 101}%`,
          animationDelay: `${-((i * 0.31) % 8)}s`,
          animationDuration: `${6 + ((i * 0.23) % 6)}s`,
          fontSize: `${8 + ((i * 7) % 10)}px`,
        }}
      >
        •
      </span>
    ))}
  </div>
);

const MovingClouds = ({ dark = false }) => (
  <div className="weather-clouds" aria-hidden="true">
    <div className={`moving-cloud cloud-one ${dark ? 'cloud-dark' : ''}`} />
    <div className={`moving-cloud cloud-two ${dark ? 'cloud-dark' : ''}`} />
    <div className={`moving-cloud cloud-three ${dark ? 'cloud-dark' : ''}`} />
    <div className={`moving-cloud cloud-four ${dark ? 'cloud-dark' : ''}`} />
  </div>
);

// ==================== ADVANCED ANIMATED BACKGROUNDS & ALERTS ====================
const getWeatherLayout = (conditionId, temp) => {
  const defaultLayout = {
    bgElement: (
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-900 overflow-hidden z-0">
        <div className="absolute inset-0 bg-sky-300/10" />
        <MovingClouds />
        <div className="weather-glow weather-glow-one" />
        <div className="weather-glow weather-glow-two" />
      </div>
    ),
    icon: <Cloud className="w-20 h-20 text-gray-100 animate-bounce" />,
    line: "Aasman me badalon ka dera hai. Mausam mast hai!",
    rainAlert: false
  };

  if (!conditionId) return defaultLayout;

  // 🌧️ Rain / Thunderstorm
  if (conditionId >= 200 && conditionId < 600) {
    return {
      bgElement: (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-800 overflow-hidden z-0">
          <MovingClouds dark />
          <RainEffect heavy={conditionId >= 500} />
          <div className="rain-mist" />
          <div className="storm-glow" />
        </div>
      ),
      icon:
        conditionId < 300
          ? <CloudLightning className="w-20 h-20 text-yellow-300 animate-pulse" />
          : <CloudRain className="w-20 h-20 text-blue-200 animate-bounce" />,
      line: "Bahar rimjhim baarish ho rahi hai. Chai-pakode ka plan banao!",
      rainAlert: true
    };
  }

  // ❄️ Snow
  if (conditionId >= 600 && conditionId < 700) {
    return {
      bgElement: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-sky-800 to-slate-400 overflow-hidden z-0">
          <MovingClouds />
          <SnowEffect />
          <div className="weather-glow weather-glow-one" />
        </div>
      ),
      icon: <CloudSnow className="w-20 h-20 text-blue-100" />,
      line: "Kadaake ki thand aur barafbaari ka mausam!",
      rainAlert: false
    };
  }

  // ☀️ Clear sky
  if (conditionId === 800) {
    return {
      bgElement: (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-700 overflow-hidden z-0">
          <div className="sun-glow" />
          <div className="sun-orb" />
          <MovingClouds />
        </div>
      ),
      icon: <Sun className="w-20 h-20 text-yellow-200 animate-spin-slow" />,
      line:
        temp > 30
          ? "Tez dhoop aur garmi hai! Paani peete rahein."
          : "Sunehri dhoop aur khula aasman!",
      rainAlert: false
    };
  }

  // ☁️ Cloudy
  if (conditionId > 800) {
    return {
      bgElement: (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-blue-600 to-indigo-900 overflow-hidden z-0">
          <MovingClouds dark />
          <div className="cloud-haze" />
        </div>
      ),
      icon: <Cloud className="w-20 h-20 text-slate-100 animate-pulse" />,
      line: "Aasman me badal chhaye hain, mausam thanda hone wala hai.",
      rainAlert: false
    };
  }

  return defaultLayout;
};

// ==================== 1. HOME PAGE COMPONENT ====================
function HomePage() {
  const [localWeather, setLocalWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.get(`http://localhost:5000/api/weather?lat=${latitude}&lon=${longitude}`);
            setLocalWeather(res.data);
          } catch (err) {
            setError('Location ka live data nahi mil paya.');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('Location permission off hai. Search page ka use karein.');
          setLoading(false);
        }
      );
    } else {
      setError('Browser location support nahi karta.');
      setLoading(false);
    }
  }, []);

  const conditionId = localWeather ? localWeather.weather[0].id : null;
  const temp = localWeather ? localWeather.main.temp : null;
  const layout = localWeather ? getWeatherLayout(conditionId, temp) : getWeatherLayout(801, 25);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {layout.bgElement}

      <div className="relative z-10 bg-black/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-white/20 transform hover:scale-[1.01] transition-all">
        <h1 className="text-3xl font-black mb-1 tracking-wide flex items-center justify-center gap-2">
          🌦️ WeatherApp
        </h1>
        <p className="text-xs uppercase tracking-widest opacity-70 mb-6 font-bold animate-pulse">Your Location Hub</p>

        {layout.rainAlert && (
          <div className="mb-4 bg-red-600/80 border border-red-500 text-white p-3 rounded-2xl flex items-center gap-2 text-xs font-bold  justify-center">
            <AlertTriangle size={16} /> RAIN ALERT: Bahar baarish hai, Umbrella sath rakhein!
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-10 h-10 border-4 border-t-white border-white/20 rounded-full animate-spin"></div>
            <p className="text-sm font-medium animate-pulse">Aapki location ka mausam nikal rahe hain...</p>
          </div>
        )}

        {error && <p className="text-red-200 font-semibold bg-red-500/30 p-3 rounded-xl border border-red-500/20 my-4 text-sm">{error}</p>}

        {localWeather && (
          <div className="my-4 animate-fade-in">
            <div className="flex justify-center mb-4 filter drop-shadow-xl">
              {layout.icon}
            </div>
            
            <p className="text-xs font-bold bg-white/20 px-4 py-2 rounded-full inline-block border border-white/10 mb-4">
              ✨ {layout.line}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xl font-bold">
              <MapPin size={18} className="text-red-400 fill-red-400" />
              <span>{localWeather.name}</span>
            </div>

            <p className="text-7xl font-black my-2 tracking-tight filter drop-shadow-md">{Math.round(localWeather.main.temp)}°C</p>
            <p className="text-base font-bold tracking-wider capitalize text-yellow-200 mb-4">
              {localWeather.weather[0].description}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 text-left">
                <Droplets className="text-sky-300" size={20} />
                <div>
                  <p className="text-[10px] opacity-60">Humidity</p>
                  <p className="text-sm font-bold">{localWeather.main.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 text-left">
                <Wind className="text-teal-300" size={20} />
                <div>
                  <p className="text-[10px] opacity-60">Wind</p>
                  <p className="text-sm font-bold">{localWeather.wind.speed} m/s</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/search')}
          className="mt-6 w-full bg-white text-slate-900 font-extrabold py-3.5 px-4 rounded-2xl shadow-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 transform active:scale-95"
        >
          Search Other Cities <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ==================== 2. SEARCH PAGE COMPONENT ====================
function SearchPage() {
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return;
    setLoading(true);
    setError('');
    setForecast(null);
    setCurrentWeather(null);

    try {
      const currentRes = await axios.get(`http://localhost:5000/api/weather?city=${city}`);
      setCurrentWeather(currentRes.data);

      const forecastRes = await axios.get(`http://localhost:5000/api/forecast?city=${city}`);
      setForecast(forecastRes.data);
    } catch (err) {
      setError('City nahi mili, sahi naam check karein!');
    } finally {
      setLoading(false);
    }
  };

  const conditionId = currentWeather ? currentWeather.weather[0].id : null;
  const temp = currentWeather ? currentWeather.main.temp : null;
  
  const layout = currentWeather ? getWeatherLayout(conditionId, temp) : getWeatherLayout(803, 25);
  const hasFutureRain = forecast?.list?.some(item => item.weather[0].id >= 200 && item.weather[0].id < 600);

  return (
    <div className="relative min-h-screen p-6 text-white overflow-hidden transition-all duration-700">
      {layout.bgElement}

      <div className="relative z-10 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-white hover:bg-black/50 border border-white/10 transition"
        >
          ← Dashboard Home
        </button>

        {hasFutureRain && (
          <div className="mb-6 max-w-md mx-auto bg-amber-500/90 border border-amber-400 text-slate-900 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-black shadow-lg animate-pulse justify-center">
            <AlertTriangle size={18} className="text-slate-900" /> FUTURE RAIN NOTICE: Agle 5 din me baarish ki sambhavna hai!
          </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Type city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 p-4 rounded-2xl border-none focus:outline-none text-gray-800 shadow-xl font-medium"
          />
          <button type="submit" className="bg-slate-900/90 text-white p-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition active:scale-95 border border-white/10">
            <Search size={22} />
          </button>
        </form>

        {loading && <p className="text-center font-bold animate-pulse">Satelite se data sync ho raha hai...</p>}
        {error && <p className="text-center text-red-100 bg-red-500/30 border border-red-500/20 p-4 rounded-2xl max-w-md mx-auto font-semibold">{error}</p>}

        {currentWeather && forecast && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-black/30 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center flex flex-col justify-center items-center shadow-2xl">
              <span className="text-xs uppercase bg-white/20 px-3 py-1 rounded-full font-bold border border-white/10 mb-4">Live Search</span>
              <div className="mb-2 filter drop-shadow-xl">{layout.icon}</div>
              <h2 className="text-3xl font-black">{currentWeather.name}</h2>
              <p className="text-6xl font-black my-2">{Math.round(currentWeather.main.temp)}°C</p>
              <p className="capitalize font-bold text-yellow-200 tracking-wide">{currentWeather.weather[0].description}</p>
            </div>

            <div className="md:col-span-2 bg-black/30 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 tracking-wide">📅 5-Day Upcoming Forecast</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {forecast.list.filter((item, index) => index % 8 === 0).map((day, idx) => {
                  const dayLayout = getWeatherLayout(day.weather[0].id, day.main.temp);
                  return (
                    <div key={idx} className="flex justify-between items-center bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition">
                      <span className="font-bold text-sm text-slate-100 w-28">
                        {new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <div className="scale-75 opacity-90">{dayLayout.icon}</div>
                      <span className="font-black text-xl w-14 text-right">{Math.round(day.main.temp)}°C</span>
                      <span className="capitalize text-xs font-semibold opacity-80 text-right flex-1 truncatemax-w-[120px]">
                        {day.weather[0].description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN APP COMPONENT WITH ROUTES ====================
// ==================== MAIN APP COMPONENT WITH ROUTES ====================
import { BrowserRouter } from 'react-router-dom'; // Agar top par import na ho toh

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;