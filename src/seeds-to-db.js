/* eslint no-param-reassign: 0 */
/* eslint no-console: 0 */
/* eslint prefer-destructuring: 0 */
import Rx from 'rxjs'
import { DateTime } from 'luxon'
import Decimal from 'decimal.js'
import { getAllWeatherDataJSON } from './utils'
import { connectDb, closeDbConnection } from './models'
import { getAreaById, createArea } from './services/areaservice'
import {
  weatherCodeToHumanReadableWeather,
  windCodeToHumanReadableWindDirection
} from './bmkgutils'
import {
  Humidity,
  MinimumHumidity,
  MaximumHumidity,
  Temperature,
  MinimumTemperature,
  MaximumTemperature,
  WindSpeed
} from './models/decimalweatherattrs'
import { WindDirection, Weather } from './models/stringweatherattrs'

const seedsToDb = getAllWeatherDataJSON()
  // Only do processing if there are JSON updates
  .filter(data => data.length > 0)
  // And the fun begins
  .switchMap(data => {
    return connectDb().switchMap(conn => {
      return Rx.Observable.of(data)
        .switchMap(provinces => {
          const provinceEntryJobs = provinces.map(it => {
            const { timestamp, areas } = it
            return Rx.Observable.of(areas).switchMap(provinceAreas => {
              const jobs = provinceAreas.map(area => {
                return (
                  getAreaById(area.id)
                    // Create new Area if not in DB yet
                    .switchMap(areaFromDb => {
                      // Creating new area
                      if (!areaFromDb) {
                        const areaOpts = {
                          areaId: area.id,
                          names: [area.names.en_US, area.names.id_ID],
                          location: {
                            type: 'Point',
                            coordinates: [parseFloat(area.longitude), parseFloat(area.latitude)]
                          },
                          type: area.type,
                          region: area.region,
                          level: parseInt(area.level, 10),
                          description: area.description,
                          domain: area.domain,
                          tags: area.tags.length > 0 ? area.tags.split(' ,') : []
                        }
                        return createArea(areaOpts)
                      }

                      return Rx.Observable.of(areaFromDb)
                    })

                    // Insert Timeranges
                    .switchMap(areaFromDb => {
                      console.log(`Updating data for ${area.names.en_US}`)

                      const parameters = area.parameters
                      if (!Array.isArray(parameters) || parameters.length === 0) {
                        return Rx.Observable.of(areaFromDb)
                      }

                      const humidity = []
                      const humidityMinimums = []
                      const humidityMaxes = []
                      const temperature = []
                      const temperatureMinimums = []
                      const temperatureMaxes = []
                      const weather = []
                      const windDirections = []
                      const windSpeeds = []

                      const timestampAsLuxon = DateTime.fromISO(timestamp)

                      // Do Humidity
                      const hu = parameters.find(param => param.id === 'hu')
                      if (hu) {
                        let lastTimestamp = timestampAsLuxon

                        hu.timeranges.forEach(tm => {
                          if (tm.type !== 'hourly') {
                            return
                          }

                          const timeStart =
                            humidity.length === 0
                              ? lastTimestamp.minus({ hours: 6 }).toJSDate()
                              : lastTimestamp.toJSDate()
                          lastTimestamp = lastTimestamp.plus({ hours: tm.hours_since_timestamp })
                          const timeEnd = lastTimestamp.toJSDate()
                          const value = parseFloat(
                            new Decimal(tm.values[0].value).div(100).toString()
                          )

                          humidity.push(
                            new Humidity({
                              timeStart,
                              timeEnd,
                              value
                            })
                          )
                        })
                      }

                      // Do Min Humidity
                      const huMin = parameters.find(param => param.id === 'humin')
                      if (huMin) {
                        huMin.timeranges.forEach(tm => {
                          if (tm.type !== 'daily') {
                            return
                          }

                          const timeStart = DateTime.fromISO(tm.day).toJSDate()
                          const timeEnd = DateTime.fromISO(tm.day)
                            .plus({ hours: 23, minutes: 59, second: 59 })
                            .toJSDate()
                          const value = tm.values[0].value

                          humidityMinimums.push(
                            new MinimumHumidity({
                              timeStart,
                              timeEnd,
                              value
                            })
                          )
                        })
                      }

                      // Do Max Humidity
                      const huMax = parameters.find(param => param.id === 'humax')
                      if (huMax) {
                        huMax.timeranges.forEach(tm => {
                          if (tm.type !== 'daily') {
                            return
                          }

                          const timeStart = DateTime.fromISO(tm.day).toJSDate()
                          const timeEnd = DateTime.fromISO(tm.day)
                            .plus({ hours: 23, minutes: 59, second: 59 })
                            .toJSDate()
                          const value = tm.values[0].value

                          humidityMaxes.push(
                            new MaximumHumidity({
                              timeStart,
                              timeEnd,
                              value
                            })
                          )
                        })
                      }

                      // Do Temperature
                      const temp = parameters.find(param => param.id === 't')
                      if (temp) {
                        let lastTimestamp = timestampAsLuxon

                        temp.timeranges.forEach(tm => {
                          if (tm.type !== 'hourly') {
                            return
                          }

                          const timeStart =
                            temperature.length === 0
                              ? lastTimestamp.minus({ hours: 6 }).toJSDate()
                              : lastTimestamp.toJSDate()
                          lastTimestamp = lastTimestamp.plus({ hours: tm.hours_since_timestamp })
                          const timeEnd = lastTimestamp.toJSDate()
                          const value = tm.values[0].value

                          temperature.push(
                            new Temperature({
                              timeStart,
                              timeEnd,
                              value
                            })
                          )
                        })
                      }

                      // Do Min Temperature
                      const minTemp = parameters.find(param => param.id === 'tmin')
                      if (minTemp) {
                        minTemp.timeranges.forEach(tm => {
                          if (tm.type !== 'daily') {
                            return
                          }

                          const timeStart = DateTime.fromISO(tm.day).toJSDate()
                          const timeEnd = DateTime.fromISO(tm.day)
                            .plus({ hours: 23, minutes: 59, second: 59 })
                            .toJSDate()
                          const value = tm.values[0].value

                          temperatureMinimums.push(
                            new MinimumTemperature({
                              timeStart,
                              timeEnd,
                              value
                            })
                          )
                        })
                      }

                      // Do Max Temperature
                      const maxTemp = parameters.find(param => param.id === 'tmax')
                      if (maxTemp) {
                        maxTemp.timeranges.forEach(tm => {
                          if (tm.type !== 'daily') {
                            return
                          }

                          const timeStart = DateTime.fromISO(tm.day).toJSDate()
                          const timeEnd = DateTime.fromISO(tm.day)
                            .plus({ hours: 23, minutes: 59, second: 59 })
                            .toJSDate()
                          const value = tm.values[0].value

                          temperatureMaxes.push(
                            new MaximumTemperature({
                              timeStart,
                              timeEnd,
                              value
                            })
                          )
                        })
                      }

                      // Do Weather
                      const w = parameters.find(param => param.id === 'weather')
                      if (w) {
                        let lastTimestamp = timestampAsLuxon

                        w.timeranges.forEach(tm => {
                          if (tm.type !== 'hourly') {
                            return
                          }

                          const timeStart =
                            weather.length === 0
                              ? lastTimestamp.minus({ hours: 6 }).toJSDate()
                              : lastTimestamp.toJSDate()
                          lastTimestamp = lastTimestamp.plus({ hours: tm.hours_since_timestamp })
                          const timeEnd = lastTimestamp.toJSDate()
                          const value = weatherCodeToHumanReadableWeather(tm.values[0].value)
                          const code = tm.values[0].value

                          weather.push(
                            new Weather({
                              timeStart,
                              timeEnd,
                              value,
                              code
                            })
                          )
                        })
                      }

                      // Do Wind Direction
                      const wd = parameters.find(param => param.id === 'wd')
                      if (wd) {
                        let lastTimestamp = timestampAsLuxon

                        wd.timeranges.forEach(tm => {
                          if (tm.type !== 'hourly') {
                            return
                          }

                          const timeStart =
                            windDirections.length === 0
                              ? lastTimestamp.minus({ hours: 6 }).toJSDate()
                              : lastTimestamp.toJSDate()
                          lastTimestamp = lastTimestamp.plus({ hours: tm.hours_since_timestamp })
                          const timeEnd = lastTimestamp.toJSDate()
                          const value = windCodeToHumanReadableWindDirection(tm.values[1].value)
                          const code = tm.values[1].value

                          windDirections.push(
                            new WindDirection({
                              timeStart,
                              timeEnd,
                              value,
                              code
                            })
                          )
                        })
                      }

                      // Do Wind Speed
                      const ws = parameters.find(param => param.id === 'ws')
                      if (ws) {
                        let lastTimestamp = timestampAsLuxon

                        ws.timeranges.forEach(tm => {
                          if (tm.type !== 'hourly') {
                            return
                          }

                          const timeStart =
                            windSpeeds.length === 0
                              ? lastTimestamp.minus({ hours: 6 }).toJSDate()
                              : lastTimestamp.toJSDate()
                          lastTimestamp = lastTimestamp.plus({ hours: tm.hours_since_timestamp })
                          const timeEnd = lastTimestamp.toJSDate()
                          const value = tm.values[2].value

                          windSpeeds.push(
                            new WindSpeed({
                              timeStart,
                              timeEnd,
                              value
                            })
                          )
                        })
                      }

                      return Rx.Observable.fromPromise(areaFromDb.save())
                        .do(afd =>
                          console.log(`Inserting weather attributes for ${afd.description}`)
                        )
                        .switchMap(afd => {
                          const weatherAttributes = []
                            .concat(
                              humidity.length > 0 ? Humidity.collection.insertMany(humidity) : []
                            )
                            .concat(
                              humidityMinimums.length > 0
                                ? MinimumHumidity.collection.insertMany(humidityMinimums)
                                : []
                            )
                            .concat(
                              humidityMaxes.length > 0
                                ? MaximumHumidity.collection.insertMany(humidityMaxes)
                                : []
                            )
                            .concat(
                              temperature.length > 0
                                ? Temperature.collection.insertMany(temperature)
                                : []
                            )
                            .concat(
                              temperatureMinimums.length > 0
                                ? MinimumTemperature.collection.insertMany(temperatureMinimums)
                                : []
                            )
                            .concat(
                              temperatureMaxes.length > 0
                                ? MaximumTemperature.collection.insertMany(temperatureMaxes)
                                : []
                            )
                            .concat(
                              weather.length > 0 ? Weather.collection.insertMany(weather) : []
                            )
                            .concat(
                              windDirections.length > 0
                                ? WindDirection.collection.insertMany(windDirections)
                                : []
                            )
                            .concat(
                              windSpeeds.length > 0
                                ? WindSpeed.collection.insertMany(windSpeeds)
                                : []
                            )
                          if (weatherAttributes.length === 0) {
                            return Rx.Observable.of(afd)
                          }

                          return Rx.Observable.zip(...weatherAttributes).mapTo(afd)
                        })
                    })
                )
              })
              return Rx.Observable.zip(...jobs)
            })
          })
          return Rx.Observable.zip(...provinceEntryJobs)
        })
        .switchMap(() => closeDbConnection(conn))
    })
  })

seedsToDb.subscribe()
