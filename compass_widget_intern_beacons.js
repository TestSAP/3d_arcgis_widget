(function () {
    let template = document.createElement("template");
    var gLayerURL;
    var gdegrees;
    var gcenter;
    var gzoom;
    var locationData; // holds up each beacons data
    var geojsonlayer;
    var url;
    var blob;
    var map;
    var templates;
    var renderer;
    var iniValue = 0;
    var pointArrFeatureCollection;
    var gPortalID;
    var gBeaconColor;
    var gBOColor;
    var gBstartSize;
    var gBStopSize;
    var mapValue = 0;
    var sum = 0;
  
    template.innerHTML = `
      <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      <title>Compass widget | Sample | ArcGIS Maps SDK for JavaScript 4.27</title>
  
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
  
      <link rel="stylesheet" href="https://js.arcgis.com/4.27/esri/themes/light/main.css" />
      <script src="https://js.arcgis.com/4.27/"></script>
  
  
    </head>
    <body>
      <div id="viewDiv"></div>
    </body>
  
      `;
  
    // Convert string coordinate from geojson file to array of cooor
    function removeString(stringCoor) {
      try
      {
       var LatLng = stringCoor.replace('[', '').replace(']', '').split(',')
       var Lat = parseFloat(LatLng[0]);
       var Lng = parseFloat(LatLng[1]);
       return [Lng, Lat]
      }
      catch(e){
       console.log("not a coordinate");
      }
     }
  
    // function to convert array to geojson format
    function j2gConvert(jsonObject) {
      const geoJSONPointArr = jsonObject.map((row) => {
        sum = jsonObject[jsonObject.length - 1].sum;
        let geometryType = "Point";
        if (!['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometryType)) {
          console.log(`Invalid geometryType: ${geometryType} for beaconId: ${row.beaconID}`);
          geometryType = 'Point'; // set a default value or suitable fallback
        }

        return {
          type: "Point",
          geometry: {
            type: row.Geometry_Type,
            coordinates: removeString(row.Geometry_coordinates)
          },
          properties: {
            beaconId: row.beaconID,
            aisle_name: row.beaconName,
            units_sold: row.Units_Sold,
            order_value: std(row.Order_Value_2),
          },
          id: parseFloat(row.beaconID),
        };
      });
  
      return geoJSONPointArr;
    }
    function std(x){
  
      var y = parseFloat(x)/sum*10;
      console.log(sum);
      console.log(parseFloat(y));
      return parseFloat(y);
  
    }
    function mainMap() {
      require(["esri/Map", "esri/views/MapView", "esri/widgets/Compass", "esri/layers/FeatureLayer"],
        (Map, MapView, Compass, FeatureLayer) => {
  
          mapValue = 1;
  
          map = new Map({
            basemap: "streets-vector"
          });
  
          gLayerURL.forEach(i => {
            const featureLayer = new FeatureLayer({
              url: i
            });
            map.add(featureLayer);
          });
  
          const view = new MapView({
            container: "viewDiv",
            scale: 500000,
            map: map,
            zoom: 2,
            center: [-138, 30],
          });
  
          /********************************
           * Create a compass widget object.
           *********************************/
  
          const compassWidget = new Compass({
            view: view
          });
  
          // Add the Compass widget to the top left corner of the view
          view.ui.add(compassWidget, "top-left");
          view.rotation = gdegrees;
  
          // template to display additional details for the beacon when selected
          /*templates = {
            title: 'Beacon Detail',
            content: 'Beacon ID:{beaconId} \n Aisle assigned to:{aisle_name}',
          };*/
  
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
            }, ],
          };

          // template to display additional details for the beacon when selected
          const template = {
            title: "Beacon Detail",
            content: "Beacon ID:{beaconId} \n Aisle assigned to:{aisle_name}"
          };

          const layer = new CSVLayer({
            url: url,
            popupTemplate: template,
            renderer: renderer,
            labelsVisible: true,
            labelingInfo: [
              {
                symbol: {
                  type: "text", // autocasts as new TextSymbol()
                  color: "white",
                  font: {
                    family: "Noto Sans",
                    size: 8
                  },
                  haloColor: "#472b77",
                  haloSize: 0.75
                },
                labelPlacement: "center-center",
              }
            ]
          });
        });
    }
  
    // function inside class to create geojson beacons
    function processbeacons() {
      require(
        [
          'esri/layers/GeoJSONLayer',
        ],
        (GeoJSONLayer) => {
          console.log(locationData)
          pointArrFeatureCollection = {};
          pointArrFeatureCollection = {
            type: 'FeatureCollection',
            features: j2gConvert(locationData),
            bbox: [
              -179.9997, -61.6995, 179.9142, 82.9995 //2D bounding box
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
          map.add(geojsonlayer);
          iniValue = 1;
          console.log("layer loaded");
          console.log(pointArrFeatureCollection);
        });
    } // end of function bracket
  
    class Map extends HTMLElement {
      constructor() {
        super();
  
        this.appendChild(template.content.cloneNode(true));
        this._props = {};
  
      } //end of constructor
  
      getSelection() {
        return this._currentSelection;
      }
  
      onCustomWidgetBeforeUpdate(oChangedProperties) {
        locationData = oChangedProperties['chartData'];
        if (locationData && !(gLayerURL == null) && mapValue == 0)
          mainMap();
      }
  
      onCustomWidgetAfterUpdate(oChangedProperties) {
  
        if ('layerURL' in oChangedProperties) {
          gLayerURL = oChangedProperties['layerURL'].split(',').map(item => item.trim());
        }
        if ('degrees' in oChangedProperties) {
          gdegrees = oChangedProperties['degrees'];
        }
        if ('center' in oChangedProperties) {
          gcenter = JSON.parse(oChangedProperties['center']);
        }
        if ('zoom' in oChangedProperties) {
          gzoom = oChangedProperties['zoom'];
        }
        if ('BColor' in oChangedProperties) {
          gBeaconColor = oChangedProperties['BColor'];
        }
  
        if ('BOColor' in oChangedProperties) {
          gBOColor = oChangedProperties['BOColor'];
        }
  
        if ('StartSize' in oChangedProperties) {
          gBstartSize = oChangedProperties['StartSize'];
        }
        if ('StopSize' in oChangedProperties) {
          gBStopSize = oChangedProperties['StopSize'];
        }
        if (!(gLayerURL == null || gBeaconColor == null || gBOColor == null || gBstartSize == null || gBStopSize == null)) {
          if ('chartData' in oChangedProperties) {
            locationData = oChangedProperties['chartData'];
          }
          if (locationData) {
            if (iniValue == 1) { // remove previous geojsonlayer from webscene
              map.remove(geojsonlayer);
            }
            processbeacons();
          }
        }
      }
  
    } //end of class
  
    let scriptSrc = "https://js.arcgis.com/4.18/"
    let onScriptLoaded = function () {
      customElements.define("com-sap-custom-geomap", Map);
    }
  
    //SHARED FUNCTION: reuse between widgets
    //function(src, callback) {
    let customElementScripts = window.sessionStorage.getItem("customElementScripts") || [];
    let scriptStatus = customElementScripts.find(function (element) {
      return element.src == scriptSrc;
    });
  
    if (scriptStatus) {
      if (scriptStatus.status == "ready") {
        onScriptLoaded();
      } else {
        scriptStatus.callbacks.push(onScriptLoaded);
      }
    } else {
      let scriptObject = {
        "src": scriptSrc,
        "status": "loading",
        "callbacks": [onScriptLoaded]
      }
      customElementScripts.push(scriptObject);
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = scriptSrc;
      script.onload = function () {
        scriptObject.status = "ready";
        scriptObject.callbacks.forEach((callbackFn) => callbackFn.call());
      };
      document.head.appendChild(script);
    }
  
    //END SHARED FUNCTION
  })();
  
