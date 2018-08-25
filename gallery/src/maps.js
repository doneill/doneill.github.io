require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/CoordinateConversion",
    "esri/widgets/Locate",
    "esri/widgets/Track",
    "esri/widgets/Expand",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Search",
    "dojo/domReady!"
  ], function(Map, MapView, CoordinateConversion, Locate, Track, Expand, BasemapGallery, Search) {

    // Create a Map
    var map = new Map({
      basemap: "osm"
    });

    // Make map view and bind it to the map
    var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-122.337427, 47.611059],
      zoom: 12,
    });

      var locateBtn = new Locate({
      view: view
    });

    // Add the locate widget to the top left corner of the view
    view.ui.add(locateBtn, {
      position: "top-left"
    });

          // Create an instance of the Track widget
    // and add it to the view's UI
    var track = new Track({
      view: view
    });
    view.ui.add(track, "top-left");

    // The sample will start tracking your location
    // once the view becomes ready
    view.when(function() {
      track.start();
    });

    var ccWidget = new CoordinateConversion({
      view: view
    });

    view.ui.add(ccWidget, "bottom-left");

    var searchWidget = new Search({
      view: view
    });

    // Add the search widget to the top right corner of the view
      view.ui.add(searchWidget, {
      position: "top-right"
    });

    var basemapGallery = new BasemapGallery({
      view: view,
      container: document.createElement("div")
    });

    // Create an Expand instance and set the content
    // property to the DOM node of the basemap gallery widget
    // Use an Esri icon font to represent the content inside
    // of the Expand widget
    var bgExpand = new Expand({
      view: view,
      content: basemapGallery.container,
      expandIconClass: "esri-icon-basemap"
    });

    // Add the widget to the top-right corner of the view
    view.ui.add(bgExpand, "top-right");

  });