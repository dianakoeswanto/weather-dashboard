const projectFormEl = $('#project-form');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');


const api = 'cbb60b34001a3d28a017d24e3403afce';

/** 
 * Parses the text field and calls the appropriate apis.
 */
const handleCitySearchSubmit = (event) => {
    event.preventDefault();

    resetDisplay();

    const cityInput = $('#inputCity').val().trim();
    if(!cityInput) {
        alert("Please enter a city");
        return;
    }

    fetchLongLat(cityInput);
}

const resetDisplay = () => {
    currentWeatherEl.innerHTML = "";
    forecastEl.innerHTML = "";
    $('#inputCity').val("");
}

/**
 * Find the long and lat of the given city name
 * @param {string} cityName City name entered
 */
const fetchLongLat = async (cityName) => {
    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${cityName}&cnt=5&appid=${api}`)
    const responseJSON = await response.json();

    if(response.status !== 200) {
        alert("City name doesn't exist");
        resetDisplay();
    } else {
        const lon = responseJSON.coord.lon;
        const lat = responseJSON.coord.lat;
    
        fetchWeatherReport(lon, lat);
    }
}

/**
 * Fetch the weather report of the next 7 days given the lon and lat of the city
 * @param {*} lon Longitude
 * @param {*} lat Latitude
 */
const fetchWeatherReport = async (lon, lat) => {
    const response = await fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${api}`);
    const weatherReport = await response.json();

    console.log(weatherReport);
    
    displayWeather(currentWeatherEl, weatherReport.daily[0], weatherReport.timezone, false);


    for(let i = 1; i < weatherReport.daily.length - 2; i++) {
        const weatherEl = document.createElement("div");
        weatherEl.classList.add("card", "col-12", "col-md-3", "col-xl-2", "bg-dark", "text-light", "py-3");

        displayWeather(weatherEl, weatherReport.daily[i], "", true);
        forecastEl.appendChild(weatherEl);
    }
}

const displayWeather = (weatherEl, weather, cityName, isForecast) => {
    weatherEl.appendChild(getTitle(cityName, weather));
    weatherEl.appendChild(getTemp(weather));
    weatherEl.appendChild(getWind(weather));
    weatherEl.appendChild(getHumidity(weather));

    if(!isForecast) {
        weatherEl.appendChild(getUVI(weather));
    }
}

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
    iconEl.setAttribute("src", `http://openweathermap.org/img/wn/${dailyWeather.weather[0].icon}.png`)
    iconEl.style.width = "40px";
    titleEl.appendChild(iconEl);

    return titleEl;
}

const getTemp = (dailyWeather) => {
    const tempEl = document.createElement("div");
    tempEl.innerHTML = `Temp: ${dailyWeather.temp.day} &#8457`;

    return tempEl;
}

const getWind = (dailyWeather) => {
    const windEl = document.createElement('div');
    windEl.innerHTML = `Wind: ${dailyWeather.wind_speed} MPH`;

    return windEl;
}

const getHumidity = (dailyWeather) => {
    const humidityEl = document.createElement('div');
    humidityEl.innerHTML = `Humidity: ${dailyWeather.wind_speed} %`;

    return humidityEl;
}

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

const init = () => {
    fetchLongLat("Sydney,AU");
}

init();
projectFormEl.on('submit', handleCitySearchSubmit);