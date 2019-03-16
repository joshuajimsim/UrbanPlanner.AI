// Map via Mapbox GL
$(document).ready(init);

function init(jQuery) {
    CurrentYear();
    initMap();

    /*
    // user clicks some button
    $('#someButton').on('click', function () {
        // do something here
    });

    */
}

function CurrentYear() {
    var thisYear = new Date().getFullYear()
    $("#currentYear").text(thisYear);
}

var mapCoordinates = [42.885441, -78.878464];
var mapZoom = 11;

// the key from the Mapbox examples (not mine)
var mapAccessToken = "pk.eyJ1IjoibWV0cmljb24iLCJhIjoiY2l3eTQxMWl3MDBmYTJ6cWg3YmZtdjdsMSJ9.2vDbTw3ysscpy3YWkHo6aA";

var map = null;
var geocoder = null;

function initMap() {
    map = MapGL();
}

function MapGL() {
    mapboxgl.accessToken = mapAccessToken;

    // initialize map
    var newMap = new mapboxgl.Map({
        container: "map", // container id
        // style: "mapbox://styles/mapbox/streets-v9", //stylesheet location
        style: 'mapbox://styles/mapbox/light-v9',
        // center: [-37.809820, 144.96983],

        center: [144.96983, -37.809820],
        zoom: 15.5,
        pitch: 45,
        bearing: -0,
    });

    // geocoding
    newMap.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    }));


    // event handlers
    newMap.on("load", mapLoaded);


    return newMap;
}

function mapLoaded() {
    // do stuff here


// Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }


    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],

            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],

            'fill-extrusion-opacity': .6
        }
    }, labelLayerId);


// ------------------------ Hospital Layers

    map.addLayer({
        "id": "points",
        "type": "symbol",
        "source":
            {
                "type": "geojson",
                "data": HospitalData		// data from external JSON file
            },
        "layout":
            {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
    });


    map.addSource('Hospitals', {
        "type": "geojson",
        "data": HospitalData
    });


    map.addLayer({
        "id": "hospitals-heat",
        "type": "heatmap",
        "source": "Hospitals",
        "maxzoom": 9,
        "paint": {
        // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": 1
            //     [
            //     "interpolate",
            //     ["linear"],
            //     ["get", "mag"],
            //     0, 0,
            //     6, 1
            // ]
            ,
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity":
                [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 10,
                9, 2
            ]
            ,
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
            "heatmap-color":
                ["interpolate",
                ["linear"],
                ["heatmap-density"],
                    0, "rgba(100,102,172,0)",
                    0.3, "rgb(50,0,255)",
                    0.5, "rgb(50,50,150)",
                    0.8, "rgb(150,50,50)",
                    1, "rgb(255,50,50)"]
            ,
        // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                2, 10,
                5, 50
            ],
        // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                9, 0
            ],
        }
    }, 'waterway-label');

    map.addLayer({
        "id": "earthquakes-point",
        "type": "circle",
        "source": "Hospitals",
        "minzoom": 7,
        "paint": {
            // Size circle radius by earthquake magnitude and zoom level
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 1,
                    6, 4
                ],
                16, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 5,
                    6, 50
                ]
            ],
        // Color circle by earthquake magnitude
            "circle-color": "rgb(0, 0, 255)",
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
        // Transition from heatmap to circle layer by zoom level
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5, 0,
                7, 1
            ]
        }
    }, 'waterway-label');

/*
//----------------------------- Schools Layers
    map.addLayer({
        "id": "schoolsPoints",
        "type": "symbol",
        "source":
            {
                "type": "geojson",
                "data": SchoolsData		// data from external JSON file
            },
        "layout":
            {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
    });

    map.addSource('Schools', {
        "type": "geojson",
        "data": SchoolsData
    });

    map.addLayer({
        "id": "schools-heat",
        "type": "heatmap",
        "source": "Schools",
        "maxzoom": 9,
        "paint": {
// Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0, 0,
                6, 1
            ],
// Increase the heatmap color weight weight by zoom level
// heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                1, 10,
                9, 3
            ],
// Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
// Begin color ramp at 0-stop with a 0-transparancy color
// to create a blur-like effect.
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(33,102,172,0)",
                0.2, "rgb(103,169,207)",
                0.4, "rgb(209,229,240)",
                0.6, "rgb(253,219,199)",
                0.8, "rgb(239,138,98)",
                1, "rgb(178,24,43)"
            ],
// Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                2, 10,
                5, 50
            ],
// Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                9, 0
            ],
        }
    }, 'waterway-label');

    map.addLayer({
        "id": "schools-point",
        "type": "circle",
        "source": "Schools",
        "minzoom": 7,
        "paint": {
// Size circle radius by earthquake magnitude and zoom level
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 1,
                    6, 4
                ],
                16, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 5,
                    6, 20
                ]
            ],
// Color circle by earthquake magnitude
            "circle-color": "rgb(255, 0, 0)",
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
// Transition from heatmap to circle layer by zoom level
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5, 0,
                7, 1
            ]
        }
    }, 'waterway-label');
*/

}