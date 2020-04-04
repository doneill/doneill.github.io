mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    minZoom: 8,
    maxZoom: 18
});

function getColor(d) {
  return d > 300000000 ? '#4682B4' :
      d > 250000000  ? '#6495ED' :
      d > 100000000  ? '#1E90FF' :
      d > 50000000  ? '#B0C4DE' :
      d > 10000000   ? '#00BFFF' :
      d > 7500000   ? '#87CEEB' :
      d > 5000000   ? '#87CEFA' :
            '#ADD8E6';
}

function setStyle(feature) {
  return {
    fillColor: getColor(feature.properties.area),
    "weight": 1,
    fillOpacity: 0.7,
    "opacity": 0.80
  };
}

$.getJSON("./data/seattle-neighborhoods.geojson", function(data) {
    var geojson = L.geoJson(data, {
        style: setStyle,
      onEachFeature: function (feature, layer) {
        layer.bindPopup('<b>Name: </b>'+feature.properties.name+'<br><b>Area: </b>'+feature.properties.area);
      }
    });

    var map = L.map('mapid').fitBounds(geojson.getBounds());
    tiles.addTo(map);
    geojson.addTo(map);
});

