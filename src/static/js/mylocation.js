/* eslint-disable */
import { weatherCodeTranslator, getWeatherCard, getCurrentPosition } from '/js/utils.js'

const myLocation = map => {
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
  currentPositionObservable.subscribe(
    res => {
      const { nearestPoint, marker } = res
      const {
        weather,
        temperature,
        humidity,
        minimumTemperature,
        maximumTemperature,
        minimumHumidity,
        maximumHumidity
      } = nearestPoint

      const currentTemp = temperature.value

      const wi = weatherCodeTranslator(weather.code)
      const html = getWeatherCard({
        title: 'Lokasi Kamu',
        textBody: `Suhu saat ini <b>${currentTemp}</b>&deg;C dengan cuaca <i>${wi.friendlyName.toLowerCase()}</i> dan kelembapan ${humidity.value *
          100}%.`,
        wiIcon: wi.icon,
        tmax: maximumTemperature.value,
        tmin: minimumTemperature.value,
        humax: maximumHumidity.value,
        humin: minimumHumidity.value
      })
      marker.bindPopup(html)
    },
    err => {
      console.error(err)
    }
  )
}

export default myLocation
