/* eslint-disable */
import { weatherCodeTranslator, getWeatherCard } from '/js/utils.js'

const showAllAreas = map => {
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
        textBody: `Suhu saat ini <b>${temperature}</b>&deg;C dengan cuaca <i>${
          Object.prototype.hasOwnProperty.call(wi, 'friendlyName')
            ? wi.friendlyName.toLowerCase()
            : wi
        }</i> dan kelembapan ${humidity.value * 100}%.`,
        wiIcon: Object.prototype.hasOwnProperty.call(wi, 'icon') ? wi.icon : '',
        tmax,
        tmin,
        humin,
        humax
      })
      marker.bindPopup(html)
    })
  })
}

export default showAllAreas
