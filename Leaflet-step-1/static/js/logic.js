
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

var myMap = L.map("map", {
  center: [37.0902, -95.7129],
  zoom: 2
});

L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: "pk.eyJ1Ijoia2t1cm5pYXdhbiIsImEiOiJja3U2dDd3bXgxMzJjMndtcjE5OXdmZHVqIn0.vfr-GGgYLF49YWOU7L5vKA"
}).addTo(myMap);

var url ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

var geojson

d3.json(url).then(response=> {
  geojson= L.geoJson(response, {pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  }).addTo(myMap)

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
  
})