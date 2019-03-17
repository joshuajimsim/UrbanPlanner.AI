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
        zoom: 10,
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


//------------------------ Hospital Layers

    map.addLayer({
        "id": "hospital_points",
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
        "id": "hospitals_heat",
        "type": "heatmap",
        "source": "Hospitals",
        "maxzoom": 24,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": 1,
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
                    0, "rgba(255,125,125,0)",
                    0.3, "rgb(255,100,100)",
                    0.5, "rgb(255,75,75)",
                    0.8, "rgb(255,50,50)",
                    1, "rgb(255,25,25)"]
            ,
            // Adjust the heatmap radius by zoom level
            /*"heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                2, 0,
                24, 150
            ],*/
            "heatmap-radius": {
                "base": 2,
                "stops": [
                    [
                        10,
                        32
                    ],
                    [
                        19,
                        4096*2
                    ]
                ]
            },
            // Transition from heatmap to circle layer by zoom level
            /*"heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                9, 0
            ],*/
        }
    }, 'waterway-label');

    map.addLayer({
        "id": "hospitals-point",
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
                    6, 7
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
            "maxzoom": 24,
            "paint": {
    // Increase the heatmap weight based on frequency and property magnitude
                "heatmap-weight": 1,
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
                "heatmap-intensity":
                    ["interpolate",
                        ["linear"],
                        ["zoom"],
                        0, 10,
                        9, 2
                    ],
    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    // Begin color ramp at 0-stop with a 0-transparancy color
    // to create a blur-like effect.
                "heatmap-color":
                    ["interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0, "rgba(200,200,255,0)",
                        0.3, "rgb(150,200,255)",
                        0.5, "rgb(100,200,255)",
                        0.8, "rgb(50,200,255)",
                        1, "rgb(0,200,255)"]
                ,
    // Adjust the heatmap radius by zoom level
                "heatmap-radius": {
                    "base": 2,
                    "stops": [
                        [
                            10,
                            32
                        ],
                        [
                            19,
                            4096*2
                        ]
                    ]
                },
    // Transition from heatmap to circle layer by zoom level

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
                "circle-color": "rgb(0, 150, 255)",
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



    // When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with label name HTML from its properties.
    map.on('click', 'hospitals-point', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.LabelName;

// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

// Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
    });

    
    
//------hospitals label name
    // When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with label name HTML from its properties.
    map.on('click', 'hospitals-point', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.LabelName;

// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

// Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'hospitals-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'hospitals-point', function () {
        map.getCanvas().style.cursor = '';
    });

//-------schools names
    // When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with label name HTML from its properties.
    map.on('click', 'schools-point', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.School_Name;

// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

// Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'schools-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'schools-point', function () {
        map.getCanvas().style.cursor = '';
    });


    
    
    
    
    
//---- recommended points
    map.addLayer({
        "id": "recommendation_points",
        "type": "symbol",
        "source":
            {
                "type": "geojson",
                "data": Recom_data
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

    map.addSource('Recommendations', {
        "type": "geojson",
        "data": Recom_data
    });


    map.addLayer({
        "id": "recommendationHospital_heat",
        "type": "heatmap",
        "source": "Recommendations",
        "maxzoom": 24,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": 1

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
                    0.3, "rgb(100,186,100)",
                    0.5, "rgb(25,186,70)",
                    0.8, "rgb(0,186,50)",
                    1, "rgb(0,186,25)"]
            ,
            // Adjust the heatmap radius by zoom level
            /*"heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                2, 0,
                24, 150
            ],*/
            "heatmap-radius": {
                "base": 2,
                "stops": [
                    [
                        10,
                        32*2
                    ],
                    [
                        19,
                        4096*2*4
                    ]
                ]
            },
            // Transition from heatmap to circle layer by zoom level

        }
    }, 'waterway-label');


    map.addLayer({
        "id": "recommendations-point",
        "type": "circle",
        "source": "Recommendations",
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
            "circle-color": "rgb(0, 255, 0)",
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


}

function buttonClickHandler(_this) {

    buttonStyleHandler(_this);

    //put code for toggling map layer visibility here. Button states can be found in the buttonStatus array.
    /*
    true is active, false is inactive.
    buttonStatus[0] -> ALL
    buttonStatus[1] -> HealthCare
    buttonStatus[2] -> Education
    buttonStatus[6] -> Population density

    var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

 if (visibility === 'visible') {
 map.setLayoutProperty(clickedLayer, 'visibility', 'none');
 this.className = '';
 } else {
 this.className = 'active';
 map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
 }

    */

}
