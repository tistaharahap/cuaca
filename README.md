# Cuaca

Aims to be a simple API for weather prediction in Indonesia. Data taken from [Badan Meteorologi Klimatologi dan Geofisika](https://www.bmkg.go.id/) publicly available XML datasets [here](http://data.bmkg.go.id/).

## JSON Datasets

Converted and cleaned up JSON datasets is available as a standalone HTTP server. As with BMKG's original data, the datasets are predictions for the next 3 days. Or after seeding, you can just go to the `weatherdata` folder.

### Running Locally

```shell
$ git clone git@github.com:tistaharahap/cuaca.git
$ cd cuaca
$ npm i
$ npm run weather-repo
```

Open up a browser and go to `http://localhost:5000` to see the data. This will only run the static file hosting, to update the data, do the following.

```shell
$ npm run seeder
```

## Seeding

To seed MongoDB, do the following sequence.

```shell
$ npm run seeder # Will download new feed from BMKG
$ npm run seeds-to-db # Insert the updates into MongoDB
```

Make sure your have a MongoDB instance running and its connection string set properly in the environment.

## Environment Variables

| Name                 | Description               | Default Value     |
|----------------------|---------------------------|-------------------|
| HOST                 | Serving host              | 0.0.0.0           |
| PORT                 | Serving port              | 3000              |
| MONGO_DB_CONN_STRING | MongoDB connection string | Empty             |

## Endpoints

This sections lists all available endpoints.

### Nearby Weather

```
[GET] /v1/nearby

Query Parameters:
* latitude: float
* longitude: float
```
