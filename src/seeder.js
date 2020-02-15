import Rx from 'rxjs'
import fxp from 'fast-xml-parser'
import weatherSource from './sumberdata'
import { httpDownloader, writeToFile } from './utils'

const downloader = Rx.Observable.of(weatherSource).switchMap(it => {
  const downloadJobs = it.map(item => httpDownloader(item[1]))
  return Rx.Observable.zip(...downloadJobs)
    .map(xmls =>
      xmls.map(item => {
        const opts = {
          ignoreAttributes: false
        }
        const parsed = fxp.parse(item, opts)
        return parsed.data.forecast
      })
    )
    .map(xmls => {
      const provinces = it.map(item => item[0])
      return provinces.map((item, index) => [item, xmls[index]])
    })
    .switchMap(data => {
      const jobs = data.map(item => {
        const filename = `./weatherdata/${item[0].replace(/ /g, '-').toLowerCase()}.json`
        return writeToFile(filename, JSON.stringify(item[1]))
      })
      return Rx.Observable.zip(...jobs)
    })
})

downloader.subscribe()
