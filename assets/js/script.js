const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const recentSearch = document.getElementById("recent-searches");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_Key = "063dd6bdb3f51bc236d6d40ade5bf76d"; // Replace with your actual API key

// Generate weather card HTML
const createWeatherCard = (cityName, weatherItem, index) => {
  const date = new Date(weatherItem.dt_txt);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const tempF = (((weatherItem.main.temp - 273.15) * 9) / 5 + 32).toFixed(2);

  if (index === 0) {
    return `
      <div class="details">
        <h2>${cityName} - ${dayName}</h2>
        <small>${fullDate}</small>
        <h4>Temperature: ${tempF}°F</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h6>${weatherItem.weather[0].description}</h6>
      </div>
    `;
  } else {
    return `
      <li class="card">
        <h3>${dayName}</h3>
        <small>${fullDate}</small>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h6>Temp: ${tempF}°F</h6>
        <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
        <h6>Humidity: ${weatherItem.main.humidity}%</h6>
      </li>
    `;
  }
};

const getCurrentWeather = (cityName, lat, lon) => {
  const CURRENT_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_Key}`;
  fetch(CURRENT_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const weatherItem = {
        dt_txt: new Date().toISOString(),
        main: data.main,
        wind: data.wind,
        weather: data.weather,
      };
      currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, 0);
      currentWeatherDiv.style.display = "flex";
    });
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_Key}`;
  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const dailyMap = new Map();
      data.list.forEach((forecast) => {
        const date = new Date(forecast.dt_txt);
        const dateStr = date.toISOString().split("T")[0];
        const hour = date.getHours();
        const diffFromNoon = Math.abs(hour - 12);

        if (
          !dailyMap.has(dateStr) ||
          diffFromNoon < dailyMap.get(dateStr).diffFromNoon
        ) {
          dailyMap.set(dateStr, { forecast, diffFromNoon });
        }
      });

      const todayStr = new Date().toISOString().split("T")[0];
      const forecasts = Array.from(dailyMap.values())
        .map((d) => d.forecast)
        .filter((f) => f.dt_txt.split("T")[0] > todayStr)
        .slice(0, 5);

      weatherCardsDiv.innerHTML = "";
      forecasts.forEach((item, idx) => {
        weatherCardsDiv.insertAdjacentHTML(
          "beforeend",
          createWeatherCard(cityName, item, idx + 1)
        );
      });
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;

  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_Key}`;
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) {
        alert("City not found.");
        return;
      }

      const { lat, lon, name } = data[0];
      getCurrentWeather(name, lat, lon);
      getWeatherDetails(name, lat, lon);
      updateRecentSearches(name, lat, lon);
    });
};

function updateRecentSearches(cityName, lat, lon) {
  if (!recentSearch.querySelector(`button[data-city="${cityName}"]`)) {
    const button = document.createElement("button");
    button.textContent = cityName;
    button.className = "location-btn";
    button.setAttribute("data-city", cityName);
    button.onclick = () => {
      getCurrentWeather(cityName, lat, lon);
      getWeatherDetails(cityName, lat, lon);
    };
    recentSearch.appendChild(button);
  }
}

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") getCityCoordinates();
});
