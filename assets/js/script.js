const key = "2eb84bd9c91396232bf772ae41827d70";

// function titleCaseAndMinimalSpaces
// function removeDuplicates
// function fetchAPIData

// function getLatLon
// function getWeatherData

// function calculateAverage

// function fetchAndDisplayWeather

// function renderSavedCities
// function init
// function storeCities



$(document).ready(function() {
    // function to change user inputs to title case and remove multiple spaces
    function titleCaseAndMinimalSpaces(input) {
        // removes multiple or end spaces and split the input at the spaces
        var userCityInput = input.replace(/\s+/g, ' ').trim().split(' ');
      
        // capitalize the first letter of each word and convert the rest of the word to lowercase
        var properNouns = userCityInput.map(function(properNoun) {
          return properNoun.charAt(0).toUpperCase() + properNoun.slice(1).toLowerCase();
        });
      
        // join capitalized words back into a single string
        return properNouns.join(' ');
    };


    // function to remove duplicates from an array
    function removeDuplicates(array) {
        // empty object
        var uniqueItems = {};
    
        // use filter method to include only unique values
        var uniqueArray = array.filter(function(item) {
            if (!uniqueItems[item]) {
                uniqueItems[item] = true;
                return true;
            }
            return false;
        });
    
        return uniqueArray;;
    }

    // function to fetch data from an API
    function fetchAPIData(apiUrl) {
        return fetch(apiUrl)
            .then(function(response) {
                return response.json();
            })
    };


    // function to retrieve and store lat and lon for a location from geocoder API 
    var lat;
    var lon;


    function getLatLon(cityName) {
        // call to geocoder API
        var geocoderApiURL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${key}`;
        return fetchAPIData(geocoderApiURL)
        .then(function(data) {
            // check for valid API data
            if (data.length > 0) {
                // extract and store latitude and longitude from the data as number
                lat = Number(data[0].lat);
                lon = Number(data[0].lon);
            }
            console.log ("lat and lon from geocoder API:")
            console.log (lat, lon);
        })
    }


    // function to get weather data using the retrieved lat and lon
    function getWeatherData (lat, lon) {
        // calls to current weather and five day forecast APIs
        var currentWeatherApiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`
        var fiveDayForecastApiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`;
        // data from both calls are retrieved, [0] currentWeather, [1]fiveDayForecast
        return Promise.all([
            fetchAPIData(currentWeatherApiURL),
            fetchAPIData(fiveDayForecastApiURL)
        ]);

    }


    // function to calculate the avg value in an array
    function calculateAverage(array) {
        if (array.length === 0) return 0;
        var sum = 0;
        for (var i = 0; i < array.length; i++) {
        sum += array[i];
        }
        return (sum / array.length).toFixed(2);
    }


    // function to fetch and display weather data
    function fetchAndDisplayWeather(cityName) {
        localStorage.setItem('cityName', cityName);

        getLatLon(cityName)
                .then(function(){
                    console.log ("lat and lon @ global scope:")
                    console.log (lat, lon);

                    // call for weather data using lat and lon
                    return getWeatherData(lat, lon);
                })

                .then(function(allWeatherData) {
                    // allWeatherData is an array containing data from both APIs
                    var currentWeather = allWeatherData[0];
                    var fiveDayForecast = allWeatherData[1];
                    console.log("currentWeather API data:")
                    console.log(currentWeather)
                    console.log("fiveDayForecast API data")
                    console.log(fiveDayForecast)


                    // populate current weather desc and icon
                    var currentWeatherMain = currentWeather.weather[0].main;
                    var currentWeatherDesc = currentWeather.weather[0].description;
                    var currentIconCode = currentWeather.weather[0].icon;
                    console.log (`${currentWeatherMain}, ${currentWeatherDesc}, ${currentIconCode}`);
                    var currentWeatherDescEl = document.getElementById('wicon-description');
                    currentWeatherDescEl.textContent = (`${currentWeatherMain}: ${currentWeatherDesc}`);
                    var iconURL = `https://openweathermap.org/img/w/${currentIconCode}.png`;
                    var currentIconIMG = document.getElementById('wicon');
                    currentIconIMG.style.display = 'block';
                    currentIconIMG.src = iconURL; 


                    // populate search city name and current date
                    var currentDate = dayjs().format("M/DD/YYYY");
                    var cityNameFromAPI = currentWeather.name;
                    var searchCityCurrentDate = `${cityNameFromAPI} (${currentDate})`;
                    var searchCityCurrentDateEl = document.getElementById('search-city-current-date');
                    searchCityCurrentDateEl.textContent = (`${searchCityCurrentDate} `);
                    searchCityCurrentDateEl.style.display = 'inline';
                    currentIconIMG.style.display = 'inline';
                    searchCityCurrentDateEl.appendChild(currentIconIMG);
                    
                        
                    // populate current temp
                    var currentTemp = currentWeather.main.temp;
                    var currentTempDiv = document.getElementById('current-temp');
                    currentTempDiv.textContent = `Temperature: ${currentTemp}°F`; 

                    // populate current wind
                    var currentWind = currentWeather.wind.speed;
                    var currentWindDiv = document.getElementById('current-wind');
                    currentWindDiv.textContent = `Wind Speed: ${currentWind} mph`; 

                    // populate current humidity
                    var humidity = currentWeather.main.humidity;
                    var currentHumidityDiv = document.getElementById('current-humidity');
                    currentHumidityDiv.textContent = `Humidity: ${humidity}%`;  


                    // five day forecast API gives forecast data for every 3 hours from time of API call, 
                    // need to average the temp, wind, and humidity data of *each day*...
                    // each day may have a different number of data values based on time of API call
                    
                    // declare empty objects to store all 40 values from API data with its corresponding date   
                    var tempsList = {};
                    var windSpeedList = {};
                    var humidityList = {};
                    var iconsList = {};
                    var weatherMainsList = {};
                    var weatherDescriptionsList = {};
                    var iconTimestampsList = {};

                    // declare empty objects to store avg value for each date
                    var dailyTempAverages = {};
                    var dailyWindSpeedAverages = {};
                    var dailyHumidityAverages = {};
                    var dailyFirstIcon = {};
                    var dailyFirstWeatherMain = {};
                    var dailyFirstWeatherDescription = {};
                    var dailyFirstIconTimestamp = {};

                    // loop through all forty entries in API data to find date and value
                    fiveDayForecast.list.forEach(entry => {
                        // extract each date and convert to M/DD/YYYY
                        var date = dayjs.unix(entry.dt).format('M/DD/YYYY');

                        var temp = entry.main.temp;
                        if (tempsList[date]) { // check if temp data exists for date, and if yes, add that temp to that date array
                            tempsList[date].push(temp);
                        } else { // if date doesn't exist yet, create new array with that date
                            tempsList[date] = [temp];
                        }
                        console.log(`temp: ${temp}`)

                        var windSpeed = entry.wind.speed;
                        if (windSpeedList[date]) {
                            windSpeedList[date].push(windSpeed);
                        } else {
                            windSpeedList[date] = [windSpeed];
                        }
                        console.log(`windSpeed: ${windSpeed}`)

                        var humidity = entry.main.humidity;
                        if (humidityList[date]) {
                            humidityList[date].push(humidity);
                        } else {
                            humidityList[date] = [humidity];
                        }
                        console.log(`humidity: ${humidity}`)
                        
                        // create array of icons by date
                        var icon = [`${entry.weather[0].icon}`];
                        if (iconsList[date]) {
                            iconsList[date].push(icon);
                        } else {
                            iconsList[date] = [icon];
                        }

                        // create array of MAIN weather descriptions
                        var weatherMain = [`${entry.weather[0].main}`];
                        if (weatherMainsList[date]) {
                            weatherMainsList[date].push(weatherMain);
                        } else {
                            weatherMainsList[date] = [weatherMain];
                        }

                        // create array of weather descriptions
                        var weatherDesc = [`${entry.weather[0].description}`];
                        if (weatherDescriptionsList[date]) {
                            weatherDescriptionsList[date].push(weatherDesc);
                        } else {
                            weatherDescriptionsList[date] = [weatherDesc];
                        }

                        // create array of timestamps corresponding with first weather icons 
                        var iconTimestamp = [`${entry.dt}`];
                        if (iconTimestampsList[date]) {
                            iconTimestampsList[date].push(iconTimestamp);
                        } else {
                            iconTimestampsList[date] = [iconTimestamp];
                        }


                        // now calculate the avg in each array
                        for (var date in tempsList) { // for each date array in tempsList,
                            dailyTempAverages[date] = calculateAverage(tempsList[date]);
                        }

                        for (var date in windSpeedList) {
                            dailyWindSpeedAverages[date] = calculateAverage(windSpeedList[date]);
                        }    

                        for (var date in humidityList) {
                            dailyHumidityAverages[date] = calculateAverage(humidityList[date]);
                        }

                        // grab the first icon per date in array
                        for (var date in iconsList) {
                            dailyFirstIcon[date] = iconsList[date][0];
                        }

                        // grab the first weather MAIN description per date in array
                        for (var date in weatherMainsList) {
                            dailyFirstWeatherMain[date] = weatherMainsList[date][0];
                        }

                        // grab the first weather description per date in array
                        for (var date in weatherDescriptionsList) {
                            dailyFirstWeatherDescription[date] = weatherDescriptionsList[date][0];
                        }

                        // grab the datestamp corresponding with the first icon per date in array
                        for (var date in iconTimestampsList) {
                            dailyFirstIconTimestamp[date] = iconTimestampsList[date][0];
                        }
                
                    })
                    console.log(dailyTempAverages);
                    console.log(dailyWindSpeedAverages);
                    console.log(dailyHumidityAverages);
                    console.log(dailyFirstIcon);
                    console.log(`${dailyFirstWeatherMain}: ${dailyFirstWeatherDescription}`)
                    console.log(dailyFirstIconTimestamp);

                    var currentDate = dayjs().format('M/DD/YYYY');

                    // retrieve the dates (keys) from dailytempAverages
                    var fiveDayForecastDates = Object.keys(dailyTempAverages);

                    // determine if the first date in the data corresponds to "today" or "tomorrow"
                    var startIndex = 0;
                    if (fiveDayForecastDates.length > 0) {
                    var firstDate = dayjs(fiveDayForecastDates[0]).format('M/DD/YYYY');
                    if (firstDate === currentDate) {
                        startIndex = 1; // skip the first entry in API data
                    }};


                    // IDs of the divs to populate
                    var elementIDs = ['day-1', 'day-2', 'day-3', 'day-4', 'day-5'];

                    for (var i = 0; i < elementIDs.length; i++) {
                    var date = dayjs(fiveDayForecastDates[startIndex + i]).format('M/DD/YYYY');
                    var temp = dailyTempAverages[fiveDayForecastDates[startIndex + i]];
                    var wind = dailyWindSpeedAverages[fiveDayForecastDates[startIndex + i]];
                    var humidity = dailyHumidityAverages[fiveDayForecastDates[startIndex + i]];
                    var icon =  dailyFirstIcon[fiveDayForecastDates[startIndex + i]];
                    var weatherMain = dailyFirstWeatherMain[fiveDayForecastDates[startIndex + i]];
                    var weatherDesc = dailyFirstWeatherDescription[fiveDayForecastDates[startIndex + i]];
                    var iconTimestamp = dailyFirstIconTimestamp[fiveDayForecastDates[startIndex + i]];
                    

                    var dateEl = document.getElementById(`${elementIDs[i]}-date`);
                    dateEl.textContent = date;

                    // populate five-day weather description
                    var weatherDescEl = document.getElementById(`${elementIDs[i]}-wicon-description`);
                    weatherDescEl.textContent = (`${weatherMain}: ${weatherDesc}`);

                    // populate five-day weather icon
                    var fiveDayIconEl = document.getElementById(`${elementIDs[i]}-wicon`);
                    var fiveDayIconURL = `https://openweathermap.org/img/w/${icon}.png`;
                    fiveDayIconEl.style.display = 'block';
                    fiveDayIconEl.src = fiveDayIconURL; 

                    // populate five-day weather icon/desc timestamp
                    var iconTimestampEl = document.getElementById(`${elementIDs[i]}-wicon-timestamp`);
                    iconTimestampEl.textContent = `(at ${dayjs.unix(iconTimestamp).format('H:mm a')})`;
                

                    var tempEl = document.getElementById(`${elementIDs[i]}-temp`);
                    tempEl.textContent = `Temp: ${temp} °F`;

                    var windEl = document.getElementById(`${elementIDs[i]}-wind`);
                    windEl.textContent = `Wind Speed: ${wind} mph`;

                    var humidityEl = document.getElementById(`${elementIDs[i]}-humidity`);
                    humidityEl.textContent = `Humidity: ${humidity}%`;

                    console.log("dates of 5 day forecast data: " + fiveDayForecastDates)
                    
                        // due to nature of API data, there may not be data available for fifth day, depending on time of call
                        if (i === 4 && !fiveDayForecastDates[startIndex + i]) {
                            dateEl.textContent = "Data not available yet";
                            tempEl.textContent = "";
                            windEl.textContent = "";
                            humidityEl.textContent = "";
                        }
                    }
                })
    };
  


    var cityInput = $("#city-input");
    var savedCitiesList = $("#previous-cities");


    // store all searches as an array using local storage
    var savedCities = [];

    // function to render each stored city as a button in the #previous-cities div
    function renderSavedCities() {
        // empty list before rendering 
        savedCitiesList.empty();

        // limit to only 7 buttons
        var sevenButtonsMax = Math.min(7, savedCities.length);
        
        // render a new button for each city
        for (var i = 0; i < sevenButtonsMax; i++) {
          var savedCity = savedCities[i];
          var button = $("<button>").text(savedCity).addClass("previous-city-button");
          savedCitiesList.append(button);
        }
    };
    
    // this function is called at the end and will run when the page loads.
    function init() {
        // get stored cities from localStorage
        var storedCities = JSON.parse(localStorage.getItem("savedCities"));
        
        // if storedCities were retrieved from localStorage, update the savedCities array to it
        if (storedCities !== null) {
            savedCities = storedCities;
        }
        // render the previous cities, and also render the main page with the most recent search
        renderSavedCities();
        fetchAndDisplayWeather(storedCities[0]);
    };


    // function to store cities in local storage as an array in cities
    function storeCities() {
        // stringify savedCities and store in localStorage with key "savedCities" \
        localStorage.setItem("savedCities", JSON.stringify(savedCities));
    };


    // function search city
    function searchCity() {
        var cityName = $('#city-input').val();
        var properCityName = titleCaseAndMinimalSpaces(cityName);

        // stop executing if code is blank
        if (properCityName === "") {
            alert("Enter a city, input field is blank.");
            return; 
        }    

        fetchAndDisplayWeather(properCityName);
        savedCities.unshift(properCityName); // add to index[0] so button appears at the top
        savedCities = removeDuplicates(savedCities);
        cityInput.val("");
        console.log("saved cities array:")
        console.log(savedCities)
        storeCities();
        renderSavedCities();
    }

    // event handler for the search button
    $('#search-btn').click(function() {
        searchCity();
    });


    // event handler for enter key on the input field
    $('#city-input').on('keyup', function(event) {
        if (event.key === 'Enter') {
            searchCity();
        }
    });



    // event handler for the previous city input buttons
    $('#previous-cities').on('click', '.previous-city-button', function(event) {
        if (event.target.classList.contains('previous-city-button')) {
            var cityName = event.target.textContent;
            fetchAndDisplayWeather(cityName);
        }
    });


    init();


});
