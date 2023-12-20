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
  var gchartMeasure;
  var total;

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
    try {
      var LatLng = stringCoor.replace('[', '').replace(']', '').split(',')
      var Lat = parseFloat(LatLng[0]);
      var Lng = parseFloat(LatLng[1]);
      return [Lng, Lat]
    }
    catch (e) {
      console.log("not a coordinate");
    }
  }

  // function to convert array to geojson format
  function j2gConvert(jsonObject) {
    const geoJSONPointArr = jsonObject.map((row) => {
      sum = jsonObject[jsonObject.length - 1].sum;
      return {
        type: 'Feature',
        geometry: {
          type: row.Geometry_Type,
          coordinates: removeString(row.Geometry_coordinates)
        },
        properties: {
          beaconId: row.beaconID,
          aisle_name: row.beaconName,
          total: row.length - 1,
         // order_value: row.gchartMeasure,
          measure: std(row[gchartMeasure], total),  
        },
        id: parseFloat(row.beaconID),
      };
    });

    return geoJSONPointArr;
  }

  function std(x,z) {
    console.log(total);
    var y = parseFloat(x) / sum * z;
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
          zoom: gzoom,
          center: gcenter,
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
        templates = {
          title: 'Beacon Detail',
          content: 'Aisle assigned to:{aisle_name}',
        };

        // information on how to display the beacons(point format)
        renderer = {
          type: "heatmap",
          // field: "measure",
          colorStops: [
            { color: "rgba(63, 40, 102, 0)", ratio: 0 },
              { color: "#472b77", ratio: 0.083 },
              { color: "#4e2d87", ratio: 0.166 },
              { color: "#563098", ratio: 0.249 },
              { color: "#5d32a8", ratio: 0.332 },
              { color: "#6735be", ratio: 0.415 },
              { color: "#7139d4", ratio: 0.498 },
              { color: "#7b3ce9", ratio: 0.581 },
              { color: "#853fff", ratio: 0.664 },
              { color: "#a46fbf", ratio: 0.747 },
              { color: "#c29f80", ratio: 0.83 },
              { color: "#e0cf40", ratio: 0.913 },
              { color: "#ffff00", ratio: 1 }
          ],
          maxDensity: 0.1,
          minDensity: 0,
          radius: 10
        };
      });
  }
  function generateColorBasedOnRatio(ratio) {
    // Ensure ratio is within valid range (0 to 1)
    ratio = Math.min(1, Math.max(0, ratio));

    // Base color: gcolor
    const baseColor = JSON.parse(gBeaconColor);

    // Calculate variations
    const variations = baseColor.map(channel => Math.round(channel * (1 - ratio)));

    // Convert RGB values to hex
    const hexColor = rgbToHex(variations[0], variations[1], variations[2]);
    console.log(hexColor);
    return hexColor;
  }

  // Function to convert RGB to hex
  function rgbToHex(r, g, b) {
    const toHex = channel => {
      const hex = channel.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(r) + toHex(g) + toHex(b);
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
      if ('chartMeasure' in oChangedProperties) {
        gchartMeasure = oChangedProperties['chartMeasure'];
      }
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
