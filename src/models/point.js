import mongoose from 'mongoose'

// Taken from Mongoose GeoJSON support - https://mongoosejs.com/docs/geojson.html
const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  { _id: false }
)

export default pointSchema
