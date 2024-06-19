document.addEventListener("DOMContentLoaded", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var city = await getCityFromCoords(lat, lon);
        if (city) {
          fetchWeatherData(city);
        } else {
          alert("Unable to determine city from your location.");
        }
      },
      function (error) {
        console.error("Error occurred while retrieving location:", error);
        alert("Failed to get your location. Please enter a city manually.");
      }
    );
  } else {
    alert(
      "Geolocation is not supported by this browser. Please enter a city manually."
    );
  }

  document.getElementById("submit").addEventListener("click", function () {
    var city = document.getElementById("search").value.trim();
    if (city) {
      fetchWeatherData(city);
    } else {
      alert("Please enter a valid city name.");
    }
  });

  async function getCityFromCoords(lat, lon) {
    var apiKey = "92bd21f6bd254f54bc6123829241706";
    try {
      var response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      var data = await response.json();
      return data.location.name;
    } catch (error) {
      console.error("Fetching city data failed:", error);
      return null;
    }
  }

  async function fetchWeatherData(city) {
    var apiKey = "92bd21f6bd254f54bc6123829241706";
    try {
      var response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      var data = await response.json();
      displayWeather(data);
    } catch (error) {
      console.error("Fetching weather data failed:", error);
      alert(
        "Failed to fetch weather data. Please check the city name and try again."
      );
    }
  }




  function displayWeather(data) {
    var weatherCards = document.getElementById('weatherCards');
    if (!weatherCards) {
        console.error('weatherCards element not found');
        return;
    }

    weatherCards.innerHTML = '';
    data.forecast.forecastday.forEach((day, index) => {
        var date = new Date(day.date);
        var dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        var isNight = new Date().getHours() >= 18 || new Date().getHours() < 6; // Assuming night starts at 6 PM and ends at 6 AM
        var tempToShow = index === 0 && isNight ? day.day.mintemp_c : day.day.maxtemp_c;
        var tempLabel = index === 0 && isNight ? 'Min' : 'Avg';
        var iconURL = isNight ? day.day.condition.icon.replace('day', 'night') : day.day.condition.icon;
        var tempHTML = index === 0 ? `<div class="temp-large">${tempToShow}<sup>o</sup>C (${tempLabel})</div>` : `<div>${tempToShow}<sup>o</sup>C (${tempLabel})</div>`;

        if (index === 1 || index === 2) {
            tempToShow = day.day.maxtemp_c;
            tempLabel = 'Max';
            iconURL = day.day.condition.icon;
        }

        var minTemp = index !== 0 ? `<small>${day.day.mintemp_c}<sup>o</sup>C Min</small>` : '';
        var dateHTML = index === 0 ? `<div class="date">${date.toLocaleDateString('en-US')}</div>` : ''; 
        var headerClass = index !== 0 ? 'text-center' : ''; 
        var locationHTML = index === 0 ? `<div class="location mt-5">${data.location.name}</div>` : ''; 
        var dayClass = index !== 0 ? 'm-auto' : ''; 
        var dayConditionClass = index !== 0 ? 'text-center' : ''; 

        
        var tempHTML = index === 0 ? `<div class="temp-large">${tempToShow}<sup>o</sup>C </div>` : `<div>${tempToShow}<sup>o</sup>C </div>`;

        var card = `
            <div class="col-md-4">
                <div class="bg-black text-white p-3 rounded card-h ">
                    <div class="today forecast">
                        <div class="forecast-header d-flex justify-content-between  ${headerClass}">
                            <div class="day ${dayClass}">${dayName}</div>
                            ${dateHTML} <!-- Display date only for the first card -->
                        </div>
                        <div class="forecast-content">
                            ${locationHTML} 
                            
                            <div class="degree d-flex align-items-center flex-column">
                                <div class="forecast-icon py-2 m-2 pt-2">
                                    <img src="${iconURL}" alt="" width="50">
                                </div>
                                
                                <div class='temp p-2'>
                                    ${tempHTML} 
                                </div>   
                                <div class='temp '>
                                    ${minTemp}
                                </div>
                            </div>
                            <div class="daycondition p-2 ${dayConditionClass}">${day.day.condition.text}</div>
                            ${index === 0 ? 
                                `<div class="d-flex justify-content-between mt-2 ">
                                    <span><img src="images/icon-umbrella.png" alt=""> ${day.day.daily_chance_of_rain}%</span>
                                    <span><img src="images/icon-wind.png" alt=""> ${day.day.maxwind_kph} km/h</span>
                                    <span><img src="images/icon-compass.png" alt=""> ${day.day.wind_dir}</span>
                                </div>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        weatherCards.innerHTML += card;
    });
}
});
