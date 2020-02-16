import jsend from 'jsend'
import geodist from 'geodist'
import { getNearbyWeather } from '../services/areaservice'
import { connectDb } from '../models'
import { transformWeatherTimerange } from '../bmkgutils'

const nearbyHandler = obs => {
  return connectDb().switchMap(() => {
    return obs.switchMap(ctx => {
      const { latitude, longitude } = ctx.request.query
      return getNearbyWeather(latitude, longitude)
        .map(area => {
          const { description, location, type, parameters } = area
          const distanceInMeters = geodist(
            { lat: latitude, lon: longitude },
            { lat: location.coordinates[1], lon: location.coordinates[0] },
            { unit: 'meters' }
          )
          const humidity = parameters.find(item => item.id === 'hu')
            ? parameters.find(item => item.id === 'hu').timeranges
            : []
          const maxHumidity = parameters.find(item => item.id === 'humax')
            ? parameters.find(item => item.id === 'humax').timeranges
            : []
          const minHumidity = parameters.find(item => item.id === 'humin')
            ? parameters.find(item => item.id === 'humin').timeranges
            : []
          const temperature = parameters.find(item => item.id === 't')
            ? parameters.find(item => item.id === 't').timeranges
            : []
          const maxTemperature = parameters.find(item => item.id === 'tmax')
            ? parameters.find(item => item.id === 'tmax').timeranges
            : []
          const minTemperature = parameters.find(item => item.id === 'tmin')
            ? parameters.find(item => item.id === 'tmin').timeranges
            : []
          const weather = (parameters.find(item => item.id === 'weather')
            ? parameters.find(item => item.id === 'weather').timeranges
            : []
          ).map(it => transformWeatherTimerange(it))

          return {
            nearestPoint: {
              coordinates: {
                latitude: location.coordinates[1],
                longitude: location.coordinates[0]
              },
              name: description,
              distanceInMeters,
              type,
              humidity,
              maxHumidity,
              minHumidity,
              temperature,
              maxTemperature,
              minTemperature,
              weather
            }
          }
        })
        .map(location => jsend.success(location))
    })
  })
}

export default nearbyHandler
