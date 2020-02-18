/* eslint-disable */
;(() => {
  const jakartaCoordinates = [-6.21462, 106.84513]
  const defaultZoomLevel = 12
  const mapElId = 'mapid'

  const getCurrentPosition = (opts) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, opts)
    })
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
      id: 'mapbox/outdoors-v11',
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
  allAreasObservable.subscribe(
    (res) => {
      res.data.data.forEach(area => {
        const marker = L.marker([area.location.latitude, area.location.longitude], {
          riseOnHover: true
        }).addTo(map)
        const temperature = area.temperature ? area.temperature.value : 'Tidak Tercakup'
        const weather = area.weather ? area.weather.value : 'Tidak Tercakup'
        const message = `<b>${area.name}</b><h3>${temperature}&deg;C</h3><h4>${weather}</h4>`
        marker.bindPopup(message)
      })
    }
  )

  const currentPositionObservable = Rx.Observable.fromPromise(getCurrentPosition())
    .switchMap(position => {
      const myPosition = [position.coords.latitude, position.coords.longitude]
      const marker = L.marker(myPosition).addTo(map)
      map.setView(myPosition, 12)

      marker.bindPopup('Sedang mengukur suhu, sebentar..').openPopup()

      const nearbyPromise = axios.get(`/v1/nearby?latitude=${myPosition[0]}&longitude=${myPosition[1]}`)
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
    })
  currentPositionObservable.subscribe((res) => {
    const { nearestPoint, marker } = res
    const { weather, temperature } = nearestPoint

    const currentTemp = temperature.value
    const currentWeather = weather.value

    const message = `<b>Lokasi Saya Sekarang</b><h3>${currentTemp}&deg;C</h3><h4>${currentWeather}</h4>`
    marker.bindPopup(message).openPopup()
  })
})()
