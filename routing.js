(function() {
    let template = document.createElement("template");

    template.innerHTML = `
    <style>
      html, body, #viewDiv {
        padding: 0;
        margin: 0;
        height: 100%;
        width: 100%;
      }
     </style>
      <link rel="stylesheet" href="https://js.arcgis.com/4.25/esri/themes/light/main.css">
      <script src="https://js.arcgis.com/4.25/"></script>
      <body>
        <div id="viewDiv"></div>
      </body>
    `;

    class Map extends HTMLElement {
        constructor() {
            super();
            
            //this._shadowRoot = this.attachShadow({mode: "open"});
            this.appendChild(template.content.cloneNode(true));
            this._props = {};
            let that = this;

            require([
              "esri/config",
              "esri/Map",
              "esri/views/MapView",

              "esri/Graphic",
              "esri/rest/route",
              "esri/rest/support/RouteParameters",
              "esri/rest/support/FeatureSet"

            ], function(esriConfig, Map, MapView, Graphic, route, RouteParameters, FeatureSet) {

            esriConfig.apiKey = "";

            const map = new Map({
              basemap: "arcgis-navigation" //Basemap layer service
            });

            const view = new MapView({
              container: "viewDiv",
              map: map,
              center: [-118.24532,34.05398], //Longitude, latitude
              zoom: 12
            });

            const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

            view.on("click", function(event){

              if (view.graphics.length === 0) {
                addGraphic("origin", event.mapPoint);
              } else if (view.graphics.length === 1) {
                addGraphic("destination", event.mapPoint);

                getRoute(); // Call the route service

              } else {
                view.graphics.removeAll();
                addGraphic("origin",event.mapPoint);
              }

            });

            function addGraphic(type, point) {
              const graphic = new Graphic({
                symbol: {
                  type: "simple-marker",
                  color: (type === "origin") ? "white" : "black",
                  size: "8px"
                },
                geometry: point
              });
              view.graphics.add(graphic);
            }

            function getRoute() {
              const routeParams = new RouteParameters({
                stops: new FeatureSet({
                  features: view.graphics.toArray()
                }),

                returnDirections: true

              });

              route.solve(routeUrl, routeParams)
                .then(function(data) {
                  data.routeResults.forEach(function(result) {
                    result.route.symbol = {
                      type: "simple-line",
                      color: [5, 150, 255],
                      width: 3
                    };
                    view.graphics.add(result.route);
                  });

                  // Display directions
                 if (data.routeResults.length > 0) {
                   const directions = document.createElement("ol");
                   directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
                   directions.style.marginTop = "0";
                   directions.style.padding = "15px 15px 15px 30px";
                   const features = data.routeResults[0].directions.features;

                   // Show each direction
                   features.forEach(function(result,i){
                     const direction = document.createElement("li");
                     direction.innerHTML = result.attributes.text + " (" + result.attributes.length.toFixed(2) + " miles)";
                     directions.appendChild(direction);
                   });

                  view.ui.empty("top-right");
                  view.ui.add(directions, "top-right");

                 }

                })

                .catch(function(error){
                    console.log(error);
                })

            }

          });
            
        } // end of constructor()    

        
    } // end of class

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
})(); // end of class
