const weatherCodeToHumanReadableWeather = code => {
  if (!Number.isInteger(code)) {
    throw new TypeError('Weather code must be an integer')
  }

  const weatherDictionary = {
    0: 'Clear Skies',
    1: 'Partly Cloudy',
    2: 'Partly Cloudy',
    3: 'Mostly Cloudy',
    4: 'Overcast',
    100: 'Clear Skies',
    101: 'Partly Cloudy',
    102: 'Partly Cloudy',
    103: 'Mostly Cloudy',
    104: 'Overcast',
    5: 'Haze',
    10: 'Smoke',
    45: 'Fog',
    60: 'Light Rain',
    61: 'Rain',
    63: 'Heavy Rain',
    80: 'Isolated Shower',
    95: 'Severe Thunderstorm',
    97: 'Severe Thunderstorm'
  }

  return weatherDictionary[code]
}

const windCodeToHumanReadableWindDirection = code => {
  const windDictionary = {
    N: 'North',
    NNE: 'North-Northeast',
    NE: 'Northeast',
    ENE: 'East-Northeast',
    E: 'East',
    ESE: 'East-Southeast',
    SE: 'Southeast',
    SSE: 'South-Southeast',
    S: 'South',
    SSW: 'South-Southwest',
    SW: 'Southwest',
    WSW: 'West-Southwest',
    W: 'West',
    WNW: 'West-Northwest',
    NW: 'Northwest',
    NNW: 'North-Northwest',
    VARIABLE: 'Changing Winds'
  }

  return windDictionary[code]
}

const transformWeatherTimerange = wtr => {
  return {
    type: wtr.type,
    timestamp: wtr.timestamp,
    hoursSinceTimestamp: wtr.hoursSinceTimestamp,
    values: wtr.values.map(it => {
      return {
        valueUnit: it.valueUnit,
        value: weatherCodeToHumanReadableWeather(it.value)
      }
    })
  }
}

export {
  weatherCodeToHumanReadableWeather,
  windCodeToHumanReadableWindDirection,
  transformWeatherTimerange
}
