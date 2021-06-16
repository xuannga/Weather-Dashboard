function initPage() {

    //Assigning api key to "APIkey"
    const APIkey = "33e1948fcada4cc29fa60a82875771c3";

    //Retrieve element from HTML and assigning to variable
    var enterCityEl = document.getElementById("inputCity");
    var searchBtnEl = document.getElementById("search");
    var clearHistoryEl = document.getElementById("clearHx");
    var cityNameEl = document.getElementById("city");
    var currentPicEl = document.getElementById("current-pic");
    var currentTempEl = document.getElementById("temperature");
    var currentHumidityEl = document.getElementById("humidity");
    var currentWindEl = document.getElementById("wind-speed");
    var currentUVEl = document.getElementById("UV-index");
    var historyEl = document.getElementById("history");
    var fivedayEl = document.getElementById("fiveDay");
    var todayweatherEl = document.getElementById("todayWeather");

    //local storage
    var searchHistory = JSON.parse(localStorage.getItem("search")) || [];


    //retrieve weather after user enters city of choice
    function getWeather(cityName) {
        //Request from open weather api
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIkey;
        axios.get(queryURL)
            .then(function(response) {

                todayweatherEl.classList.remove("d-none");

                //Displaying current weather
                var currentDate = new Date(response.data.dt * 1000);
                var day = currentDate.getDate();
                var month = currentDate.getMonth() + 1;
                var year = currentDate.getFullYear();
                cityNameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
                var weatherPic = response.data.weather[0].icon;
                currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                currentPicEl.setAttribute("alt", response.data.weather[0].description);
                currentTempEl.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
                currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                currentWindEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";

                // display UV Index
                var lat = response.data.coord.lat;
                var lon = response.data.coord.lon;
                var UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIkey + "&cnt=1";
                axios.get(UVQueryURL)
                    .then(function(response) {
                        var UVIndex = document.createElement("span");

                        if (response.data[0].value < 4) {
                            UVIndex.setAttribute("class", "badge badge-success");
                        } else if (response.data[0].value < 8) {
                            UVIndex.setAttribute("class", "badge badge-warning");
                        } else {
                            UVIndex.setAttribute("class", "badge badge-danger");
                        }
                        console.log(response.data[0].value)
                        UVIndex.innerHTML = response.data[0].value;
                        currentUVEl.innerHTML = "UV Index: ";
                        currentUVEl.append(UVIndex);
                    });

                // Get forecast
                var cityID = response.data.id;
                var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIkey;
                axios.get(forecastQueryURL)
                    .then(function(response) {
                        fivedayEl.classList.remove("d-none");

                        //  display forecast 5days
                        var forecastEls = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            const forecastIndex = i * 8 + 4;
                            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            const forecastDay = forecastDate.getDate();
                            const forecastMonth = forecastDate.getMonth() + 1;
                            const forecastYear = forecastDate.getFullYear();
                            const forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);

                            //Setting icons for weather
                            const forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            const forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                            forecastEls[i].append(forecastTempEl);
                            const forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);
                        }
                    })
            });
    }

    //Retrieve history from local storage
    searchBtnEl.addEventListener("click", function() {
        var searchTerm = enterCityEl.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    // Clear History
    clearHistoryEl.addEventListener("click", function() {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    })

    //convert temp kelvin - fah
    function k2f(K) {
        return Math.floor((K - 273.15) * 1.8 + 32);
    }

    function renderSearchHistory() {
        historyEl.innerHTML = "";
        for (let i = 0; i < searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click", function() {
                getWeather(historyItem.value);
            })
            historyEl.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }

}

initPage();