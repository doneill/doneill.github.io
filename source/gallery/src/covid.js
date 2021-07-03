mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
geojsonLink = '<a href="https://www.worldometers.info/coronavirus/country/us/">worldometer</a>'

const tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; ' + mapLink + ' Contributors',
  minZoom: 3,
  maxZoom: 6
})

function getColor (d) {
  return d > 3000000 ? '#800026'
    : d > 2000000 ? '#BD0026'
      : d > 1000000 ? '#E31A1C'
        : d > 750000 ? '#FC4E2A'
          : d > 500000 ? '#FD8D3C'
            : d > 150000 ? '#FEB24C'
              : d > 75000 ? '#FED976'
                : '#FFEDA0'
}

function stateStyle (feature) {
  return {
    weight: 1,
    fillOpacity: 0.7,
    opacity: 0.45,
    fillColor: getColor(feature.properties.COVID_CONFIRMED)
  }
}

$.getJSON('./data/states.geojson', function (data) {
  const geojson = L.geoJson(data, {
    style: stateStyle,
    onEachFeature: function (feature, layer) {
      layer.on({
        // mouseover: highlightFeature,
        click: highlightFeature
      })
    }
  })

  geojson.getAttribution = function () { return geojsonLink }

  const map = L.map('mapid').setView([37.8, -96], 4)
  tiles.addTo(map)
  geojson.addTo(map)

  function zoomToFeature (e) {
    map.fitBounds(e.target.getBounds())
  }

  function highlightFeature (e) {
    const layer = e.target
    info.update(layer.feature.properties)
  }

  // control that shows state info on hover
  var info = L.control()

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info')
    this.update()
    return this._div
  }

  info.update = function (props) {
    this._div.innerHTML = (props
      ? '<center><h4>' + props.NAME + '</h4></center><br><b>Total Cases: </b>' + props.COVID_CONFIRMED + '<br><b>New Cases: </b>' + props.COVID_NEW + '<br><b>Total Deaths: </b>' + props.COVID_DEATHS
      : 'Click/Tap on a state')
  }

  info.addTo(map)

  const legend = L.control({ position: 'bottomright' })

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend')
    const grades = [0, 75000, 150000, 500000, 750000, 1000000, 2000000, 3000000]
    const labels = []
    let from; let to

    for (let i = 0; i < grades.length; i++) {
      from = grades[i]
      to = grades[i + 1]

      labels.push(
        '<i style="background:' + getColor(from + 1) + '"></i> ' +
          from + (to ? '&ndash;' + to : '+'))
    }

    div.innerHTML = labels.join('<br>')
    return div
  }

  legend.addTo(map)
})
