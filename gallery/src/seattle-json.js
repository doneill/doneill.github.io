mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
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
        layer.bindPopup('<b>Name: </b>'+feature.properties.name+'<br><b>Area: </b>'+feature.properties.area);
      }
    });

    var map = L.map('mapid').fitBounds(geojson.getBounds());
    tiles.addTo(map);
    geojson.addTo(map);
});

