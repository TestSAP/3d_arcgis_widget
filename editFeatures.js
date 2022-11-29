(function (){
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
  
    </style>

    <body>
        <div id="viewDiv"></div>
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
                    "esri/WebMap",
                    "esri/views/MapView",
                    "esri/widgets/Editor"
                  ], (
                    WebMap, MapView,
                    Editor
                  ) => {
            
                    let pointLayer, lineLayer, polygonLayer;
            
                    // Create a map from the referenced webmap item id
                    const webmap = new WebMap({
                      portalItem: {
                        id: "459a495fc16d4d4caa35e92e895694c8"
                      }
                    });
            
                    const view = new MapView({
                      container: "viewDiv",
                      map: webmap
                    });
            
                    view.when(() => {
                      view.map.loadAll().then(() => {
                        view.map.allLayers.forEach((layer) => {
                          if (layer.type === 'feature') {
                            switch (layer.geometryType) {
                              case "polygon":
                                polygonLayer = layer;
                                break;
                              case "polyline":
                                lineLayer = layer;
                                break;
                              case "point":
                                pointLayer = layer;
                                break;
                            }
                          }
                        });
            
                        // Create layerInfos for layers in Editor. This
                        // sets the fields for editing.
            
                        const pointInfos = {
                          layer: pointLayer,
                          formTemplate: { // autocasts to FormTemplate
                            elements: [{ // autocasts to Field Elements
                              type: "field",
                              fieldName: "HazardType",
                              label: "Hazard type"
                            }, {
                              type: "field",
                              fieldName: "Description",
                              label: "Description"
                            }, {
                              type: "field",
                              fieldName: "SpecialInstructions",
                              label: "Special Instructions"
                            }, {
                              type: "field",
                              fieldName: "Status",
                              label: "Status"
                            }, {
                              type: "field",
                              fieldName: "Priority",
                              label: "Priority"
                            }]
                          }
                        };
            
            
                        const lineInfos = {
                          layer: lineLayer,
                          formTemplate: { // autocasts to FormTemplate
                            elements: [{ // autocasts to FieldElement
                              type: "field",
                              fieldName: "Severity",
                              label: "Severity"
                            }, {
                              type: "field",
                              fieldName: "blocktype",
                              label: "Type of blockage"
                            }, {
                              type: "field",
                              fieldName: "fullclose",
                              label: "Full closure"
                          }, {
                              type: "field",
                              fieldName: "active",
                              label: "Active"
                            }, {
                              type: "field",
                              fieldName: "locdesc",
                              label: "Location Description"
                            }]
                          }
                        };
            
                        const polyInfos = {
                          layer: polygonLayer,
                          formTemplate: { // autocasts to FormTemplate
                            elements: [{ // autocasts to FieldElement
                              type: "field",
                              fieldName: "incidenttype",
                              label: "Incident Type"
                            }, {
                              type: "field",
                              fieldName: "activeincid",
                              label: "Active"
                            }, {
                              type: "field",
                              fieldName: "descrip",
                              label: "Description"
                            }]
                          }
                      };
            
                        const editor = new Editor({
                          view: view,
                          layerInfos: [pointInfos, lineInfos, polyInfos]
                      });
            
                      // Add the widget to the view
                      view.ui.add(editor, "top-right");
                      });
                    });
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