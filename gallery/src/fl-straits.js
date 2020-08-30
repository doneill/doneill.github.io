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
      }),
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          attributions: [
            'NOAA © <a href="https://nauticalcharts.noaa.gov/data/gis-data-and-services.html">RNC Tileset</a>',
            ol.control.ATTRIBUTION ],
          url: 'http://tileservice.charts.noaa.gov/tiles/11013_1/{z}/{x}/{y}.png',
        }),
      })
      ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-80.862921, 24.798830]),
      zoom: 8
    })
  });

  var zoomslider = new ol.control.ZoomSlider();
  map.addControl(zoomslider);