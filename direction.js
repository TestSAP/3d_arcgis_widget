(function () {
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
        </style>

        <body>
            <div id="viewDiv"></div>
        </body>
        `;

        class Map extends HTMLElement
        {
            constructor()
            {
                super();
                this.appendChild(template.content.cloneNode(true));
                this._props = {};
                let that = this;

                require(["esri/Map", "esri/views/MapView", "esri/widgets/Directions", "esri/layers/RouteLayer"], function(
                    Map,
                    MapView,
                    Directions,
                    RouteLayer
                  ) {
            
                    // An authorization string used to access the basemap, geocoding and routing services
                    const apiKey = "AAPKba01f8c7edd348008490c7c24df5a0e5cBu5BKOB0MaFX_J-OU7S329J5FFrKriiv02B9JwpIWUBj3Brs2COy9Ju7W27eUEC";
            
                    // create a new RouteLayer, required for Directions widget
                    const routeLayer = new RouteLayer();
            
                    // new RouteLayer must be added to the map
                    const map = new Map({
                      basemap: "topo-vector",
                      layers: [routeLayer]
                    });
            
                    const view = new MapView({
                      zoom: 14,
                      center: [-118.24, 34.05],
                      container: "viewDiv",
                      map: map
                    });
            
                    // new RouteLayer must be added to Directions widget
                    let directionsWidget = new Directions({
                      layer: routeLayer,
                      apiKey,
                      view
                    });
            
                    // Add the Directions widget to the top right corner of the view
                    view.ui.add(directionsWidget, {
                      position: "top-right"
                    });
                  });
            } //end of constructor
        } //end of class

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