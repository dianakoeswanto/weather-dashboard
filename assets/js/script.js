const projectFormEl = $('#project-form');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');
const historyEl = document.getElementById('history');

const api = 'cbb60b34001a3d28a017d24e3403afce';

/** 
 * Parses the text field and calls the appropriate apis.
 */
const handleCitySearchSubmit = (event) => {
    event.preventDefault();

    const cityName = document.getElementById('inputCity').value.trim();
    if(!cityName) {
        alert("Please enter a city");
        return;
    }

    fetchLongLat(cityName);
    
}

const resetDisplay = () => {
    currentWeatherEl.innerHTML = "";
    forecastEl.innerHTML = "";
    historyEl.innerHTML = "";
    $('#inputCity').val("");
}

/**
 * Find the long and lat of the given city name
 * @param {string} cityName City name entered
 */
const fetchLongLat = async (cityName) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&cnt=5&appid=${api}`)
    const responseJSON = await response.json();

    if(response.status !== 200) {
        alert("City name doesn't exist");
        resetDisplay();
    } else {
        const lon = responseJSON.coord.lon;
        const lat = responseJSON.coord.lat;
    
        resetDisplay();
        fetchWeatherReport(lon, lat);
        localStorage.setItem(`${responseJSON.name}, ${responseJSON.sys.country}`, 1);
        displaySearchHistory();
    }
}

/**
 * Fetch the weather report of the next 7 days given the lon and lat of the city
 * @param {*} lon Longitude
 * @param {*} lat Latitude
 */
const fetchWeatherReport = async (lon, lat) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${api}`);
    const weatherReport = await response.json();

    displayWeather(currentWeatherEl, weatherReport.daily[0], weatherReport.timezone, false);

    for(let i = 1; i < weatherReport.daily.length - 2; i++) {
        const weatherEl = document.createElement("div");
        weatherEl.classList.add("card", "col-12", "col-md-3", "col-xl-2", "bg-dark", "text-light", "py-3", "mx-2", "mb-3");

        displayWeather(weatherEl, weatherReport.daily[i], "", true);
        forecastEl.appendChild(weatherEl);
    }
}

/**
 * Creates element and displays on screen
 * @param {*} weatherEl Element to add weather information to
 * @param {*} weather Data about the weather to be displayed in the card
 * @param {*} cityName The entered city name
 * @param {*} isDailyForecast Boolean to indiciate if weather is today's weather or upcoming
 */
const displayWeather = (weatherEl, weather, cityName, isDailyForecast) => {
    weatherEl.appendChild(getTitle(cityName, weather));
    weatherEl.appendChild(getTemp(weather));
    weatherEl.appendChild(getWind(weather));
    weatherEl.appendChild(getHumidity(weather));

    if(!isDailyForecast) {
        weatherEl.appendChild(getUVI(weather));
    }
}

/** 
 * Creates the card title
 */
const getTitle = (city, dailyWeather) => {
    const titleEl = document.createElement("h6");
    if(city) {
        titleEl.style.fontSize = "18px";
        let cityEl = document.createElement("span");
        cityEl.innerHTML = `${city} `;
        titleEl.appendChild(cityEl);
    }

    const date = moment.unix(dailyWeather.dt).format('MM/DD/yyyy');
    const dateEl = document.createElement("span");
    dateEl.innerHTML = `(${date})`
    titleEl.appendChild(dateEl);

    const iconEl = document.createElement("img");
    iconEl.setAttribute("src", `https://openweathermap.org/img/wn/${dailyWeather.weather[0].icon}.png`)
    iconEl.style.width = "40px";
    titleEl.appendChild(iconEl);

    return titleEl;
}

/**
 * Creates the temp information
 * @param {*} dailyWeather The weather
 * @returns 
 */
const getTemp = (dailyWeather) => {
    const tempEl = document.createElement("div");
    tempEl.innerHTML = `Temp: ${dailyWeather.temp.day} &#8457`;

    return tempEl;
}

/**
 * Creates the wind information
 * @param {*} dailyWeather 
 * @returns 
 */
const getWind = (dailyWeather) => {
    const windEl = document.createElement('div');
    windEl.innerHTML = `Wind: ${dailyWeather.wind_speed} MPH`;

    return windEl;
}

/**
 * Creates the humidity information
 * @param {*} dailyWeather 
 * @returns 
 */
const getHumidity = (dailyWeather) => {
    const humidityEl = document.createElement('div');
    humidityEl.innerHTML = `Humidity: ${dailyWeather.wind_speed} %`;

    return humidityEl;
}

/**
 * Creates the uvi index information
 * @param {*} dailyWeather 
 * @returns 
 */
const getUVI = (dailyWeather) => {
    //Create UVI Index Label
    const uviEl = document.createElement('div');
    const uviLabelEl = document.createElement('span');
    uviLabelEl.innerHTML = "UV Index: ";
    uviEl.appendChild(uviLabelEl);

    //Create UVI Badge
    const uvi = dailyWeather.uvi;
    const uviBadgeEl = document.createElement('span');
    uviBadgeEl.innerHTML =uvi;
    uviBadgeEl.classList.add("badge", getUVIBadge(uvi));
    uviEl.appendChild(uviBadgeEl);

    return uviEl;
}

/**
 * Gets the badge class name so it can be displayed in different colors
 * @param {*} uvi 
 * @returns 
 */
const getUVIBadge = (uvi) => {
    if (uvi < 3) {
        return "badge-success";
    }
        
    if (uvi < 6) {
        return "badge-warning";
    }

    if (uvi < 8) {
        return "badge-high";
    }
        
    if (uvi < 11) {
        return "badge-danger";
    }
        
    if (uvi < 20) {
        return "badge-extreme";
    }
}

/**
 * Display Search History
 */
const displaySearchHistory = () => {
    for(let idx = 0; idx < localStorage.length; idx++) {
        displayLastSearched(localStorage.key(idx));
    }
}

const displayLastSearched = (searchedCityName) => {
    const buttonEl = document.createElement("button");
    buttonEl.setAttribute("type", "button");
    buttonEl.classList.add("btn", "btn-block", "btn-success", "full-width");
    buttonEl.innerHTML = searchedCityName;

    buttonEl.addEventListener("click", (e) => {
        fetchLongLat(e.target.textContent);
    })
    historyEl.prepend(buttonEl);
}

/**
 * Initial load of application
 */
const init = () => {
    fetchLongLat("Sydney,AU");
    projectFormEl.on('submit', handleCitySearchSubmit);
}

$(document).ready( () => {
    init();
})