mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
geojsonLink = '<a href="https://www.doh.wa.gov/Emergencies/Coronavirus">Washington State Dept of Health</a>';

var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxzoom: 18
});

function setStateColor(d) {
    return d > 2000 ? '#bd0026' :
      d > 750 ? '#f03b20' :
      d > 500 ? '#fd8d3c' :
      d > 200 ? '#feb24c' :
      d > 50 ? '#fed976' :
      '#ffffb2';
  }

function stateStyle(feature) {
    console.log(feature.properties.COVID_CONFIRMED);
    return {
      fillColor: setStateColor(feature.properties.COVID_CONFIRMED),
      "weight": 1,
      fillOpacity: 0.35,
      "opacity": 0.35
    };
  }

$.getJSON("./data/counties-wa.geojson", function(data) {
    var geojson = L.geoJson(data, {
        style: stateStyle,
      onEachFeature: function (feature, layer) {
        layer.bindPopup('<b>Name: </b>'+feature.properties.NAME+'<br><b>Total Cases: </b>'+feature.properties.COVID_CONFIRMED+'<br><b>Total Deaths: </b>'+feature.properties.COVID_DEATHS);
      }
    });

    geojson.getAttribution = function() { return geojsonLink; };

    var map = L.map('mapid').fitBounds(geojson.getBounds());
    tiles.addTo(map);
    geojson.addTo(map);
});
