var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=”http://osm.org/copyright”>OpenStreetMap</a> contributors',
    maxzoom: 18
});

var geojsonStyle = {
    "color": "#6E6E6E",
    "weight": 1,
    "opacity": 0.55
};

$.getJSON("./data/seattle-neighborhoods.geojson", function(data) {
    var geojson = L.geoJson(data, {
        style: geojsonStyle,
      onEachFeature: function (feature, layer) {
        layer.bindPopup('name: '+feature.properties.name+'<br>area: '+feature.properties.area);
      }
    });

    var map = L.map('mapid').fitBounds(geojson.getBounds());
    tiles.addTo(map);
    geojson.addTo(map);
});

