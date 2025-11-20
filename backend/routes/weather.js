const express = require('express');
const auth = require('../middleware/auth');
const WeatherService = require('../services/weatherService');
const router = express.Router();

// Get current weather for location
router.get('/current/:lat/:lon', auth, async (req, res) => {
  try {
    const { lat, lon } = req.params;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const weatherData = await WeatherService.getCurrentWeather(parseFloat(lat), parseFloat(lon));
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch weather data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get weather forecast
router.get('/forecast/:lat/:lon', auth, async (req, res) => {
  try {
    const { lat, lon } = req.params;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const forecastData = await WeatherService.getWeatherForecast(parseFloat(lat), parseFloat(lon));
    res.json(forecastData);
  } catch (error) {
    console.error('Forecast API error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch weather forecast',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Advisory handler used for routes with and without cropType param
const advisoryHandler = async (req, res) => {
  try {
    const { lat, lon } = req.params;
    // support cropType either as a route param or query param
    const cropType = req.params.cropType || req.query.cropType || 'vegetables';

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Get current weather
    const currentWeather = await WeatherService.getCurrentWeather(parseFloat(lat), parseFloat(lon));
    
    // Get forecast
    const forecast = await WeatherService.getWeatherForecast(parseFloat(lat), parseFloat(lon));
    
    // Generate crop advisory
    const advisory = WeatherService.generateCropAdvisory(currentWeather, cropType);

    // Get weather alerts
    const alerts = await WeatherService.getWeatherAlerts(parseFloat(lat), parseFloat(lon));

    res.json({
      currentWeather,
      forecast,
      advisory,
      alerts,
      location: currentWeather.location
    });
  } catch (error) {
    console.error('Advisory API error:', error.message);
    res.status(500).json({ 
      message: 'Failed to generate weather advisory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Register advisory routes separately to avoid path-to-regexp optional param errors
router.get('/advisory/:lat/:lon/:cropType', auth, advisoryHandler);
router.get('/advisory/:lat/:lon', auth, advisoryHandler);

// Get weather for multiple locations (for farmer dashboard)
router.post('/bulk', auth, async (req, res) => {
  try {
    const { locations } = req.body; // Array of { lat, lon, farmName }

    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({ message: 'Locations array is required' });
    }

    const weatherPromises = locations.map(location => 
      WeatherService.getCurrentWeather(location.lat, location.lon)
        .then(weather => ({ ...weather, farmName: location.farmName }))
        .catch(error => ({ 
          error: error.message, 
          farmName: location.farmName,
          coordinates: { lat: location.lat, lon: location.lon }
        }))
    );

    const results = await Promise.all(weatherPromises);
    res.json(results);
  } catch (error) {
    console.error('Bulk weather API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch bulk weather data' });
  }
});

// Mock weather data for development (when API key is not available)
router.get('/mock/:lat/:lon', auth, (req, res) => {
  const { lat, lon } = req.params;
  
  const mockWeather = {
    location: {
      city: "Nairobi",
      country: "KE",
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) }
    },
    weather: {
      main: "Clear",
      description: "clear sky",
      icon: "01d",
      iconUrl: "https://openweathermap.org/img/wn/01d@2x.png"
    },
    temperature: {
      current: 22,
      feelsLike: 23,
      min: 18,
      max: 26
    },
    details: {
      humidity: 65,
      pressure: 1013,
      visibility: 10,
      windSpeed: 3.5,
      windDirection: 120,
      cloudiness: 0,
      sunrise: new Date(Date.now() + 6 * 60 * 60 * 1000),
      sunset: new Date(Date.now() + 18 * 60 * 60 * 1000)
    },
    timestamp: new Date(),
    isMock: true
  };

  res.json(mockWeather);
});

module.exports = router;