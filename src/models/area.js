import mongoose from 'mongoose'
import pointSchema from './point'
import { parameterSchema } from './parameter'

const areaSchema = new mongoose.Schema({
  areaId: {
    type: String,
    required: true
  },
  names: {
    type: [String],
    required: true
  },
  location: {
    type: pointSchema,
    required: true
  },
  type: String,
  region: String,
  level: Number,
  description: String,
  domain: String,
  tags: [String],
  parameters: {
    type: [parameterSchema],
    required: false
  }
})

const Area = mongoose.model('Area', areaSchema)

export { areaSchema, Area }
