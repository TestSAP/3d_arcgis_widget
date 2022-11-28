(function ()
    {
        let template = document.createElement("template");

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
        #srDiv{
            height: 40px;
            padding: 10px;
        }
        </style>

        <body>
        <div id="viewDiv"></div>
        <div id="srDiv" class="esri-widget"></div>
        </body>

        `;

        class Map extends HTMLElement
        {
            constructor() {
                super();

                this.appendChild(template.content.cloneNode(true));
                this._props = {};
                let that = this;

                require([
                    "esri/Map",
                    "esri/views/MapView",
                    "esri/portal/Portal",
                    "esri/widgets/BasemapGallery",
                    "esri/widgets/BasemapGallery/support/PortalBasemapsSource",
                    "esri/widgets/Expand"
                  ], function(
                    Map,
                    MapView,
                    Portal,
                    BasemapGallery,
                    PortalBasemapsSource,
                    Expand
                  ) {
              
              
                    const portal = new Portal();
              
                    // source for basemaps from a portal group
                    // containing basemaps with different projections
                    const source = new PortalBasemapsSource({
                      portal,
                      query: {
                        id: "bdb9d65e0b5c480c8dcc6916e7f4e099"
                      }
                    });
              
              
                    const map = new Map({
                      basemap: {
                        portalItem: {
                          id: "8d91bd39e873417ea21673e0fee87604" // nova basemap
                        }
                      }
                    });
              
                    // center the view over 48 states
                    const view = new MapView({
                      container: "viewDiv",
                      map: map,
                      center: [-100, 35],
                      zoom: 2,
                      constraints: {
                        snapToZoom: false
                      }
                    });
                    view.ui.add("srDiv", "top-right");
              
                    const bgExpand = new Expand({
                      view,
                      content: new BasemapGallery({ source, view }),
                      expandIconClass: "esri-icon-basemap"
                    });
                    view.ui.add(bgExpand, "top-right");
              
                    view.watch("spatialReference", ()=> {
                      document.getElementById("srDiv").innerHTML = `view.spatialReference.wkid = <b>${view.spatialReference.wkid}</b>`;
                    });
                  });
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
