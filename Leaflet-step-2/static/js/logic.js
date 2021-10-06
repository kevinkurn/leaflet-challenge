
// function to adjust circle marker color based on earthquake magnitude
function chooseColor(magnitude) {
    if (magnitude<=1) {return "#00ff00"}
    else if (magnitude<=2) {return "#b0ff00"}
    else if (magnitude<=3) {return "#feff00"}
    else if (magnitude<=4) {return "#ffc800"}
    else if (magnitude<=5) {return "#ffa600"}
    else {return "#ff5700"}
  }

function pointToLayer(feature, latlng){
    var geojsonMarkerOptions = {
      radius:feature.properties.mag*3,
      fillColor: chooseColor(feature.properties.mag),
      color: "none",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
  
    return L.circleMarker(latlng, geojsonMarkerOptions)
  }

function onEachFeature (feature, layer) {
  layer.on({
    // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 60% so that it stands out
    mouseover: function(event) {
      layer = event.target;
      layer.setStyle({
        fillOpacity: 0.6
      });
    },
    // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
    mouseout: function(event) {
      layer = event.target;
      layer.setStyle({
        fillOpacity: 0.8
      });
    },
  });
  // Giving each feature a pop-up with information pertinent to it
  layer.bindPopup("<div>Incident Place: "+ feature.properties.place+"<hr>Earthquake magnitude: " + feature.properties.mag + "</div>");
}

// create a function to draw the base map, overlays and legends
function createMap(earthquake, plate) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var sat_map=L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  var out_map=L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Sattelite": sat_map,
    "Outdoor": out_map
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Earthquake": earthquake,
    "Plates":plate
  };

  // Create the map object with options
  var myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 4,
    layers: [lightmap, earthquake, plate]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // add legend (refer to https://leafletjs.com/examples/choropleth/)
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = ["#00ff00", "#b0ff00", "#feff00", "#ffc800","#ffa600", "#ff5700"];


  // loop through the intervals of colors to put it in the label
    div.innerHTML="<div><b>Earthquake Magnitude<b><div>"
    for (var i = 0; i<grades.length; i++) {
      div.innerHTML +=
      "<i style='background: " + colors[i] + "'></i> " +
      grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;

  };

  legend.addTo(myMap)

}

// extract the API data from earthquake.usgs.gov and plot it into the basemap
var url ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var geojson
d3.json(url).then(response=> {
  geojson= L.geoJson(response, {pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  })
  // createMap(geojson)
})

// plot a new polygon map using tectonic plates data
var plates
d3.json("static/data/plates.geojson").then(data=>{
  var plateStyle={
    color: "orange",
    fillColor:"none",
    "weight":1
  }
  plates=L.geoJson(data,{style:plateStyle})

  createMap(geojson, plates)
})