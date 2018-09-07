require(["esri/map",
"esri/layers/VectorTileLayer",
"./src/geojsonlayer.js",
"dojo/domReady!"], 
function(Map, VectorTileLayer, GeoJsonLayer) {

var map = new Map("map", {
  center: [-122.337427, 47.611059], // longitude, latitude
  zoom: 12
});

// newspaper basemap later
var vtlayer = new VectorTileLayer("https://www.arcgis.com/sharing/rest/content/items/dfb04de5f3144a80bc3f9f336228d24a/resources/styles/root.json");
map.addLayer(vtlayer);

map.on("load", function () {
      addGeoJsonLayer("./data/seattle-neighborhoods.json");
  });

// Add the layer
function addGeoJsonLayer(url) {
    // Create the layer
    var geoJsonLayer = new GeoJsonLayer({
        url: url
    });
    // Zoom to layer
    geoJsonLayer.on("update-end", function (e) {
        map.setExtent(e.target.extent.expand(1.2));
    });
    // Add to map
    map.addLayer(geoJsonLayer);
}

});