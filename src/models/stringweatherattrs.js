import mongoose from 'mongoose'

const stringWeatherSchema = new mongoose.Schema({
  areaId: {
    type: String,
    required: true
  },
  timeStart: {
    type: Date,
    required: true
  },
  timeEnd: {
    type: Date,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
})

const Weather = mongoose.model('Weather', stringWeatherSchema)
const WindDirection = mongoose.model('WindDirection', stringWeatherSchema)

export { stringWeatherSchema, Weather, WindDirection }
