(function ()
{
    let template = document.createElement("template");

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
    <link rel="stylesheet" href="https://js.arcgis.com/4.25/esri/themes/light/main.css" />
    <script src="https://js.arcgis.com/4.25/"></script>

    <style>
      html,
      body,
      #viewDiv {
        padding: 0;
        margin: 0;
        height: 100%;
        width: 100%;
      }

      #titleDiv {
        background-color: lightgray;
        color: black;
        padding: 5px;
        position: absolute;
        z-index: 2;
        top: 0;
        right: 0;
        font-size: 20pt;
        font-weight: bolder;
        width: 100%;
        height: 30px;
        text-align: center;
        opacity: 0.75;
      }

    </style>
    </head>

    <body>
        <div id="viewDiv" class="esri-widget"><div id="titleDiv"></div></div>
    </body>

    `;

    

    function mainMap() {
        require(["esri/views/SceneView", "esri/WebScene"], (SceneView, WebScene) => {
            const titleDiv = document.getElementById("titleDiv");
    
            /*Creates a new WebScene instance. A WebScene must reference
            a PortalItem ID that represents a WebScene saved to
            arcgis.com or an on-premise portal.
            
            To load a WebScene from an on-premise portal, set the portal
            url with esriConfig.portalUrl.
            */

            const scene = new WebScene({
              portalItem: {
                // autocasts as new PortalItem()
                id: gPortalID
              }
            });
    
            /*Set the WebScene instance to the map property in a SceneView.*/
            const view = new SceneView({
              map: scene,
              container: "viewDiv",
              padding: {
                top: 40
              }
            });
    
    
            view.when(function() {
              // when the scene and view resolve, display the scene's title in the DOM
              const title = scene.portalItem.title;
              titleDiv.innerHTML = title;
            });

            
          });

    }

    


        class Map extends HTMLElement
        {
            constructor() {
                super();

                this.appendChild(template.content.cloneNode(true));
                this._props = {};
                let that = this;

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
            
                // function executed on initialisation
                // function executed 2 times. first returns default value of variable &
                // initialisation variables data
                onCustomWidgetBeforeUpdate(oChangedProperties) {
                  this.$chartData = oChangedProperties['chartData'];
                  locationData = this.$chartData;
                  if (locationData && !(gPortalID == null) && mapValue == 0)
                    mainMap();
                }
            
                ////function executed on variable updates
                onCustomWidgetAfterUpdate(oChangedProperties) {
                  gPortalID = this.$portalId;
                  if ('BColor' in oChangedProperties) {
                    this.$BColor = oChangedProperties['BColor'];
                  }
                  
            
                  if (!(gPortalID == null )) {
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
                
            } //end of constructor
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
