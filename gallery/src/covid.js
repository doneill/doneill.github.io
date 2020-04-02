mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
geojsonLink = '<a href="https://www.worldometers.info/coronavirus/country/us/">worldometer</a>';

var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxzoom: 18
});

function getColor(d) {
  return d > 50000 ? '#800026' :
      d > 10000  ? '#BD0026' :
      d > 7500  ? '#E31A1C' :
      d > 5000  ? '#FC4E2A' :
      d > 2500   ? '#FD8D3C' :
      d > 1000   ? '#FEB24C' :
      d > 500   ? '#FED976' :
            '#FFEDA0';
}

function stateStyle(feature) {
    return {
      weight: 1,
      fillOpacity: 0.7,
      opacity: 0.45,
      fillColor: getColor(feature.properties.COVID_CONFIRMED)
    };
  }

$.getJSON("./data/states.geojson", function(data) {
    var geojson = L.geoJson(data, {
        style: stateStyle,
      onEachFeature: function (feature, layer) {
        layer.bindTooltip('<b>Name: </b>'+feature.properties.NAME+'<br><b>Total Cases: </b>'+feature.properties.COVID_CONFIRMED+'<br><b>New Cases: </b>'+feature.properties.COVID_NEW+'<br><b>Total Deaths: </b>'+feature.properties.COVID_DEATHS);
      }
    });

    geojson.getAttribution = function() { return geojsonLink; };

    var map = L.map('mapid').setView([37.8, -96], 4);
    tiles.addTo(map);
    geojson.addTo(map);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 500, 1000, 2500, 5000, 7500, 10000, 50000],
        labels = [],
        from, to;

      for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
          '<i style="background:' + getColor(from + 1) + '"></i> ' +
          from + (to ? '&ndash;' + to : '+'));
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(map);
});