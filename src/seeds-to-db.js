import { getAllWeatherDataJSON } from './utils'

const seedsToDb = getAllWeatherDataJSON()

seedsToDb.subscribe()
