/* eslint-disable */
import subscribeToMapClicks from '/js/mapclicks.js'
import showAllAreas from '/js/allareas.js'
import myLocation from '/js/mylocation.js'

;(() => {
  const jakartaCoordinates = [-6.21462, 106.84513]
  const defaultZoomLevel = 12
  const mapElId = 'mapid'

  // New Map - Center to Jakarta
  const map = L.map(mapElId).setView(jakartaCoordinates, defaultZoomLevel)

  // Leaflet Init
  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Data diambil dari <a href="http://data.bmkg.go.id/" target="_blank">BMKG</a>. Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a><br />A work by <a href="https://twitter.com/tista" target="_blank">tista</a> - <a href="https://github.com/tistaharahap/cuaca" target="_blank">Contribute in Github</a>',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoidGlzdGFoYXJhaGFwIiwiYSI6ImNrNm55ZmcybjBncjMzcnBnNThxZ3lkYnoifQ.HjvHI88s8unEqHJ0pVMQPw'
    }
  ).addTo(map)

  // Features
  subscribeToMapClicks(map)
  showAllAreas(map)
  myLocation(map)
})()
