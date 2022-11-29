(function (){
    let template = document.createElement("template");

    template.innerHTML = `
        <style>
        html,
        body,
        #viewDiv {
        padding: 0;
        margin: 0;
        height: 100%;
        width: 100%;
        }

        #ascDiv,
        #descDiv,
        #distanceDiv {
        padding: 0;
        margin: 0;
        width: 30%;
        float: left;
        font-weight: 900;
        }

        #ascDiv p,
        #descDiv p,
        #distanceDiv p {
        padding: 0;
        margin: 0.2em;
        }

        #paneDiv {
        position: absolute;
        top: 12px;
        left: 62px;
        width: 80%;
        padding: 0 12px 0 12px;
        background-color: rgba(255, 255, 255, 0.85);
        border: 1px solid white;
        color: black;
        }
    </style>

    <link rel="stylesheet" href="https://js.arcgis.com/4.25/esri/themes/light/main.css" />
    <script src="https://js.arcgis.com/4.25/"></script>
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
                "esri/views/SceneView",
                "esri/Graphic",
                "esri/layers/GraphicsLayer",
                "esri/rest/route",
                "esri/rest/support/RouteParameters",
                "esri/rest/support/FeatureSet"
              ], (Map, SceneView, Graphic, GraphicsLayer, route, RouteParameters, FeatureSet) => {
                // Point the URL to a valid routing service
                const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
        
                // The stops and route result will be stored in this layer
                const routeLayer = new GraphicsLayer();
        
                const map = new Map({
                  basemap: "topo-vector",
                  ground: "world-elevation",
                  layers: [routeLayer] // Add the route layer to the map
                });
        
                const view = new SceneView({
                  container: "viewDiv",
                  map: map,
                  center: [7.9878, 46.3159],
                  zoom: 16
                });
        
                // prepare the route parameters
                const routeParams = new RouteParameters({
                  // An authorization string used to access the routing service
                  apiKey: "AAPKba01f8c7edd348008490c7c24df5a0e5cBu5BKOB0MaFX_J-OU7S329J5FFrKriiv02B9JwpIWUBj3Brs2COy9Ju7W27eUEC",
                  stops: new FeatureSet(),
                  outSpatialReference: {
                    // autocasts as new SpatialReference()
                    wkid: 3857
                  }
                });
        
                // the symbol used to mark stops on the route
                const markerSymbol = {
                  type: "point-3d", // autocasts as new PointSymbol3D()
                  symbolLayers: [
                    {
                      type: "object", // autocasts as new ObjectSymbol3DLayer()
                      width: 35,
                      resource: {
                        primitive: "sphere"
                      },
                      material: {
                        color: [255, 0, 0]
                      }
                    }
                  ]
                };
        
                // the symbol used to mark the paths between stops
                const pathSymbol = {
                  type: "line-3d", // autocasts as new LineSymbol3D()
                  symbolLayers: [
                    {
                      type: "path", // autocasts as new PathSymbol3DLayer()
                      width: 17, // If only the width is given, the height is set to the same value.
                      material: {
                        color: [255, 128, 0]
                      }
                    }
                  ]
                };
        
                // Adds a graphic when the user clicks the map. If 2 or more points exist, route is solved.
                view.on("click", addStop);
        
                function addStop(event) {
                  if (!event.mapPoint) {
                    return;
                  }
        
                  // Add a marker at the location of the map click
                  const stop = new Graphic({
                    geometry: event.mapPoint,
                    symbol: markerSymbol
                  });
                  routeLayer.add(stop);
        
                  // Update the route and execute it if 2 or more stops are input
                  routeParams.stops.features.push(stop);
                  if (routeParams.stops.features.length >= 2) {
                    route
                      .solve(routeUrl, routeParams)
                      .then(onRouteUpdated)
                      .catch((error) => {
                        // if it fails, print the error to the console and remove the recently added point
                        routeLayer.remove(stop);
                        routeParams.stops.features.pop();
                        console.error(error);
                      });
                  }
                }
        
                function onRouteUpdated(data) {
                  const route = data.routeResults[0].route;
                  const geometry = route.geometry;
        
                  // do the actual elevation query
                  const elevationPromise = map.ground.queryElevation(geometry);
        
                  elevationPromise.then(
                    (result) => {
                      // compute the total ascent and descent
                      let ascent = 0;
                      let descent = 0;
                      for (let j = 0; j < result.geometry.paths.length; j++) {
                        const path = result.geometry.paths[j];
                        for (let i = 0; i < path.length - 1; i++) {
                          const d = path[i + 1][2] - path[i][2];
                          if (d > 0) {
                            ascent += d;
                          } else {
                            descent -= d;
                          }
                        }
                      }
        
                      // update the text fields
                      document.getElementById("distanceDiv").innerHTML =
                        "<p>total distance: " + Math.round(route.attributes.Total_Kilometers * 1000) / 1000 + " km</p>";
                      document.getElementById("ascDiv").innerHTML =
                        "<p>total ascent: " + Math.round(ascent * 100) / 100 + " m</p>";
                      document.getElementById("descDiv").innerHTML =
                        "<p>total descent: " + Math.round(descent * 100) / 100 + " m</p>";
        
                      // add a path symbol following the calculated route to the scene
                      routeLayer.add(
                        new Graphic({
                          geometry: result.geometry,
                          symbol: pathSymbol
                        })
                      );
                    },
                    (error) => {
                      console.error(error);
                    }
                  );
                }
              });

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