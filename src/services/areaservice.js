import Rx from 'rxjs'
import { Area } from '../models/area'

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
  return Rx.Observable.fromPromise(queryPromise).observeOn(Rx.Scheduler.asap)
}

export { getAreaById, createArea, getNearbyWeather }
