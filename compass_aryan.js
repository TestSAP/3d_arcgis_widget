(function ()
{
    let template = document.createElement("template");
    var gLayerURL;
    var gdegrees;
    var gcenter;
    var gzoom;
    var gLocationData;

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

    function mainMap() {
        require(["esri/Map", "esri/views/MapView", "esri/widgets/Compass", "esri/layers/FeatureLayer", "esri/Graphic"],
        (Map, MapView, Compass, FeatureLayer, Graphic) => {

          const map = new Map({
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


          // Fetch data from SAC Model
          fetchCoordinatesFromModel().then(coordinates => {
            coordinates.forEach(coord => {
                let point = {
                    type: "point",
                    longitude: coord[0],
                    latitude: coord[1]
                };
                let pointGraphic = new Graphic({
                    geometry: point,
                    symbol: {
                        type: "simple-marker",
                        color: "blue"
                    }
                });
                view.graphics.add(pointGraphic);
            });
          });
  
          /********************************
           * Create a compass widget object.
           *********************************/
  
          const compassWidget = new Compass({
            view: view
          });
  
          // Add the Compass widget to the top left corner of the view
          view.ui.add(compassWidget, "top-left");
          view.constraints = {rotationEnabled: false};
          view.rotation = gdegrees;
        });
    }

    // Function to fetch coordinates from the SAC Model
    async function fetchCoordinatesFromModel() {
      // Assuming SAC provides an API to fetch model data
      let response = await fetch("https://ey-global-services-25.eu10.hcs.cloud.sap/sap/fpa/ui/tenants/6ea38#view_id=model;model_id=C25Y56D0YFGKVMXCRIYU6KZEGW");
      let data = await response.json();

      // Extract coordinates
      return data.map(row => {
          return row.Location.split(',').map(Number); // assuming 'Location' is the dimension name
      });
    }


        class Map extends HTMLElement
        {
            constructor() {
                super();

                this.appendChild(template.content.cloneNode(true));
                this._props = {};

            } //end of constructor

            onCustomWidgetBeforeUpdate() {
                mainMap()
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
              mainMap()
            }

        } //end of class

        let scriptSrc = "https://js.arcgis.com/4.18/"
        let onScriptLoaded = function() {
            customElements.define("com-sap-custom-geomap", Map);
        }

        //SHARED FUNCTION: reuse between widgets
        //function(src, callback) {
        let customElementScripts = window.sessionStorage.getItem("customElementScripts") || [];
        let scriptStatus = customElementScripts.find(function(element) {
            return element.src == scriptSrc;
        });

        if (scriptStatus) {
            if(scriptStatus.status == "ready") {
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
            script.onload = function(){
                scriptObject.status = "ready";
                scriptObject.callbacks.forEach((callbackFn) => callbackFn.call());
            };
            document.head.appendChild(script);
        }

//END SHARED FUNCTION
})();