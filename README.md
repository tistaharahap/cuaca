# Cuaca

Aims to be a simple API for weather prediction in Indonesia. Data taken from [Badan Meteorologi Klimatologi dan Geofisika](https://www.bmkg.go.id/) publicly available XML datasets [here](http://data.bmkg.go.id/).

## JSON Datasets

Converted and cleaned up JSON datasets is available as a standalone HTTP server. As with BMKG's original data, the datasets are predictions for the next 3 days.

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
