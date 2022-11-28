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
  
    `;
    
    // this function takes the passed in servicelevel and issues a definition query
    // to filter service location geometries
    //
    // A definition query filters what was first retrieved from the SPL feature service
    function applyDefinitionQuery() {
        var svcLyr = gMyWebmap.findLayerById( 'NapervilleElectric_MIL1_6627' ); 
        console.log( "Layer is");
        console.log( svcLyr);

        // make layers visible
        svcLyr.visible = true;

        // only execute when the sublayer is loaded. Note this is asynchronous
        // so it may be skipped over during execution and be executed after exiting this function
        svcLyr.when(function() {
            gMyLyr = svcLyr.findSublayerById(6);    // store in global variable
            console.log("Sublayer loaded...");
            console.log( "Sublayer is");
            console.log( gMyLyr);

            // force sublayer visible
            gMyLyr.visible = true;

            // run the query
            processDefinitionQuery();
        });
    };

    // process the definition query on the passed in SPL feature sublayer
    function processDefinitionQuery()
    {
        // values of passedServiceType
        // 0, 1 - no service levels. Only show service locations without a guarantee of service (GoS)
        //     Note that 0 is passed in when the widget is initialized and 1 on subsequent times
        // 2 - return any service location with a GoS = 1
        // 3 - GoS = 2
        // 4 - GoS = 3
        // 5 - GoS = 4
        // 6 - GoS = 5
        // 7 - GoS = 6
        // 8 (default) - return all service levels
        if (gPassedServiceType <= 1) { // display all service locations
            gMyLyr.definitionExpression = "1 = 1"
        } else if (gPassedServiceType === 2) { // display GoS = 1
            gMyLyr.definitionExpression = "NODISCONCT = '1'";
        } else if (gPassedServiceType === 3) { // display GoS = 2
            gMyLyr.definitionExpression = "NODISCONCT = '2'";
        } else if (gPassedServiceType === 4) { // display GoS = 3
            gMyLyr.definitionExpression = "NODISCONCT = '3'";
        } else if (gPassedServiceType === 5) { // display GoS = 4
            gMyLyr.definitionExpression = "NODISCONCT = '4'";
        } else if (gPassedServiceType === 6) { // display GoS = 5
            gMyLyr.definitionExpression = "NODISCONCT = '5'";
        } else if (gPassedServiceType === 7) { // display GoS = 6
            gMyLyr.definitionExpression = "NODISCONCT = '6'";
        } else { // default is to only display service locations with a set GoS
            gMyLyr.definitionExpression = "NODISCONCT IN ('1', '2', '3', '4', '5', '6')";
        }
    }

    class Map extends HTMLElement {
        constructor() {
            super();
            
            //this._shadowRoot = this.attachShadow({mode: "open"});
            this.appendChild(template.content.cloneNode(true));
            this._props = {};
            let that = this;

            /*require([
                "esri/config",
                "esri/WebMap",
                "esri/views/MapView",
                "esri/widgets/BasemapToggle",
                "esri/layers/FeatureLayer",
                "esri/widgets/TimeSlider",
                "esri/widgets/Expand",
                "esri/tasks/RouteTask",
                "esri/tasks/support/RouteParameters",
                "esri/tasks/support/FeatureSet",
                "esri/layers/support/Sublayer",
                "esri/Graphic",
                "esri/views/ui/UI",
                "esri/views/ui/DefaultUI" 
            ], function(esriConfig, WebMap, MapView, BasemapToggle, FeatureLayer, TimeSlider, Expand, RouteTask, RouteParameters, FeatureSet, Sublayer, Graphic) {
        
                // set portal and API Key
                esriConfig.portalUrl = gPassedPortalURL

                //  set esri api Key 
                esriConfig.apiKey = gPassedAPIkey
        
                // set routing service
                var routeTask = new RouteTask({
                    url: "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"
                });
        
                // replace the ID below with the ID to your web map
                const webmap = new WebMap ({
                    portalItem: {
                        id: "c73fcdec77c747ec8838f7039fe215a0"
                    }
                });

                gMyWebmap = webmap;  // save to global variable

                const view = new MapView({
                    container: "mapview",
                    map: webmap
                });

                // time slider widget initialization
                const timeSlider = new TimeSlider({
                    container: "timeSlider",
                    view: view
                });
        
                // set on click for directions
                view.on("click", addStop);
        
                function addGraphic(type, point) {
                    var graphic = new Graphic({
                        symbol: {
                            type: "simple-marker",
                            color: type === "start" ? "white" : "black",
                            size: "8px"
                        },
                        geometry: point
                    });

                    view.graphics.add(graphic);
                }

                function addStop( event) { // no code here
                    // here neither
                    if (view.graphics.length === 0) {
                        addGraphic("start", event.mapPoint);
                    } else if (view.graphics.length === 1) {
                        addGraphic("finish", event.mapPoint);
                        getRoute();
                    } else {
                        view.graphics.removeAll();
                        addGraphic("start", event.mapPoint);
                    }
                };

                function getRoute() {
                    // Setup the route parameters
                    var routeParams = new RouteParameters({
                        stops: new FeatureSet({
                            features: view.graphics.toArray() // Pass the array of graphics
                        }),
                        returnDirections: true
                    });

                    // Get the route
                    routeTask.solve(routeParams).then( showRoute);
                }

                function showRoute( data)
                {
                    // Display the route
                    
                    data.routeResults.forEach(function (result) {
                        result.route.symbol = {
                            type: "simple-line",
                            color: [5, 150, 255],
                            width: 3
                        };
                        view.graphics.add(result.route);
                    });

                    // Display the directions
                    var directions = document.createElement("ol");
                    directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
                    directions.style.marginTop = 0;
                    directions.style.paddingTop = "15px";
        
                    // Show the directions
                    var features = data.routeResults[0].directions.features;
                    features.forEach(function (result, i) {
                        var direction = document.createElement("li");
                        direction.innerHTML =
                        result.attributes.text + " (" + result.attributes.length.toFixed(2) + " miles)";
                        directions.appendChild(direction);
                    });

                    // Add directions to the view
                    view.ui.empty("top-right");
                    view.ui.add(directions, "top-right");
                }

                view.when(function () {
                    view.popup.autoOpenEnabled = true; //disable popups
                    gWebmapInstantiated = 1; // used in onCustomWidgetAfterUpdate
        
                    // Create the basemap toggle
                    var basemapToggle = new BasemapToggle({
                        view:view,
                        nextBasemap: "satellite"
                    });

        
                    // Add the toggle to the bottom-right of the view
                    view.ui.add( basemapToggle, "bottom-right");
        
                    // should have been set in onCustomWidgetBeforeUpdate()
                    console.log( gPassedServiceType);

                    // find the SPL sublayer so a query is issued
                    applyDefinitionQuery();
                });

            }); // end of require()*/


            require([
                "esri/config",
                "esri/Map",
                "esri/views/MapView",
          
                "esri/Graphic",
                "esri/rest/route",
                "esri/rest/support/RouteParameters",
                "esri/rest/support/FeatureSet"
          
              ], function(esriConfig, Map, MapView, Graphic, route, RouteParameters, FeatureSet) {
          
              esriConfig.apiKey = "AAPKba01f8c7edd348008490c7c24df5a0e5cBu5BKOB0MaFX_J-OU7S329J5FFrKriiv02B9JwpIWUBj3Brs2COy9Ju7W27eUEC";
          
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

        getSelection() {
            return this._currentSelection;
        }

        onCustomWidgetBeforeUpdate(changedProperties)
        {
            this._props = { ...this._props, ...changedProperties };
           // console.log(["Service Level",changedProperties["servicelevel"]]);

        }

        onCustomWidgetAfterUpdate(changedProperties) 
        {
            if ("servicelevel" in changedProperties) {
                this.$servicelevel = changedProperties["servicelevel"];
            }
            gPassedServiceType = this.$servicelevel; // place passed in value into global

            if ("portalurl" in changedProperties) {
                this.$portalurl = changedProperties["portalurl"];
            }
            gPassedPortalURL = this.$portalurl; // place passed in value into global

            if ("apikey" in changedProperties) {
                this.$apikey = changedProperties["apikey"];
            }
            gPassedAPIkey = this.$apikey; // place passed in value into global

            // only attempt to filter displayed service locations if the webmap is initialized
           if (gWebmapInstantiated === 1) {
                applyDefinitionQuery();
            }
        }
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