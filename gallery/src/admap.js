require([
    "esri/config",
    "esri/request",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/BaseTileLayer",
    "esri/layers/GroupLayer",
    "esri/widgets/LayerList",
    "esri/widgets/Locate",
    "dojo/domReady!"
  ], function(
      esriConfig, esriRequest, Map, MapView, BaseTileLayer, GroupLayer, LayerList, Locate
  ) {

      var CustomLayer = BaseTileLayer.createSubclass({
          properties: {
              urlTemplate: null,
          },

          // generate the tile url for a given level, row and column
          getTileUrl: function(level, row, col) {
              return this.urlTemplate.replace("{z}", level).replace("{x}", col).replace("{y}", row);
          },

          // This method fetches tiles for the specified level and size.
          // Override this method to process the data returned from the server.
          fetchTile: function(level, row, col) {

              // call getTileUrl() method to construct the URL to tiles
              // for a given level, row and col provided by the LayerView
              var url = this.getTileUrl(level, row, col);

              // request for tiles based on the generated url
              // set allowImageDataAccess to true to allow
              // cross-domain access to create WebGL textures for 3D.
              return esriRequest(url, {
                  responseType: "image",
                  allowImageDataAccess: true
              })
              .then(function(response) {
                  // when esri request resolves successfully
                  // get the image from the response
                  var image = response.data;
                  var width = this.tileInfo.size[0];
                  var height = this.tileInfo.size[0];

                  // create a canvas with 2D rendering context
                  var canvas = document.createElement("canvas");
                  var context = canvas.getContext("2d");
                  canvas.width = width;
                  canvas.height = height;

                  // Draw the blended image onto the canvas.
                  context.drawImage(image, 0, 0, width, height);

                  return canvas;
              }.bind(this));
          }
      });

    // Add url to the list of servers known to support CORS specification.
    esriConfig.request.corsEnabledServers.push("https://tile.thunderforest.com/");

    // Create a new instance of the CustomLayer and set its properties
    var cycleTileLayer = new CustomLayer({
      urlTemplate: "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=" + APIKEY,
      title: "Open Cycle Map"
    });

    // Create a new instance of the CustomLayer and set its properties
    var outdoorsTileLayer = new CustomLayer({
      urlTemplate: "https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=" + APIKEY,
      title: "Outdoors Map"
    });

    // Create GroupLayer with the two layers created above
    // as children layers.
    var outdoorGroupLayer = new GroupLayer({
      title: "Adventure",
      visible: true,
      visibilityMode: "exclusive",
      layers: [cycleTileLayer, outdoorsTileLayer],
      opacity: 1
    });

    // add the new instance of the custom tile layer the map
    var map = new Map({
      basemap: "gray",
      layers : [outdoorGroupLayer]
    });

    // Make map view and bind it to the map
    var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-121.774531, 47.480653],
      zoom: 13,
    });

    var locateBtn = new Locate({
      view: view
    });

    // Creates actions in the LayerList.
    function defineActions(event) {

      var item = event.item;

      if (item.title === "Adventure") {

          item.actionsSections = [
              [{
                  title: "Increase opacity",
                  className: "esri-icon-up",
                  id: "increase-opacity"
              }, {
                  title: "Decrease opacity",
                  className: "esri-icon-down",
                  id: "decrease-opacity"
              }]
          ];
      }
  }

      view.when(function() {
          // Create the LayerList widget with the associated actions
          // and add it to the top-right corner of the view.
          var layerList = new LayerList({
              view: view,
              // executes for each ListItem in the LayerList
              listItemCreatedFunction: defineActions
          });

          // Event listener that fires each time an action is triggered
          layerList.on("trigger-action", function(event) {
              // The layer visible in the view at the time of the trigger.
              var visibleLayer = cycleTileLayer.visible ? cycleTileLayer : outdoorsTileLayer;
              // Capture the action id.
              var id = event.action.id;

              if (id === "increase-opacity") {
                  // if the increase-opacity action is triggered, then
                  // increase the opacity of the GroupLayer by 0.25
                  if (outdoorGroupLayer.opacity < 1) {
                  outdoorGroupLayer.opacity += 0.25;
                  }
              } else if (id === "decrease-opacity") {
                  // if the decrease-opacity action is triggered, then
                  // decrease the opacity of the GroupLayer by 0.25
                  if (outdoorGroupLayer.opacity > 0) {
                  outdoorGroupLayer.opacity -= 0.25;
                  }
              }
          });

          // Add widget to the top right corner of the view
          view.ui.add(layerList, "top-right");
      });

    // Add the locate widget to the top left corner of the view
    view.ui.add(locateBtn, {
      position: "top-left"
    });
      
  });