mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
geojsonLink = '<a href="https://github.com/CSSEGISandData/COVID-19">JHU CSSE</a>';

var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxzoom: 18
});

  function getColor(d) {
    return d > 2000 ? '#800026' :
        d > 1000  ? '#BD0026' :
        d > 750  ? '#E31A1C' :
        d > 500  ? '#FC4E2A' :
        d > 250   ? '#FD8D3C' :
        d > 100   ? '#FEB24C' :
        d > 50   ? '#FED976' :
              '#FFEDA0';
  }

function stateStyle(feature) {
    return {
      fillColor: getColor(feature.properties.COVID_CONFIRMED),
      "weight": 1,
      fillOpacity: 0.7,
      "opacity": 0.80
    };
  }


$.getJSON("./data/counties-wa.geojson", function(data) {
    var geojson = L.geoJson(data, {
      style: stateStyle,
      onEachFeature: function (feature, layer) {
        layer.on({
          // mouseover: highlightFeature,
          click: highlightFeature
        });
      }
    });

  geojson.getAttribution = function() { return geojsonLink; };

  var map = L.map('mapid').fitBounds(geojson.getBounds());
  tiles.addTo(map);
  geojson.addTo(map);

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function highlightFeature(e) {
    var layer = e.target;
    info.update(layer.feature.properties);
  }

  // control that shows state info on hover
  var info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = (props ?
      '<center><h4>'+props.NAME+'</h4></center><br><b>Total Cases: </b>' + props.COVID_CONFIRMED + '<br><b>Total Deaths: </b>' + props.COVID_DEATHS
      : 'Click/Tap on a county');
  };

  info.addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 50, 100, 250, 500, 750, 1000, 2000],
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
