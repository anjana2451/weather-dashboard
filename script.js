// Weather Dashboard

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

const forecast = document.getElementById("forecast");

// Hide messages initially
loading.style.display = "none";
error.textContent = "";

// Weather condition function
function getWeatherInfo(code) {

    if (code === 0) {
        return {
            text: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code === 1 || code === 2) {
        return {
            text: "Partly Cloudy",
            icon: "🌤️"
        };
    }

    if (code === 3) {
        return {
            text: "Cloudy",
            icon: "☁️"
        };
    }

    if (code >= 45 && code <= 48) {
        return {
            text: "Foggy",
            icon: "🌫️"
        };
    }

    if (code >= 51 && code <= 67) {
        return {
            text: "Rainy",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            text: "Snowy",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            text: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (code >= 95) {
        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        text: "Unknown",
        icon: "🌤️"
    };
}


// Fetch weather data
async function getWeather(city) {

    try {

        loading.style.display = "block";
        error.textContent = "";

        // Step 1: Get city coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to connect to weather service.");
        }

        const geoData = await geoResponse.json();

        console.log("Geocoding data:", geoData);

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city name.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get weather information
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();

        console.log("Weather data:", weatherData);

        // Display current weather
        displayCurrentWeather(location, weatherData);

        // Display forecast
        displayForecast(weatherData);

    } catch (err) {

        console.error(err);

        error.textContent = err.message;

        cityName.textContent = "Weather";
        temperature.textContent = "--";
        condition.textContent = "No data";
        humidity.textContent = "--%";
        wind.textContent = "-- km/h";
        weatherIcon.textContent = "❌";

        forecast.innerHTML = "";

    } finally {

        loading.style.display = "none";

    }
}


// Display current weather
function displayCurrentWeather(location, data) {

    const current = data.current;

    const weatherInfo = getWeatherInfo(
        current.weather_code
    );

    cityName.textContent =
        `${location.name}, ${location.country}`;

    temperature.textContent =
        Math.round(current.temperature_2m);

    condition.textContent =
        weatherInfo.text;

    weatherIcon.textContent =
        weatherInfo.icon;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    wind.textContent =
        `${current.wind_speed_10m} km/h`;
}


// Display 5-day forecast
function displayForecast(data) {

    forecast.innerHTML = "";

    const dates = data.daily.time;
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;
    const codes = data.daily.weather_code;

    for (let i = 0; i < 5; i++) {

        const weatherInfo =
            getWeatherInfo(codes[i]);

        const date =
            new Date(dates[i]);

        const formattedDate =
            date.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short"
            });

        const card =
            document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${formattedDate}</h3>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <p>${weatherInfo.text}</p>

            <p class="forecast-temp">
                ${Math.round(maxTemps[i])}°C /
                ${Math.round(minTemps[i])}°C
            </p>
        `;

        forecast.appendChild(card);
    }
}


// Search button
searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        error.textContent =
            "Please enter a city name.";

        return;
    }

    getWeather(city);
});


// Press Enter to search
cityInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});