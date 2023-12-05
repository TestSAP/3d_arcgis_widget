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

require(["esri/Map", "esri/layers/CSVLayer", "esri/views/MapView", "esri/widgets/Legend"], (
    Map,
    CSVLayer,
    MapView,
    Legend
) => {
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.csv";

    const template = {
        title: "{place}",
        content: "Magnitude {mag} {type} hit {place} on {time}."
    };

    const renderer = {
        type: "heatmap",
        colorStops: [
            { color: "rgba(63, 40, 102, 0)", ratio: 0 },
            { color: "#472b77", ratio: 0.083 },
            { color: "#4e2d87", ratio: 0.166 },
            { color: "#563098", ratio: 0.249 },
            { color: "#5d32a8", ratio: 0.332 },
            { color: "#6735be", ratio: 0.415 },
            { color: "#7139d4", ratio: 0.498 },
            { color: "#7b3ce9", ratio: 0.581 },
            { color: "#853fff", ratio: 0.664 },
            { color: "#a46fbf", ratio: 0.747 },
            { color: "#c29f80", ratio: 0.83 },
            { color: "#e0cf40", ratio: 0.913 },
            { color: "#ffff00", ratio: 1 }
        ],
        maxDensity: 0.01,
        minDensity: 0
    };

    const layer = new CSVLayer({
        url: url,
        title: "Magnitude 2.5+ earthquakes from the last week",
        copyright: "USGS Earthquakes",
        popupTemplate: template,
        renderer: renderer,
        labelsVisible: true,
        labelingInfo: [{
            symbol: {
                type: "text", 
                color: "white",
                font: {
                    family: "Noto Sans",
                    size: 8
                },
                haloColor: "#472b77",
                haloSize: 0.75
            },
            labelPlacement: "center-center",
            labelExpressionInfo: {
                expression: "Text($feature.mag, '#.0')"
            },
            where: "mag > 5"
        }]
    });

    const map = new Map({
        basemap: "gray-vector",
        layers: [layer]
    });

    const view = new MapView({
        container: "viewDiv",
        center: [-138, 30],
        zoom: 2,
        map: map
    });

    view.ui.add(
        new Legend({
            view: view
        }),
        "bottom-left"
    );
});
