import fs from 'fs'
import path from 'path'
import Rx from 'rxjs'
import readdir from 'fs-readdir-promise'
import readfile from 'fs-readfile-promise'
import { DateTime } from 'luxon'
import axios from 'axios'

const httpDownloader = url => {
  const promise = axios.get(url)
  return Rx.Observable.fromPromise(promise)
    .observeOn(Rx.Scheduler.asap)
    .map(response => response.data)
}

const writeToFile = (filename, data, encoding = 'utf-8') => {
  const promise = new Promise((resolve, reject) => {
    fs.writeFile(filename, data, encoding, err => {
      if (err) {
        reject()
      } else {
        resolve()
      }
    })
  })
  return Rx.Observable.fromPromise(promise)
}

const bmkgDatetimeToISODatetime = bmkgDatetime => {
  const isodatetime = `${bmkgDatetime.slice(0, 4)}-${bmkgDatetime.slice(4, 6)}-${bmkgDatetime.slice(
    6,
    8
  )}T${bmkgDatetime.slice(8, 10)}-${bmkgDatetime.slice(10, 12)}-00`
  return DateTime.fromISO(isodatetime, {
    zone: 'UTC'
  }).toString()
}

const bmkgDateToISODate = bmkgDate => {
  const isodate = `${bmkgDate.slice(0, 4)}-${bmkgDate.slice(4, 6)}-${bmkgDate.slice(6, 8)}T00:00:00`
  return DateTime.fromISO(isodate, {
    zone: 'UTC'
  }).toString()
}

const getAllWeatherDataJSON = () => {
  const weatherdataPath = path.join(__dirname, '../weatherdata')
  const promise = readdir(weatherdataPath).then(files => {
    return files.filter(file => file.endsWith('.json')).map(file => `${weatherdataPath}/${file}`)
  })

  return Rx.Observable.fromPromise(promise).switchMap(files => {
    const promises = files.map(file => readfile(file, 'utf8'))
    return Rx.Observable.zip(...promises).map(it => it.map(file => JSON.parse(file)))
  })
}

const getWebsiteIndex = () => {
  const indexPath = path.join(__dirname, './static/index.html')
  const file = fs.readFileSync(indexPath)
  return file
}

const getStaticFile = fn => {
  const filePath = path.join(__dirname, `./static/${fn}`)
  const file = fs.readFileSync(filePath)
  return file
}

export {
  httpDownloader,
  writeToFile,
  bmkgDatetimeToISODatetime,
  bmkgDateToISODate,
  getAllWeatherDataJSON,
  getWebsiteIndex,
  getStaticFile
}
