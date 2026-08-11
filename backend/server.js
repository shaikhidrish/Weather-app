import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.WEATHER_API_KEY;

// 1. Current Weather Endpoint (Location ya City Name dono ke liye)
app.get('/api/weather', async (req, res) => {
    const { city, lat, lon } = req.query;
    let url = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}`;
    
    if (city) url += `&q=${city}`;
    else if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
    else return res.status(400).json({ error: 'City ya Coordinates zaroori hain' });

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || 'Data nahi mila' });
    }
});

// 2. 5-Day / 3-Hour Forecast Endpoint (7-day forecast OpenWeather standard free me 5-day deta hai jo perfect chalega)
app.get('/api/forecast', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City name required' });

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || 'Forecast nahi mila' });
    }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Weather API is running'
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));