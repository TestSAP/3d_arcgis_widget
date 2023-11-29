
(function () {
  let template = document.createElement('template');
  var locationData; // holds up each beacons data
  var webscene;
  var geojsonlayer;
  var viewLayer;
  var url;
  var blob;
  var templates;
  var renderer;
  var legend;
  var iniValue = 0;
  var pointArrFeatureCollection;
  var gPortalID;
  var gBeaconColor;
  var gBOColor;
  var gBstartSize;
  var gBStopSize;
  var glegendOption = "off";
  var glayerOption = "off";
  var mapValue = 0;



  template.innerHTML = `
        <link rel="stylesheet" href="https://js.arcgis.com/4.23/esri/themes/light/main.css" />
    <script src="https://js.arcgis.com/4.23/"></script>
    <style>
    html,
    body,
    #viewDiv {
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
    }
  </style>
     <body>
  <div id="viewDiv"></div>
</body>
</html>
    `;


  //  fetch(https://ey-global-services-25.eu10.hcs.cloud.sap/sap/fpa/ui/app.html#/analyticapp&/aa/BA45D0589FB29287ABF8A582C05D41D/?mode=edit)



  // Convert string coordinate from geojson file to array of cooor
  function removeString(stringCoor) {
    var LatLng = stringCoor.replace('[', '').replace(']', '').split(',')
    var Lat = parseFloat(LatLng[0]);
    var Lng = parseFloat(LatLng[1]);
    return [Lng, Lat]
  }

  // function to convert array to geojson format
  function j2gConvert(jsonObject) {
    const geoJSONPointArr = jsonObject.map((row) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: removeString(row.Geometry_coordinates)
        },
        properties: {
          beaconId: row.Properties_name_1,
          aisle_name: row.Properties_Add_details,
        },
        id: parseFloat(row.Properties_name_1),
      };
    });

    return geoJSONPointArr;
  }

  function mainMap() {
    require(
      [
        'esri/config',
        'esri/Map',
        'esri/views/SceneView',
        'esri/WebScene',
        'esri/Basemap',
        'esri/layers/FeatureLayer',
        'esri/widgets/LayerList',
        'esri/request',
        'dojo/domReady!',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'esri/widgets/Legend',
        'esri/layers/GeoJSONLayer',
        'esri/tasks/RouteTask',
        'esri/tasks/support/RouteParameters',
        'esri/tasks/support/FeatureSet',
      ],
      (esriConfig, Map, SceneView, WebScene, Basemap, TileLayer, FeatureLayer,
        LayerList, request, GraphicsLayer, Graphic, Legend, GeoJSONLayer,
        RouteTask, RouteParameters, FeatureSet) => {

        mapValue = 1;

        // create the main map of type webscene
        webscene = new WebScene({
          portalItem: {
            id: gPortalID,
          },
        });


        // add the WebScene to the SceneView layer(Layer displayed)
        viewLayer = new SceneView({
          container: 'viewDiv',
          map: webscene,
        });

        if (glegendOption == "on") {
          // display a key on the screen containing all shapes in map
          legend = new Legend({
            view: viewLayer,
          });

          // add the key to the main screen
          viewLayer.ui.add(legend, 'top-right');

        }


        // template to display additional details for the beacon when selected
        templates = {
          title: 'Beacon Detail',
          content: 'Beacon ID:{beaconId} \n Aisle assigned to:{aisle_name}',
        };

        // information on how to display the beacons(point format)
        renderer = {
          type: 'simple',
          field: 'name',
          symbol: {
            type: 'simple-marker',
            color: gBeaconColor,
            outline: {
              color: gBOColor,
            },
          },
          visualVariables: [{
            type: 'size',
            field: 'name',
            stops: [{
              value: 4,
              size: gBstartSize,
            },
            {
              value: 8,
              size: gBStopSize,
            },
            ],
          },],
        };

      });

  }

  // function inside class to create geojson beacons
  function processbeacons() {
    require(
      [
        'esri/config',
        'esri/Map',
        'esri/views/SceneView',
        'esri/WebScene',
        'esri/Basemap',
        'esri/layers/FeatureLayer',
        'esri/widgets/LayerList',
        'esri/request',
        'dojo/domReady!',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'esri/widgets/Legend',
        'esri/layers/GeoJSONLayer',
        'esri/tasks/RouteTask',
        'esri/tasks/support/RouteParameters',
        'esri/tasks/support/FeatureSet',
      ],
      (esriConfig, Map, SceneView, WebScene, Basemap, TileLayer, FeatureLayer,
        LayerList, request, GraphicsLayer, Graphic, Legend, GeoJSONLayer,
        RouteTask, RouteParameters, FeatureSet) => {

        pointArrFeatureCollection = {};
        pointArrFeatureCollection = {
          type: 'FeatureCollection',
          features: j2gConvert(locationData),
          bbox: [
            -179.9997, -61.6995, -3.5699999332428, 179.9142, 82.9995, 629.17
          ],
        };

        // create a new blob from geojson featurecollection
        blob = new Blob([JSON.stringify(pointArrFeatureCollection)], {
          type: 'application/json',
        });

        // URL reference to the blob
        url = URL.createObjectURL(blob);

        // create a layer to hold the beacon coordinates
        geojsonlayer = new GeoJSONLayer({
          url,
          popupTemplate: templates,
          renderer: renderer
        });

        if (glayerOption == "on") {
          // add the beacons to the webscene
          webscene.add(geojsonlayer);
          iniValue = 1;

        }

      });
  } // end of function bracket

  class Map extends HTMLElement {
    constructor() {
      super();
      // this._shadowRoot = this.attachShadow({mode: "open"});
      this.appendChild(template.content.cloneNode(true));
      this._props = {};
      let that = this;
      getSelection()
      {
        return this._currentSelection;
      }


      require(
        [
          'esri/Map', 'esri/views/SceneView', 'esri/WebScene', 'esri/Basemap',
          'esri/layers/FeatureLayer', 'esri/widgets/LayerList', 'esri/request',
          'dojo/domReady!', 'esri/layers/GraphicsLayer', 'esri/Graphic',
          'esri/widgets/Legend', 'esri/layers/GeoJSONLayer'
        ],
        (Map, SceneView, WebScene, Basemap, TileLayer, FeatureLayer, LayerList,
          request, GraphicsLayer, Graphic, Legend, GeoJSONLayer) => {


        });
    } // end of constructor()

    getSelection() {
      return this._currentSelection;
    }

    fetchDataFromChart() {
      // Use the SAP Analytics Cloud API to fetch data from a chart
      // Fetch data from a chart and assign it to locationData
      locationData = fetchDataFromSACChart();
    }

    // function executed on initialisation
    // function executed 2 times. first returns default value of variable &
    // initialisation variables data
    onCustomWidgetBeforeUpdate(oChangedProperties) {
      this.$chartData = oChangedProperties['chartData'];
      locationData = this.$chartData;
      if (locationData && !(gPortalID == null) && mapValue == 0)
        mainMap();
    }

    onCustomWidgetBeforeUpdate(oChangedProperties) {
      // Fetch data from the chart before updating
      this.fetchDataFromChart();
    }

    ////function executed on variable updates
    onCustomWidgetAfterUpdate(oChangedProperties) {
      if ('legendOption' in oChangedProperties) {
        this.$legendOption = oChangedProperties['legendOption'];
      }
      glegendOption = this.$legendOption;
      if ('layerOption' in oChangedProperties) {
        this.$layerOption = oChangedProperties['layerOption'];
      }
      glayerOption = this.$layerOption;
      if ('portalId' in oChangedProperties) {
        this.$portalId = oChangedProperties['portalId'];
      }
      gPortalID = this.$portalId;
      if ('BColor' in oChangedProperties) {
        this.$BColor = oChangedProperties['BColor'];
      }
      gBeaconColor = this.$BColor;
      if ('BOColor' in oChangedProperties) {
        this.$BOColor = oChangedProperties['BOColor'];
      }
      gBOColor = this.$BOColor;
      if ('StartSize' in oChangedProperties) {
        this.$StartSize = oChangedProperties['StartSize'];
      }
      gBstartSize = this.$StartSize;
      if ('StopSize' in oChangedProperties) {
        this.$StopSize = oChangedProperties['StopSize'];
      }
      gBStopSize = this.$StopSize;

      if (!(gPortalID == null || gBeaconColor == null || gBOColor == null || gBstartSize == null || gBStopSize == null)) {
        if ('chartData' in oChangedProperties) {
          this.$chartData = oChangedProperties['chartData'];
          locationData = this.$chartData; // place passed in value into global
        }
        if (locationData) {
          if (iniValue == 1) { // remove previous geojsonlayer from webscene
            webscene.remove(geojsonlayer);
          }
          processbeacons();
        }
      }
    }


  } // end of class
  let scriptSrc = 'https://js.arcgis.com/4.18/'
  console.log("script loaded");
  let onScriptLoaded =
    function () {
      customElements.define('com-sap-custom-jumbo-beacon-interface', Map);
    }

  // SHARED FUNCTION: reuse between widgets
  // function(src, callback) {
  let customElementScripts =
    window.sessionStorage.getItem('customElementScripts') || [];
  let scriptStatus = customElementScripts.find(function (element) {
    return element.src == scriptSrc;
  });

  if (scriptStatus) {
    if (scriptStatus.status == 'ready') {
      onScriptLoaded();
    } else {
      scriptStatus.callbacks.push(onScriptLoaded);
    }
  } else {
    let scriptObject = {
      'src': scriptSrc,
      'status': 'loading',
      'callbacks': [onScriptLoaded]
    }
    customElementScripts.push(scriptObject);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptSrc;
    script.onload = function () {
      scriptObject.status = 'ready';
      scriptObject.callbacks.forEach((callbackFn) => callbackFn.call());
    };
    document.head.appendChild(script);
  }

  // END SHARED FUNCTION
})(); // end of class
