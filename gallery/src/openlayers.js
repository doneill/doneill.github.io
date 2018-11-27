
var fullScreenControl = new ol.control.FullScreen();
var scaleLineControl = new ol.control.ScaleLine();

var map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults().extend([
        fullScreenControl, 
        scaleLineControl
    ]),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-122.334859, 47.609741]),
      zoom: 12
    })
  });

  var zoomslider = new ol.control.ZoomSlider();
  map.addControl(zoomslider);