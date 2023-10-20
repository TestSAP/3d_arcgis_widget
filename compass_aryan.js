(function ()
{
    let template = document.createElement("template");
    var gLayerURL;
    var gdegrees;
    var gcenter;
    var gzoom;

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

    function mainMap(gLayerURL, gdegrees, gcenter, gzoom) {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/widgets/Compass", 
            "esri/layers/FeatureLayer",
            "esri/widgets/LayerList", 
            "esri/request", "dojo/domReady!",
            "esri/layers/GraphicsLayer", 
            "esri/Graphic","esri/widgets/Legend",
            "esri/layers/GeoJSONLayer"
        ],
        function (Map, MapView, Compass, FeatureLayer, LayerList, request, GraphicsLayer, Graphic, Legend, GeoJSONLayer) { // Adjusted for 'function' instead of an arrow function

            const map = new Map({
                basemap: "streets-vector"
            });

            const renderer = {
            type: 'simple',
            field: 'name',
            symbol: {
                type: 'simple-marker',
                color: 'orange',
                outline: {color: 'white'}
            },
            visualVariables: [{
                type: 'size',
                field: 'name',
                stops:
                    [{value: 4, size: '8px'}, {value: 8, size: '40px'}]
            }]
          };

           const geojsonLayer = new GeoJSONLayer({
                url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
                copyright: 'Beacons',
                popupTemplate: template
            });

            // Make sure that the layer is correctly instantiated and the promise is resolved.
            geojsonLayer.load().then(function () {
                // The layer is loaded. Now you can add it to the map.
                map.add(geojsonLayer);  // Add layer to the map.
            }).catch(function (error) {
                console.error("[GeoJSONLayer Load Error]: ", error);
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
          view.constraints = {rotationEnabled: false};
          view.rotation = gdegrees;
        });
    }


        class CustomMapElement extends HTMLElement {
    constructor() {
        super(); // It calls the parent class constructor

        // (Recommended) Create a shadow DOM for this web component
        this.attachShadow({ mode: 'open' }); // sets and returns 'this.shadowRoot'

        // Initialize your component state and bind methods here
        this.gLayerURL = [];
        this.gdegrees = 0;
        this.gcenter = [0, 0]; // example coordinates
        this.gzoom = 1; // example zoom level

        // Bind 'this' to the method, so it can be used as a callback
        this.mainMapSetup = this.mainMapSetup.bind(this);
    }

    // Lifecycle method called when the element is inserted into the DOM
    connectedCallback() {
        if (this.isConnected) {
            // Perform any setup work here
            // Ensure all properties are correctly initialized before calling setup methods
            this.mainMapSetup();
        }
    }

    // Observe attribute changes for reactive updates
    static get observedAttributes() {
        return ['layerurl', 'degrees', 'center', 'zoom']; // Add attributes to observe (note the lowercase attribute names)
    }

    // Handle changes to observed attributes
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'layerurl':
                this.gLayerURL = newValue.split(',').map(item => item.trim());
                break;
            case 'degrees':
                this.gdegrees = parseFloat(newValue);
                break;
            case 'center':
                this.gcenter = JSON.parse(newValue);
                break;
            case 'zoom':
                this.gzoom = parseInt(newValue, 10);
                break;
            default:
                // log or handle any unforeseen attributes
                break;
        }

        // If needed, you could re-render or update configurations each time an attribute changes
        // But be cautious with this - you may need to check that properties are not being changed during the initial setup
        // to avoid infinite loops or excessive operations
        this.mainMapSetup();
    }

    // Method for setting up your main map
    mainMapSetup() {
        // Ensure that all required properties are set and valid
        if (this.gLayerURL.length && this.gcenter.length) {
            // Now we're calling 'mainMap' with the current state of our properties
            mainMap(this.gLayerURL, this.gdegrees, this.gcenter, this.gzoom);
        } else {
            console.error("Required properties not yet set or invalid");
        }
    }

    // (Optional) Lifecycle method called when the element is removed from the DOM
    disconnectedCallback() {
        // Clean up if needed (e.g., remove event listeners or clearInterval/setTimeout)
    }
}

// Define a custom element for the GeoMap, associated with the 'CustomMapElement' class
customElements.define("com-sap-custom-geomap", CustomMapElement);
