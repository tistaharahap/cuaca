import mongoose from 'mongoose'

const timerangeValueSchema = new mongoose.Schema({
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  valueUnit: {
    type: String,
    required: true
  }
})

const timerangeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  values: {
    type: [timerangeValueSchema],
    required: true
  },
  day: {
    type: Date,
    required: false
  },
  hoursSinceTimestamp: {
    type: Number,
    required: false
  }
})

const parameterSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  timeranges: {
    type: [timerangeSchema],
    required: false
  }
})

export { parameterSchema, timerangeSchema, timerangeValueSchema }
