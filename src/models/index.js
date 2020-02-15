import mongoose from 'mongoose'
import Rx from 'rxjs'
import env from '../env'

const connectDb = () => {
  const opts = {
    useNewUrlParser: true
  }
  const promise = mongoose.connect(env.mongoDbConnString, opts)
  return Rx.Observable.fromPromise(promise).observeOn(Rx.Scheduler.asap)
}

const closeDbConnection = conn => {
  return Rx.Observable.fromPromise(conn.disconnect()).observeOn(Rx.Scheduler.asap)
}

export { connectDb, closeDbConnection }
