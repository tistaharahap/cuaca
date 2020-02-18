import Rx from 'rxjs'
import { DateTime } from 'luxon'
import { Area } from '../models/area'
import {
  Temperature,
  Humidity,
  WindSpeed,
  MinimumTemperature,
  MaximumTemperature,
  MinimumHumidity,
  MaximumHumidity
} from '../models/decimalweatherattrs'
import { Weather, WindDirection } from '../models/stringweatherattrs'

const getAreaById = areaId => {
  const promise = Area.findOne({ areaId })
  return Rx.Observable.fromPromise(promise).observeOn(Rx.Scheduler.asap)
}

const createArea = opts => {
  const area = new Area(opts)
  const promise = area.save()
  return Rx.Observable.fromPromise(promise).observeOn(Rx.Scheduler.asap)
}

const getNearbyWeather = (latitude, longitude, maxDistance = 15000, minDistance = 5000) => {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance,
        $minDistance: minDistance
      }
    }
  }
  const queryPromise = Area.findOne(query)
    .select('-_id')
    .select('-__v')
  return Rx.Observable.fromPromise(queryPromise)
    .observeOn(Rx.Scheduler.asap)
    .switchMap(area => {
      const attrQuery = {
        areaId: area.areaId,
        timeStart: {
          $lt: DateTime.utc().toJSDate()
        },
        timeEnd: {
          $gt: DateTime.utc().toJSDate()
        }
      }
      const promises = [
        Temperature.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        Humidity.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        WindSpeed.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        Weather.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        WindDirection.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        MinimumTemperature.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        MaximumTemperature.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        MinimumHumidity.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId'),
        MaximumHumidity.findOne(attrQuery)
          .select('-_id')
          .select('-__v')
          .select('-areaId')
      ]
      return Rx.Observable.zip(...promises)
        .observeOn(Rx.Scheduler.asap)
        .map(attrs => {
          return {
            area,
            temperature: attrs[0],
            humidity: attrs[1],
            windSpeed: attrs[2],
            weather: attrs[3],
            windDirection: attrs[4],
            minimumTemperature: attrs[5],
            maximumTemperature: attrs[6],
            minimumHumidity: attrs[7],
            maximumHumidity: attrs[8]
          }
        })
    })
}

export { getAreaById, createArea, getNearbyWeather }
