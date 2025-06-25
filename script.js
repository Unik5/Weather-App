import { apiKey } from "./config.js";

const cityInput = document.querySelector(".cityInput");
const searchBtn = document.querySelector(".searchBtn");

const notFoundSection = document.getElementById("notFound");
const searchCitySection = document.getElementById("searchCity");
const weatherInfoSection = document.getElementById("dataShowing");

const locationNameTxt = document.querySelector(".locationName");
const temperatureTxt = document.querySelector(".temperature");
const skyConditionsTxt = document.querySelector(".sky-conditions");
const currentDateTxt = document.querySelector(".currentDate");
const humidityTxt = document.querySelector(".humidity");
const windSpeedTxt = document.querySelector(".windSpeed");
const weatherSummaryImg = document.querySelector(".weatherSummaryImg");
const forecastItemContainer = document.getElementById(
  "forecast-item-container"
);

//click event listener for search button
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});

//click event listener for input field and enter keyboard command
cityInput.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && cityInput.value.trim() != "") {
    //Enter tichyo ani sab empty space hatyera empty rainaxa bhane
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});

//api call
async function getFetchWeather(endPoint, city) {
  // forcast or weather parameter pathauna milxa, yeta cahi endpoint ma pathako xa
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);

  return response.json(); //response lai json format ma return garne
}

//setting weather icons using id juncahi response ma ako thiyo; id describes the type of weather
function getWeatherIcon(id) {
  console.log(id);
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321 && id >= 300) return "drizzle.svg";
  if (id <= 531 && id >= 500) return "rain.svg";
  if (id <= 622 && id >= 600) return "snow.svg";
  if (id <= 804 && id >= 801) return "clouds.svg";
  if (id <= 781 && id >= 701) return "atmosphere.svg";
  if (id == 800) return "clear.svg";
  else return "clouds.svg"; //kunai milena bhane clouds.svg nai rakhdine
}

//Current date
function getCurrentDate() {
  const curentDate = new Date();
  const options = {
    // yo options structure cahi date lai kun format ma rakhne like weekday, day, month kun format ma lane bhanera banako
    weekday: "short",
    day: "2-digit",
    month: "short",
  };
  return curentDate.toLocaleDateString("en-GB", options);
}

/* 
    main function for updating the data 
*/

async function updateWeatherInfo(city) {
  const weatherData = await getFetchWeather("weather", city); //function call garyo for API call, mathi banako xa yo function
  if (weatherData.cod != "200") {
    //cod =200 bhaneko cahi city nabhetnu ho
    notFoundSection.classList.remove("hidden");
    weatherInfoSection.classList.add("hidden");
    searchCitySection.classList.add("hidden");
    return;
  }

  //destructuring of API response gareko, naya variable banauxa ie name, main and weather. weatherData ma no changes
  const {
    name: location,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  //Updating current data section from destructured varaibles
  locationNameTxt.textContent = location;
  temperatureTxt.textContent = Math.round(temp) + " °C";
  humidityTxt.textContent = humidity + "%";
  skyConditionsTxt.textContent = main;
  windSpeedTxt.textContent = speed + "M/s";
  weatherSummaryImg.src = `./assets/weather/${getWeatherIcon(id)}`; //image set garna lai naya function nai banako
  currentDateTxt.textContent = getCurrentDate(); //date set garna ni function banako

  //updating forecast section from API
  await updateForecastInfo(city);

  //kun section display garne bhanera
  searchCitySection.classList.add("hidden");
  notFoundSection.classList.add("hidden");
  weatherInfoSection.classList.remove("hidden");
}

/* Main change garne function end */

//function to update forcast info(forcast part)
async function updateForecastInfo(city) {
  const forecastData = await getFetchWeather("forecast", city); // 'forcast' API call garyo
  const timeTaken = "12:00:00"; // kun time ma dekaune forcast of everyday
  const todayDate = new Date().toISOString().split("T")[0]; //Aaja ko date nikaleko

  forecastItemContainer.innerHTML = ``; //clearing the whole section, aba yetai bata insert garne forecast boxes
  //response ko harek element ma check garne by using forEach , 12:00:00 ra aaja ko date bahek ko values linxa ie bholi parsi .... samma ko 12:00:00 time ko forecast linxa
  forecastData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastItems(forecastWeather); //tyo selected data lai updateForecastItems() function ma pathaune
    }
  });
}

//Adds new forecast boxes
function updateForecastItems(forecastWeather) {
  //selected data which is sent from updateForecastInfo() lai destructing gareko, as required values niakleko
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = forecastWeather;
  //destructing bata aako date lai format milayera dekhuana
  const dateTaken = new Date(date);
  const dateOption = {
    //this structure is used to define the format of date ,mathi gareko jastai
    day: "2-digit",
    month: "short",
  };
  const dateResult = dateTaken.toLocaleDateString("en-US", dateOption); //correct format ma date nikalyo

  //adding the forecast cards
  const forecastCards = `
  <div class="forecast-cards flex flex-col p-3 flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl hover:bg-white/30 hover:delay-50">
        <h5 class="px-8">${dateResult}</h5>
        <img src="./assets/weather/${getWeatherIcon(id)}" alt="Weather" />
        <h5 class="px-10 pt-2">${Math.round(temp)} °C</h5>
    </div>`;
  forecastItemContainer.insertAdjacentHTML("beforeend", forecastCards);
}
