import jsend from 'jsend'
import geodist from 'geodist'
import { getNearbyWeather } from '../services/areaservice'
import { connectDb } from '../models'

const nearbyHandler = obs => {
  return connectDb().switchMap(() => {
    return obs.switchMap(ctx => {
      const { latitude, longitude, minDistance, maxDistance } = ctx.request.query
      return getNearbyWeather(
        latitude,
        longitude,
        maxDistance ? parseInt(maxDistance, 10) : undefined,
        minDistance ? parseInt(minDistance, 10) : undefined
      )
        .map(result => {
          const { area } = result
          if (!area) {
            return jsend.success({})
          }
          const {
            humidity,
            temperature,
            weather,
            windSpeed,
            windDirection,
            minimumHumidity,
            maximumHumidity,
            minimumTemperature,
            maximumTemperature
          } = result
          const { description, location, type } = area
          const distanceInMeters = geodist(
            { lat: latitude, lon: longitude },
            { lat: location.coordinates[1], lon: location.coordinates[0] },
            { unit: 'meters' }
          )

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
              temperature,
              weather,
              windSpeed,
              windDirection,
              minimumHumidity,
              maximumHumidity,
              minimumTemperature,
              maximumTemperature
            }
          }
        })
        .map(location => jsend.success(location))
    })
  })
}

export default nearbyHandler
