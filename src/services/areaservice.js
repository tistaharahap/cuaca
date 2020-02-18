import Rx from 'rxjs'
import { DateTime } from 'luxon'
import { Area } from '../models/area'
import {
  Temperature,
  Humidity,
  WindSpeed,
  MinimumTemperature,
  MaximumTemperature,
  MinimumHumidity,
  MaximumHumidity
} from '../models/decimalweatherattrs'
import { Weather, WindDirection } from '../models/stringweatherattrs'

const getAreaById = areaId => {
  const promise = Area.findOne({ areaId })
  return Rx.Observable.fromPromise(promise).observeOn(Rx.Scheduler.asap)
}

const createArea = opts => {
  const area = new Area(opts)
  const promise = area.save()
  return Rx.Observable.fromPromise(promise).observeOn(Rx.Scheduler.asap)
}

const getWeatherForArea = area => {
  if (!area) {
    return Rx.Observable.of({})
  }
  const attrQuery = {
    areaId: area.areaId,
    timeStart: {
      $lt: DateTime.utc().toJSDate()
    },
    timeEnd: {
      $gt: DateTime.utc().toJSDate()
    }
  }
  const promises = [
    Temperature.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    Humidity.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    WindSpeed.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    Weather.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    WindDirection.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    MinimumTemperature.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    MaximumTemperature.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    MinimumHumidity.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId'),
    MaximumHumidity.findOne(attrQuery)
      .select('-_id')
      .select('-__v')
      .select('-areaId')
  ]
  return Rx.Observable.zip(...promises)
    .observeOn(Rx.Scheduler.asap)
    .map(attrs => {
      return {
        area,
        temperature: attrs[0],
        humidity: attrs[1],
        windSpeed: attrs[2],
        weather: attrs[3],
        windDirection: attrs[4],
        minimumTemperature: attrs[5],
        maximumTemperature: attrs[6],
        minimumHumidity: attrs[7],
        maximumHumidity: attrs[8]
      }
    })
}

const getWeatherForAllAreas = () => {
  const attrCollections = [
    'humidities',
    'minimumhumidities',
    'maximumhumidities',
    'temperatures',
    'minimumtemperatures',
    'maximumtemperatures',
    'weathers',
    'winddirections',
    'windspeeds'
  ]
  const generateAttrLookupPipeline = (collection, ts) => {
    return {
      $lookup: {
        from: collection,
        let: {
          areaId: '$areaId'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$areaId', '$$areaId'] },
                  { $lt: ['$timeStart', ts] },
                  { $gt: ['$timeEnd', ts] }
                ]
              }
            }
          },
          {
            $project: {
              _id: 0,
              __v: 0,
              areaId: 0
            }
          }
        ],
        as: collection
      }
    }
  }
  const additionalPipelines = [
    {
      $project: {
        _id: 0,
        __v: 0,
        'location.type': 0
      }
    },
    {
      $addFields: {
        'location.latitude': {
          $arrayElemAt: ['$location.coordinates', 1]
        },
        'location.longitude': {
          $arrayElemAt: ['$location.coordinates', 0]
        }
      }
    },
    {
      $project: {
        'location.coordinates': 0
      }
    }
  ]

  const now = DateTime.utc().toJSDate()
  const pipelines = attrCollections
    .map(coll => generateAttrLookupPipeline(coll, now))
    .concat(additionalPipelines)

  const promise = Area.aggregate(pipelines)

  return Rx.Observable.fromPromise(promise).map(areas => {
    return areas.map(area => {
      return {
        name: area.description,
        location: area.location,
        type: area.type,
        humidity: area.humidities.length > 0 ? area.humidities[0] : null,
        temperature: area.temperatures.length > 0 ? area.temperatures[0] : null,
        weather: area.weathers.length > 0 ? area.weathers[0] : null,
        windSpeed: area.windspeeds.length > 0 ? area.windspeeds[0] : null,
        windDirection: area.winddirections.length > 0 ? area.winddirections[0] : null,
        minimumHumidity: area.minimumhumidities.length > 0 ? area.minimumhumidities[0] : null,
        maximumHumidity: area.maximumhumidities.length > 0 ? area.maximumhumidities[0] : null,
        minimumTemperature:
          area.minimumtemperatures.length > 0 ? area.minimumtemperatures[0] : null,
        maximumTemperature: area.maximumtemperatures.length > 0 ? area.maximumtemperatures[0] : null
      }
    })
  })
}

const getNearbyWeather = (latitude, longitude, maxDistance = 100000, minDistance = 0) => {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance,
        $minDistance: minDistance
      }
    }
  }
  const queryPromise = Area.findOne(query)
    .select('-_id')
    .select('-__v')
  return Rx.Observable.fromPromise(queryPromise)
    .observeOn(Rx.Scheduler.asap)
    .switchMap(getWeatherForArea)
}

export { getAreaById, createArea, getNearbyWeather, getWeatherForArea, getWeatherForAllAreas }
