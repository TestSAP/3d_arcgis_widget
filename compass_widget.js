(function ()
{
    let template = document.createElement("template");
    var gdegrees;
    var gcenter;
    var gzoom;

    template.innerHTML = `
    <link rel="stylesheet" href="https://js.arcgis.com/4.27/esri/themes/light/main.css" />
    <script src="https://js.arcgis.com/4.27/"></script>

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
        require(["esri/Map", "esri/views/MapView", "esri/widgets/Compass"],
        (Map, MapView, Compass) => {
          const map = new Map({
            basemap: "streets-vector"
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

        class Map extends HTMLElement
        {
            constructor() {
                super();

                this.appendChild(template.content.cloneNode(true));
                this._props = {};
                let that = this;

                require(
                  ["esri/Map", "esri/views/MapView", "esri/widgets/Compass"],
                  (Map, MapView, Compass) =>{

                  }
                );

            } //end of constructor

            getSelection(){
              return this._currentSelection;
            }

            // onCustomWidgetBeforeUpdate(oChangedProperties) {
            //   if(!(gPortalID == null))
            //   {
            //     mainMap();
            //   }
            // }

            onCustomWidgetAfterUpdate(oChangedProperties) {
              if ('degrees' in oChangedProperties) {
                this.$degrees = oChangedProperties['degrees'];
              }
              gdegrees = this.$degrees;
              if ('center' in oChangedProperties) {
                this.$center = oChangedProperties['center'];
              }
              gcenter = this.$center;
              if ('zoom' in oChangedProperties) {
                this.$zoom = oChangedProperties['zoom'];
              }
              gzoom = this.$zoom;
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