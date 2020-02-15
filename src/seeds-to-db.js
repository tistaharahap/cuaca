/* eslint no-param-reassign: 0 */
/* eslint no-console: 0 */
/* eslint prefer-destructuring: 0 */
import Rx from 'rxjs'
import { DateTime } from 'luxon'
import { getAllWeatherDataJSON } from './utils'
import { connectDb, closeDbConnection } from './models'
import { getAreaById, createArea } from './services/areaservice'

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
                        let parameters = []
                        if (Object.prototype.hasOwnProperty.call(area, 'parameters')) {
                          parameters = area.parameters.map(param => {
                            return {
                              id: param.id,
                              description: param.description,
                              type: param.type,
                              timeranges: []
                            }
                          })
                        }
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
                          tags: area.tags.length > 0 ? area.tags.split(' ,') : [],
                          parameters
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

                      areaFromDb.parameters = area.parameters.map(item => {
                        const timeranges = item.timeranges.map(tm => {
                          return {
                            type: tm.type,
                            values: tm.values.map(val => {
                              return {
                                value: val.value,
                                valueUnit: val.value_unit
                              }
                            }),
                            timestamp: DateTime.fromISO(timestamp).toJSDate(),
                            day:
                              tm.day !== undefined
                                ? DateTime.fromISO(tm.day).toJSDate()
                                : undefined,
                            hoursSinceTimestamp:
                              tm.hours_since_timestamp !== undefined
                                ? tm.hours_since_timestamp
                                : undefined
                          }
                        })
                        return {
                          id: item.id,
                          description: item.description,
                          type: item.type,
                          timeranges
                        }
                      })

                      return Rx.Observable.fromPromise(areaFromDb.save())
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
