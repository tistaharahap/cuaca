import fs from 'fs'
import Rx from 'rxjs'
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

export { httpDownloader, writeToFile }
