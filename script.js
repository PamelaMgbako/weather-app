/* script.js - JavaScript code for the Weather App */

// Function to update the weather description in the UI based on the weather code
function getWeatherDescription(weatherCode) {
  /*classify weather codes based on the Open-Meteo API documentation and return a description and an icon*/
  if (weatherCode === 0) {
    return { description: "Clear Sky", icon: "☀" };
  } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
    return { description: "Partly Cloudy", icon: "⛅" };
  } else if (weatherCode === 45 || weatherCode === 48) {
    return { description: "Foggy", icon: "🌫" };
  } else if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55) {
    return { description: "Drizzle", icon: "🌦" };
  } else if (weatherCode === 61 || weatherCode === 63 || weatherCode === 65) {
    return { description: "Rain", icon: "🌧" };
  } else if (weatherCode === 71 || weatherCode === 73 || weatherCode === 75) {
    return { description: "Snow", icon: "❄" };
  } else if (weatherCode === 80 || weatherCode === 81 || weatherCode === 82) {
    return { description: "Rain Showers", icon: "🌦" };
  } else if (weatherCode === 95) {
    return { description: "Thunderstorm", icon: "⛈" };
  } else {
    return { description: "Unknown", icon: "❓" };
  }
}

// Function to show the error message
function showError(message) {
  document.getElementById("errorSection").classList.add("show");
  document.getElementById("errorMessage").innerHTML = message;
}

// Function to hide the error message
function hideError() {
  document.getElementById("errorSection").classList.remove("show");
  document.getElementById("errorMessage").innerHTML = "";
}

/* Function to show the loading message */
function showLoading() {
  document.getElementById("loadingMessage").classList.add("show");
}
//Hide the loading message
function hideLoading() {
  document.getElementById("loadingMessage").classList.remove("show");
}

//gets latitude and longitutde for a city name
async function getCoordinates(cityName) {
  try {
    //URL for the geocoding API to get coordinates based on city name
    let url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;

    //Fetch the coordinates from the API
    let response = await fetch(url);

    //Convert the response to JSON format
    let data = await response.json();

    //Check if the API returned any results
    if (!data.results || data.results.length === 0) {
      showError("City not found.  Please try another city.");
      return null; // Return null if no results found
    }

    // Return the first result (most relevant)
    return data.results[0];
  } catch (error) {
    //catch any errors that occur during the fetch operation and display an error message to the user
    showError(
      "An error occurred while fetching coordinates. Please try again later.",
    );
    return null; // Return null in case of an error
  }
}
//Getweather function using the latitude and longitude
async function getWeatherData(latitude, longitude) {
  try {
    //URL for the weather API to get current weather data based on latitude and longitude
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

    //fetch and await the response from the API
    let response = await fetch(url);

    //convert to JSON
    let data = await response.json();

    //return the data
    return data;
  } catch (error) {
    showError(
      "An error occurred while fetching weather data. Please try again later.",
    );
    return null;
  }
}

//Update the DOM with current weather data
function displayCurrentWeather(data, cityName, country) {
  //Gets the weather description and icon
  let weather = getWeatherDescription(data.current.weather_code);

  //Display weather icon
  document.getElementById("weatherIcon").innerHTML = weather.icon;

  //Display  city name
  document.getElementById("cityName").innerHTML = cityName;

  //Display  country
  document.getElementById("country").innerHTML = country;

  //Display temperature
  document.getElementById("temperature").innerHTML =
    data.current.temperature_2m + "°C";

  //Display weather description
  document.getElementById("weatherDescription").innerHTML = weather.description;

  //Display humidity
  document.getElementById("humidity").querySelector(".statValue").innerHTML =
    data.current.relative_humidity_2m + "%";

  //Display humidity
  document.getElementById("windSpeed").querySelector(".statValue").innerHTML =
    data.current.wind_speed_10m + " km/h";

  //UV Index is set to N/A because it is unavailable on  the free Metro API
  document.getElementById("uvIndex").querySelector(".statValue").innerHTML =
    "N/A";
}

//Update the DOM with 5 day forecast data.
function displayForecast(daily) {
  // Get the forecast container
  let container = document.getElementById("forecastContainer");

  //clear any exisiting forecast rows
  container.innerHTML = "";

  //Loop through 5 days
  for (let i = 0; i < 5; i++) {
    //Get day name from date string
    let date = new Date(daily.time[i] + "T00:00:00");
    let dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // Get weather icon for this day
    let weather = getWeatherDescription(daily.weather_code[i]);

    //Get high and low temperatures
    let high = daily.temperature_2m_max[i];
    let low = daily.temperature_2m_min[i];

    //Build the HTML for this forecast row
    container.innerHTML += `
  <div class="forecastRow">
  <span class="forecastDay">${dayName}</span>
  <span class="forecastIcon">${weather.icon}</span>
  <span class="forecastTemp"><strong>${high}°</strong> ${low}°</span>
  </div>
    `;
  }
}

//Main function trigerred by the Search button
async function handleSearch() {
  //Step 1 - Get the city name from the input
  let city = document.getElementById("cityInput").value.trim();

  //Step 2 - Check if input is empty
  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  //Step 3 - Hide old errors and show loading
  hideError();
  showLoading();

  //Step 4 - Get coordinates for the city
  let location = await getCoordinates(city);

  //Step 5 - Stop if city not found
  if (location === null) {
    hideLoading();
    return;
  }

  //Step 6 - Fetch weather data using coordinates
  let data = await getWeatherData(location.latitude, location.longitude);

  //Step 7 - Stop if weather data failed
  if (data === null) {
    hideLoading();
    return;
  }

  //  Step 8 - Display current weather
  displayCurrentWeather(data, location.name, location.country);

  //Step 9 - Display forecast
  displayForecast(data.daily);

  //Step 10 - Hide loading message
  hideLoading();
}

// Connect the search button to the handleSearch function
document.getElementById("searchBtn").addEventListener("click", handleSearch);
