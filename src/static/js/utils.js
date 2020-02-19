/* eslint-disable */
const weatherCodeTranslator = code => {
  const weatherDictionary = {
    0: 'Langit Cerah',
    1: 'Berawan',
    2: 'Berawan',
    3: 'Berawan',
    4: 'Berawan Tebal',
    100: 'Langit Cerah',
    101: 'Berawan',
    102: 'Berawan',
    103: 'Berawan',
    104: 'Berawan Tebal',
    5: 'Berkabut',
    10: 'Berasap',
    45: 'Berkabut',
    60: 'Hujan Ringan',
    61: 'Hujan',
    63: 'Hujan Lebat',
    80: 'Hujan Terisolasi',
    95: 'Hujan Petir',
    97: 'Hujan Petir'
  }

  const now = new Date()
  const timeOfDay = now.getHours() >= 6 && now.getHours() <= 18 ? 'day' : 'night'

  const iconDictionary = {
    0: {
      day: 'sunny',
      night: 'clear'
    },
    1: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    2: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    3: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    4: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    100: {
      day: 'sunny',
      night: 'clear'
    },
    101: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    102: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    103: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    104: {
      day: 'cloudy',
      night: 'alt-cloudy'
    },
    5: {
      day: 'haze',
      night: 'fog'
    },
    45: {
      day: 'haze',
      night: 'fog'
    },
    60: {
      day: 'hail',
      night: 'alt-hail'
    },
    61: {
      day: 'rain',
      night: 'alt-rain'
    },
    63: {
      day: 'rain',
      night: 'alt-rain'
    },
    80: {
      day: 'rain',
      night: 'alt-rain'
    },
    95: {
      day: 'thunderstorm',
      night: 'thunderstorm'
    },
    97: {
      day: 'thunderstorm',
      night: 'thunderstorm'
    }
  }

  return {
    friendlyName: weatherDictionary[code],
    icon: `wi-${timeOfDay}-${iconDictionary[code][timeOfDay]}`
  }
}

const getWeatherCard = opts => {
  const template = document.querySelector('script#weather-card-template')
  const html = template.innerHTML
  return html
    .replace(/{-title-}/g, opts.title)
    .replace(/{-textbody-}/g, opts.textBody)
    .replace(/{-wi-icon-}/g, opts.wiIcon)
    .replace(/{-tmax-}/g, opts.tmax)
    .replace(/{-tmin-}/g, opts.tmin)
    .replace(/{-humax-}/g, opts.humax)
    .replace(/{-humin-}/g, opts.humin)
}

const getCurrentPosition = opts => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, opts)
  })
}

export { weatherCodeTranslator, getWeatherCard, getCurrentPosition }
