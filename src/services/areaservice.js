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

export { getAreaById, createArea }
