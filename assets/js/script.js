const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const recentSearch = document.getElementById("recent-searches");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_Key = "063dd6bdb3f51bc236d6d40ade5bf76d"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
  // reformatting date as MM-DD-YYYY
  const date = new Date(weatherItem.dt_txt);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  if (index === 0) {
    // HTML for the main weather card
    return `<div class="details">
                    <h2>${cityName} (${formattedDate})</h2>
                    <h4>Temperature: ${(
                      ((weatherItem.main.temp - 273.15) * 9) / 5 +
                      32
                    ).toFixed(2)}°F</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else {
    // HTML for the other five day forecast card
    return `<li class="card">
                    <h3>(${formattedDate})</h3>
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>Temp: ${(
                      ((weatherItem.main.temp - 273.15) * 9) / 5 +
                      32
                    ).toFixed(2)}°F</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_Key}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      // Filter the forecasts to get only one forecast per day
      const today = new Date().getDate();
      const fiveDaysForecast = data.list.filter((forecast, index) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (forecastDate > today && index < 6) {
          return true;
        }
      });

      // Clears previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Creates weather cards and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  console.log(cityName);
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_Key}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
      updateRecentSearches(name, lat, lon);
    });
};

// recent searches button
function updateRecentSearches(cityName, lat, lon) {
  if (!recentSearch.querySelector(`button[data-city="${cityName}"]`)) {
    const button = document.createElement("button");
    button.textContent = cityName;
    button.className = "location-btn";
    button.setAttribute("data-city", cityName);
    button.style.display = "block";
    button.style.backgroundColor = "grey";
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "10px";
    button.style.marginTop = "5px";

    button.onclick = () => getWeatherDetails(cityName, lat, lon);

    recentSearch.appendChild(button);
  }
}

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);
