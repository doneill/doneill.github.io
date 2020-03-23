var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=”http://osm.org/copyright”>OpenStreetMap</a> contributors',
    maxzoom: 18
});

function setStateColor(d) {
    return d > 5000 ? '#bd0026' :
      d > 1000 ? '#f03b20' :
      d > 500 ? '#fd8d3c' :
      d > 100 ? '#feb24c' :
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

$.getJSON("./data/states.geojson", function(data) {
    var geojson = L.geoJson(data, {
        style: stateStyle,
      onEachFeature: function (feature, layer) {
        layer.bindPopup('<b>Name: </b>'+feature.properties.NAME+'<br><b>Total Cases: </b>'+feature.properties.COVID_CONFIRMED+'<br><b>New Cases: </b>'+feature.properties.COVID_NEW+'<br><b>Total Deaths: </b>'+feature.properties.COVID_DEATHS);
      }
    });

    var map = L.map('mapid').setView([39.828329, -98.579453], 4);
    tiles.addTo(map);
    geojson.addTo(map);
});
