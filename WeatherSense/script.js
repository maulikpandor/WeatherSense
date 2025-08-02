/**
 * WeatherSense Application
 * Developed by WeatherApp Team
 * Version 1.0.0
 *
 * A responsive weather application with real-time forecasts
 * and interactive UI elements.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const elements = {
    searchForm: document.querySelector(".weather-search"),
    searchInput: document.querySelector(".weather-searchform"),
    city: document.querySelector(".weather-city"),
    datetime: document.querySelector(".weather-datetime"),
    forecast: document.querySelector(".weather-forecast"),
    icon: document.querySelector(".weather-icon-img"),
    temperature: document.querySelector(".weather-temperature"),
    minmax: document.querySelector(".weather-minmax"),
    realfeel: document.querySelector(".weather-realfeel"),
    humidity: document.querySelector(".weather-humidity"),
    wind: document.querySelector(".weather-wind"),
    pressure: document.querySelector(".weather-pressure"),
    error: document.querySelector(".weather-error"),
    hourlyContainer: document.querySelector(".hourly-container"),
    dailyContainer: document.querySelector(".daily-container"),
    locationBtn: document.querySelector(".location-btn"),
    themeToggle: document.querySelector(".theme-toggle"),
    celsius: document.querySelector(".weather-unit-celsius"),
    fahrenheit: document.querySelector(".weather-unit-fahrenheit"),
    cards: document.querySelectorAll(".card"),
  };

  // App Configuration
  const config = {
    apiKey: "1eeff8eb12ccb7254040c135fa3ee406",
    defaultCity: "New York",
    units: "metric",
    apiBaseUrl: "https://api.openweathermap.org/data/2.5",
    isDarkMode: false,
  };

  // Weather Backgrounds
  const weatherBackgrounds = {
    "01d": "linear-gradient(135deg, #56CCF2, #2F80ED)",
    "01n": "linear-gradient(135deg, #0F2027, #203A43, #2C5364)",
    "02d": "linear-gradient(135deg, #BBD2C5, #536976)",
    "02n": "linear-gradient(135deg, #0F2027, #203A43)",
    "03d": "linear-gradient(135deg, #bdc3c7, #2c3e50)",
    "03n": "linear-gradient(135deg, #2c3e50, #bdc3c7)",
    "04d": "linear-gradient(135deg, #636363, #a2ab58)",
    "04n": "linear-gradient(135deg, #304352, #d7d2cc)",
    "09d": "linear-gradient(135deg, #373B44, #4286f4)",
    "09n": "linear-gradient(135deg, #0F2027, #4286f4)",
    "10d": "linear-gradient(135deg, #1F1C2C, #928DAB)",
    "10n": "linear-gradient(135deg, #1F1C2C, #3A6073)",
    "11d": "linear-gradient(135deg, #000000, #434343)",
    "11n": "linear-gradient(135deg, #000000, #16222A)",
    "13d": "linear-gradient(135deg, #E0EAFC, #CFDEF3)",
    "13n": "linear-gradient(135deg, #a8c0ff, #3f2b96)",
    "50d": "linear-gradient(135deg, #606c88, #3f4c6b)",
    "50n": "linear-gradient(135deg, #485563, #29323c)",
  };

  // Initialize the application
  function init() {
    // Set default units
    elements.celsius.classList.add("active");
    elements.fahrenheit.classList.remove("active");

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("weathersense-theme");
    if (savedTheme === "dark") {
      toggleTheme();
    }

    // Check for saved location
    const savedCity = localStorage.getItem("weathersense-city");
    const cityToLoad = savedCity || config.defaultCity;

    // Add card animations
    animateCards();

    // Load weather data
    getWeather(cityToLoad);

    // Set up event listeners
    setupEventListeners();
  }

  // Set up all event listeners
  function setupEventListeners() {
    // Search form submission
    elements.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = elements.searchInput.value.trim();
      if (city) {
        getWeather(city);
        localStorage.setItem("weathersense-city", city);
        elements.searchInput.value = "";
      } else {
        showError("Please enter a city name");
      }
    });

    // Temperature unit toggle
    elements.celsius.addEventListener("click", () => {
      if (config.units !== "metric") {
        config.units = "metric";
        elements.celsius.classList.add("active");
        elements.fahrenheit.classList.remove("active");
        getWeather(elements.city.textContent || config.defaultCity);
      }
    });

    elements.fahrenheit.addEventListener("click", () => {
      if (config.units !== "imperial") {
        config.units = "imperial";
        elements.fahrenheit.classList.add("active");
        elements.celsius.classList.remove("active");
        getWeather(elements.city.textContent || config.defaultCity);
      }
    });

    // Location button
    elements.locationBtn.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
          },
          (error) => {
            showError("Location access denied: " + error.message);
          }
        );
      } else {
        showError("Geolocation is not supported by your browser");
      }
    });

    // Theme toggle
    elements.themeToggle.addEventListener("click", toggleTheme);

    // Add hover effects to cards
    elements.cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px)";
        card.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.2)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    });
  }

  // Toggle between light and dark theme
  function toggleTheme() {
    document.body.dataset.theme =
      document.body.dataset.theme === "dark" ? "light" : "dark";
    config.isDarkMode = !config.isDarkMode;
    localStorage.setItem(
      "weathersense-theme",
      config.isDarkMode ? "dark" : "light"
    );

    const icon = elements.themeToggle.querySelector("i");
    icon.classList.toggle("fa-moon");
    icon.classList.toggle("fa-sun");
  }

  // Animate cards on load
  function animateCards() {
    elements.cards.forEach((card, index) => {
      card.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
      card.style.opacity = "0";
    });
  }

  // Fetch weather data by city name
  async function getWeather(city) {
    showLoadingState();

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/weather?q=${encodeURIComponent(city)}&appid=${
          config.apiKey
        }&units=${config.units}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error(`"${city}" not found. Please try another location.`);
        } else if (response.status === 401) {
          throw new Error("API key issue. Please try again later.");
        } else {
          throw new Error(errorData.message || "Unable to fetch weather data.");
        }
      }

      const data = await response.json();
      updateWeatherUI(data);
      getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
      console.error("Weather fetch error:", error);
      showError(error.message);
    } finally {
      hideLoadingState();
    }
  }

  // Fetch weather data by coordinates
  async function getWeatherByCoords(lat, lon) {
    showLoadingState();

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/weather?lat=${lat}&lon=${lon}&appid=${config.apiKey}&units=${config.units}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch weather for your location.");
      }

      const data = await response.json();
      updateWeatherUI(data);
      getForecast(lat, lon);
      localStorage.setItem("weathersense-city", data.name);
    } catch (error) {
      console.error("Location weather error:", error);
      showError(error.message);
    } finally {
      hideLoadingState();
    }
  }

  // Fetch forecast data
  async function getForecast(lat, lon) {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${config.apiKey}&units=${config.units}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch forecast data.");
      }

      const data = await response.json();
      updateForecastUI(data);
    } catch (error) {
      console.error("Forecast error:", error);
      showError("Could not load forecast data");
    }
  }

  // Show loading state
  function showLoadingState() {
    elements.city.textContent = "Loading...";
    elements.city.classList.add("loading");
    elements.temperature.textContent = "...";
    elements.error.style.display = "none";
  }

  // Hide loading state
  function hideLoadingState() {
    elements.city.classList.remove("loading");
  }

  // Update main weather UI
  function updateWeatherUI(data) {
    const weatherIcon = data.weather[0]?.icon || "01d";
    document.body.style.background =
      weatherBackgrounds[weatherIcon] || weatherBackgrounds["01d"];

    elements.city.textContent = data.name || "Unknown location";
    elements.temperature.textContent = `${Math.round(data.main.temp)}°`;
    elements.forecast.textContent =
      data.weather[0]?.description || "No forecast";
    elements.icon.src = `https://openweathermap.org/img/wn/${
      data.weather[0]?.icon || "01d"
    }@4x.png`;
    elements.icon.alt = data.weather[0]?.description || "Weather icon";

    const minTemp = Math.round(data.main.temp_min);
    const maxTemp = Math.round(data.main.temp_max);
    elements.minmax.innerHTML = `
            <p><i class="fas fa-temperature-arrow-down"></i> <span>${minTemp}°</span></p>
            <p><i class="fas fa-temperature-arrow-up"></i> <span>${maxTemp}°</span></p>
        `;

    elements.realfeel.textContent = `${Math.round(data.main.feels_like)}°`;
    elements.humidity.textContent = `${data.main.humidity}%`;
    elements.wind.textContent = `${data.wind.speed} ${
      config.units === "metric" ? "m/s" : "mph"
    }`;
    elements.pressure.textContent = `${data.main.pressure} hPa`;

    // Format date and time
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    elements.datetime.textContent = now.toLocaleDateString("en-US", options);
    elements.error.style.display = "none";
  }

  // Update forecast UI
  function updateForecastUI(data) {
    elements.hourlyContainer.innerHTML = "";
    elements.dailyContainer.innerHTML = "";

    // Group forecast by day
    const dailyForecast = {};
    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecast[date]) {
        dailyForecast[date] = [];
      }
      dailyForecast[date].push(item);
    });

    // Display next 8 hours (3-hour intervals)
    const next24Hours = data.list.slice(0, 8);
    next24Hours.forEach((hour, index) => {
      const time = new Date(hour.dt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
      });
      const temp = Math.round(hour.main.temp);
      const icon = hour.weather[0]?.icon || "01d";

      const hourlyItem = document.createElement("div");
      hourlyItem.className = "hourly-item";
      hourlyItem.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
      hourlyItem.style.opacity = "0";
      hourlyItem.innerHTML = `
                <p>${time}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${hour.weather[0]?.description}">
                <p>${temp}°</p>
            `;
      elements.hourlyContainer.appendChild(hourlyItem);
    });

    // Display next 5 days
    const dailyDates = Object.keys(dailyForecast).slice(1, 6);
    dailyDates.forEach((date, index) => {
      const dayData = dailyForecast[date];
      const dayName = new Date(dayData[0].dt * 1000).toLocaleDateString([], {
        weekday: "short",
      });
      const dayIcon = dayData[4]?.weather[0]?.icon || "01d";
      const dayTempMax = Math.round(
        Math.max(...dayData.map((item) => item.main.temp_max))
      );
      const dayTempMin = Math.round(
        Math.min(...dayData.map((item) => item.main.temp_min))
      );

      const dailyItem = document.createElement("div");
      dailyItem.className = "daily-item";
      dailyItem.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
      dailyItem.style.opacity = "0";
      dailyItem.innerHTML = `
                <div>
                    <p>${dayName}</p>
                    <img src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="${dayData[0].weather[0]?.description}">
                </div>
                <div class="daily-temp">
                    <p>${dayTempMax}°</p>
                    <p>${dayTempMin}°</p>
                </div>
            `;
      elements.dailyContainer.appendChild(dailyItem);
    });
  }

  // Show error message
  function showError(message) {
    elements.city.textContent = "WeatherSense";
    elements.city.classList.remove("loading");
    elements.temperature.textContent = "--°";
    elements.forecast.textContent = "";
    elements.icon.src = "https://openweathermap.org/img/wn/01d@4x.png";
    elements.minmax.innerHTML = `
            <p><i class="fas fa-temperature-arrow-down"></i> <span>--°</span></p>
            <p><i class="fas fa-temperature-arrow-up"></i> <span>--°</span></p>
        `;
    elements.realfeel.textContent = "--°";
    elements.humidity.textContent = "--%";
    elements.wind.textContent = "-- m/s";
    elements.pressure.textContent = "-- hPa";
    elements.datetime.textContent = "Search for a city to begin";
    elements.hourlyContainer.innerHTML = "";
    elements.dailyContainer.innerHTML = "";

    elements.error.textContent = message;
    elements.error.style.display = "block";

    setTimeout(() => {
      elements.error.style.display = "none";
    }, 5000);
  }

  // Initialize the app
  init();
});
