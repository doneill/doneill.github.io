mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
geojsonLink = '<a href="https://github.com/CSSEGISandData/COVID-19">JHU CSSE</a>'

const tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; ' + mapLink + ' Contributors',
  minZoom: 6,
  maxZoom: 8
})

function getColor (d) {
  return d > 10000 ? '#800026'
    : d > 5000 ? '#BD0026'
      : d > 2000 ? '#E31A1C'
        : d > 1000 ? '#FC4E2A'
          : d > 500 ? '#FD8D3C'
            : d > 100 ? '#FEB24C'
              : d > 0 ? '#FED976'
                : '#33000000'
}

function stateStyle (feature) {
  return {
    fillColor: getColor(feature.properties.COVID_CONFIRMED),
    weight: 1,
    fillOpacity: 0.7,
    opacity: 0.80
  }
}

$.getJSON('./data/counties-wa.geojson', function (data) {
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

  const map = L.map('mapid').fitBounds(geojson.getBounds())
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
      ? '<center><h4>' + props.NAME + '</h4></center><b>' + props.UPDATED + '</b><br><h5>Total Cases: ' + props.COVID_CONFIRMED + '</h5><br><h5>Total Deaths: ' + props.COVID_DEATHS + '</h5>'
      : 'Click/Tap on a county')
  }

  info.addTo(map)

  const legend = L.control({ position: 'bottomright' })

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend')
    const grades = [0, 0, 100, 500, 1000, 2000, 5000, 10000]
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
