import jsend from 'jsend'
import { getWeatherForAllAreas } from '../services/areaservice'
import { connectDb } from '../models'

const areaHandler = obs => {
  return connectDb().switchMap(() => {
    return obs.switchMap(() => {
      return getWeatherForAllAreas().map(areas => jsend.success(areas))
    })
  })
}

export default areaHandler
