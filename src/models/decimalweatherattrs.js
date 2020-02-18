import mongoose from 'mongoose'

const decimalWeatherSchema = new mongoose.Schema({
  timeStart: {
    type: Date,
    required: true
  },
  timeEnd: {
    type: Date,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
})

const Humidity = mongoose.model('Humidity', decimalWeatherSchema)
const MinimumHumidity = mongoose.model('MinimumHumidity', decimalWeatherSchema)
const MaximumHumidity = mongoose.model('MaximumHumidity', decimalWeatherSchema)
const Temperature = mongoose.model('Temperature', decimalWeatherSchema)
const MinimumTemperature = mongoose.model('MinimumTemperature', decimalWeatherSchema)
const MaximumTemperature = mongoose.model('MaximumTemperature', decimalWeatherSchema)
const WindSpeed = mongoose.model('WindSpeed', decimalWeatherSchema)

export {
  decimalWeatherSchema,
  Humidity,
  MinimumHumidity,
  MaximumHumidity,
  Temperature,
  MinimumTemperature,
  MaximumTemperature,
  WindSpeed
}
