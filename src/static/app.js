/* eslint-disable */
;(() => {
  const jakartaCoordinates = [-6.21462, 106.84513]
  const defaultZoomLevel = 12
  const mapElId = 'mapid'

  const getCurrentPosition = opts => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, opts)
    })
  }

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
    let timeOfDay = now.getHours() >= 6 && now.getHours() <= 18 ? 'day' : 'night'
    
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

  const getWeatherCard = (opts) => {
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

  // New Map - Center to Jakarta
  const map = L.map(mapElId).setView(jakartaCoordinates, defaultZoomLevel)

  // Leaflet Init
  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Data diambil dari <a href="http://data.bmkg.go.id/" target="_blank">BMKG</a>. Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a><br />A work by <a href="https://twitter.com/tista" target="_blank">tista</a> - <a href="https://github.com/tistaharahap/cuaca" target="_blank">Contribute in Github</a>',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoidGlzdGFoYXJhaGFwIiwiYSI6ImNrNm55ZmcybjBncjMzcnBnNThxZ3lkYnoifQ.HjvHI88s8unEqHJ0pVMQPw'
    }
  ).addTo(map)

  const allAreasObservable = Rx.Observable.fromEvent(document, 'DOMContentLoaded')
    .switchMap(() => axios.get('/v1/areas'))
    .filter(res => {
      const { data } = res
      if (!data) {
        return false
      }
      const resData = data.data
      if (!resData) {
        return false
      }

      return true
    })
  allAreasObservable.subscribe(res => {
    res.data.data.forEach(area => {
      const marker = L.marker([area.location.latitude, area.location.longitude], {
        riseOnHover: true
      }).addTo(map)
      const temperature = area.temperature ? area.temperature.value : 'Tidak Tercakup'
      const wi = area.weather ? weatherCodeTranslator(area.weather.code) : 'Tidak Tercakup'
      const humidity = area.humidity ? area.humidity : 'Tidak Tercakup'
      const tmax = area.maximumTemperature ? area.maximumTemperature.value : 'Tidak Tercakup'
      const tmin = area.minimumTemperature ? area.minimumTemperature.value : 'Tidak Tercakup'
      const humin = area.minimumHumidity ? area.minimumHumidity.value : 'Tidak Tercakup'
      const humax = area.maximumHumidity ? area.maximumHumidity.value : 'Tidak Tercakup'

      const html = getWeatherCard({
        title: area.name,
        textBody: `Suhu saat ini <b>${temperature}</b>&deg;C dengan cuaca <i>${Object.prototype.hasOwnProperty.call(wi, 'friendlyName') ? wi.friendlyName.toLowerCase() : wi}</i> dan kelembapan ${humidity.value*100}%.`,
        wiIcon: Object.prototype.hasOwnProperty.call(wi, 'icon') ? wi.icon : '',
        tmax,
        tmin,
        humin,
        humax
      })
      marker.bindPopup(html)
    })
  })

  const currentPositionObservable = Rx.Observable.fromPromise(getCurrentPosition()).switchMap(
    position => {
      const myPosition = [position.coords.latitude, position.coords.longitude]
      const marker = L.marker(myPosition).addTo(map)
      map.setView(myPosition, 12)

      marker.bindPopup('Sedang mengukur suhu, sebentar..').openPopup()

      const nearbyPromise = axios.get(
        `/v1/nearby?latitude=${myPosition[0]}&longitude=${myPosition[1]}`
      )
      return Rx.Observable.fromPromise(nearbyPromise)
        .filter(res => {
          const { data } = res
          if (!data) {
            return false
          }
          const resData = data.data
          if (!resData) {
            return false
          }

          return true
        })
        .map(res => {
          return {
            nearestPoint: res.data.data.nearestPoint,
            marker
          }
        })
    }
  )
  currentPositionObservable.subscribe(res => {
    const { nearestPoint, marker } = res
    const { weather, temperature, humidity, minimumTemperature, maximumTemperature, minimumHumidity, maximumHumidity } = nearestPoint

    const currentTemp = temperature.value

    const wi = weatherCodeTranslator(weather.code)
    const html = getWeatherCard({
      title: 'Lokasi Kamu',
      textBody: `Suhu saat ini <b>${currentTemp}</b>&deg;C dengan cuaca <i>${wi.friendlyName.toLowerCase()}</i> dan kelembapan ${humidity.value*100}%.`,
      wiIcon: wi.icon,
      tmax: maximumTemperature.value,
      tmin: minimumTemperature.value,
      humax: maximumHumidity.value,
      humin: maximumHumidity.value
    })
    marker.bindPopup(html)
  }, err => {
    console.error(err)
  })
})()
