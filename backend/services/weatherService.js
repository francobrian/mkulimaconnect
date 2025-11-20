const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
  }

  // Get current weather data
  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric', // Use metric units (Celsius, meters/sec)
          lang: 'en'
        }
      });

      return this.formatCurrentWeather(response.data);
    } catch (error) {
      console.error('OpenWeatherMap API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  // Get 5-day weather forecast
  async getWeatherForecast(lat, lon) {
    try {
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'en'
        }
      });

      return this.formatForecast(response.data);
    } catch (error) {
      console.error('OpenWeatherMap Forecast API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  // Get weather alerts (requires paid plan)
  async getWeatherAlerts(lat, lon) {
    try {
      const response = await axios.get(`${this.baseURL}/onecall`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          exclude: 'current,minutely,hourly,daily',
          units: 'metric'
        }
      });

      return response.data.alerts || [];
    } catch (error) {
      // Alerts might not be available in free plan
      return [];
    }
  }

  // Format current weather data
  formatCurrentWeather(data) {
    return {
      location: {
        city: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      },
      temperature: {
        current: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max)
      },
      details: {
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        cloudiness: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      },
      timestamp: new Date(data.dt * 1000)
    };
  }

  // Format forecast data
  formatForecast(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temps: [],
          weather: [],
          humidity: [],
          windSpeed: []
        };
      }
      
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].weather.push(item.weather[0]);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].windSpeed.push(item.wind.speed);
    });

    // Calculate daily averages and extremes
    return Object.values(dailyForecasts).map(day => ({
      date: day.date,
      temperature: {
        min: Math.round(Math.min(...day.temps)),
        max: Math.round(Math.max(...day.temps)),
        average: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length)
      },
      weather: {
        main: this.getMostFrequentWeather(day.weather),
        description: day.weather[0].description, // Use first description
        icon: day.weather[0].icon
      },
      humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length * 10) / 10
    })).slice(0, 5); // Return next 5 days
  }

  getMostFrequentWeather(weatherArray) {
    const frequency = {};
    let maxCount = 0;
    let mostFrequent;
    
    weatherArray.forEach(weather => {
      frequency[weather.main] = (frequency[weather.main] || 0) + 1;
      if (frequency[weather.main] > maxCount) {
        maxCount = frequency[weather.main];
        mostFrequent = weather.main;
      }
    });
    
    return mostFrequent;
  }

  // Generate crop advisory based on weather
  generateCropAdvisory(weatherData, cropType) {
    const advisory = {
      general: [],
      irrigation: [],
      pestControl: [],
      harvesting: [],
      warnings: []
    };

    const temp = weatherData.temperature.current;
    const humidity = weatherData.details.humidity;
    const rain = weatherData.weather.main.toLowerCase().includes('rain');
    const windSpeed = weatherData.details.windSpeed;

    // Temperature-based advisories
    if (temp < 10) {
      advisory.warnings.push('Low temperatures detected. Consider protecting sensitive crops with covers.');
    } else if (temp > 35) {
      advisory.warnings.push('High temperatures detected. Increase irrigation frequency and consider shade nets.');
    }

    // Humidity-based advisories
    if (humidity > 80) {
      advisory.pestControl.push('High humidity increases fungal disease risk. Monitor for mildew and apply preventive treatments.');
    } else if (humidity < 30) {
      advisory.irrigation.push('Low humidity detected. Increase irrigation to prevent water stress.');
    }

    // Rainfall advisories
    if (rain) {
      advisory.general.push('Rain expected. Postpone fertilizer application and ensure proper drainage.');
    }

    // Wind advisories
    if (windSpeed > 6) {
      advisory.warnings.push('Strong winds expected. Secure farm structures and protect young plants.');
    }

    // Crop-specific advisories
    const cropAdvisories = this.getCropSpecificAdvisory(cropType, weatherData);
    advisory.general.push(...cropAdvisories.general);
    advisory.irrigation.push(...cropAdvisories.irrigation);
    advisory.pestControl.push(...cropAdvisories.pestControl);

    return advisory;
  }

  getCropSpecificAdvisory(cropType, weatherData) {
    const advisories = {
      general: [],
      irrigation: [],
      pestControl: []
    };

    const temp = weatherData.temperature.current;

    switch (cropType) {
      case 'vegetables':
        if (temp > 25) {
          advisories.irrigation.push('Tomatoes and leafy vegetables need daily watering in this heat.');
        }
        advisories.pestControl.push('Monitor for aphids and caterpillars. Use neem oil for organic control.');
        break;

      case 'fruits':
        if (temp < 15) {
          advisories.general.push('Protect fruit trees from cold stress with appropriate covers.');
        }
        advisories.irrigation.push('Deep watering recommended for fruit trees 2-3 times per week.');
        break;

      case 'grains':
        advisories.general.push('Grains prefer moderate temperatures. Monitor for rust diseases in humid conditions.');
        break;

      case 'coffee':
        advisories.irrigation.push('Coffee plants need consistent moisture. Maintain soil humidity around 60-70%.');
        advisories.general.push('Monitor for coffee berry disease in rainy conditions.');
        break;

      case 'maize':
        if (temp > 30) {
          advisories.irrigation.push('Maize needs increased irrigation during high temperature periods.');
        }
        advisories.general.push('Monitor for maize stalk borer and armyworms.');
        break;

      default:
        advisories.general.push('Monitor crop health regularly under current weather conditions.');
    }

    return advisories;
  }
}

module.exports = new WeatherService();