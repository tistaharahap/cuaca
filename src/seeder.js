/* eslint no-param-reassign: 0 */
/* eslint no-console: 0 */
import Rx from 'rxjs'
import fxp from 'fast-xml-parser'
import { DateTime } from 'luxon'
import weatherSource from './sumberdata'
import { httpDownloader, writeToFile, bmkgDateToISODate } from './utils'

const seeder = Rx.Observable.of(weatherSource).switchMap(it => {
  const downloadJobs = it.map(item => httpDownloader(item[1]))

  // Download the source
  return (
    Rx.Observable.zip(...downloadJobs)
      // Parse XLM to JSON
      .map(xmls =>
        xmls.map(item => {
          const opts = {
            ignoreAttributes: false,
            attributeNamePrefix: ''
          }
          const parsed = fxp.parse(item, opts)
          return parsed.data.forecast
        })
      )
      // Data Cleanups
      .map(xmls => {
        return xmls.map(item => {
          const { year, month, day, hour, minute, second } = item.issue
          const timestamp = DateTime.fromJSDate(new Date(year, month, day, hour, minute, second), {
            zone: 'UTC'
          }).toISO()

          // The source data key should be plural
          const areas = item.area.map(area => {
            area.names = {
              en_US: area.name[0]['#text'],
              id_ID: area.name[1]['#text']
            }

            delete area.name
            delete area.coordinate

            // The source data key should be plural
            if (Object.prototype.hasOwnProperty.call(area, 'parameter')) {
              area.parameters = area.parameter.map(parameter => {
                parameter.timeranges = parameter.timerange.map(timerange => {
                  // Don't need this key
                  delete timerange.datetime

                  // Values
                  if (!Array.isArray(timerange.value)) {
                    timerange.values = [timerange.value]
                  } else {
                    timerange.values = timerange.value
                  }
                  delete timerange.value
                  timerange.values = timerange.values.map(val => {
                    return {
                      value: val['#text'],
                      value_unit: val.unit
                    }
                  })

                  // This h key is so lazy
                  timerange.hours_since_timestamp = timerange.h
                  delete timerange.h

                  // Convert day value to ISO date
                  if (Object.prototype.hasOwnProperty.call(timerange, 'day')) {
                    timerange.day = bmkgDateToISODate(timerange.day)
                  }

                  return timerange
                })

                delete parameter.timerange

                return parameter
              })

              delete area.parameter
            }

            return area
          })

          return {
            timestamp,
            areas
          }
        })
      })
      // Recombine
      .map(xmls => {
        const provinces = it.map(item => item[0])
        return provinces.map((item, index) => [item, xmls[index]])
      })
      // Write to JSON files
      .switchMap(data => {
        const jobs = data.map(item => {
          const filename = `./weatherdata/${item[0].replace(/ /g, '-').toLowerCase()}.json`
          return writeToFile(filename, JSON.stringify(item[1]))
        })
        return Rx.Observable.zip(...jobs)
      })
  )
})

seeder.subscribe(
  () => {},
  err => {
    console.error(err.stack)
    process.exit(1)
  }
)
