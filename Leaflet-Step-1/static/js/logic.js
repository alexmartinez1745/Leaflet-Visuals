// Creating map object
var myMap = L.map("map", {
  center: [34.0522, -118.2437],
  zoom: 5,
});

// Create tile layer
L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY,
  }
).addTo(myMap);

// Endpoint of geoJson data (Earthquakes in past 7 days)
var url =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grab data with d3
d3.json(url).then(function (data) {
  // Look through data for proper loading in console
  console.log(data);

  // Create markers size by magnitude
  function markers(mag) {
    return mag * 5;
  }

  // Select color depending on depth of the earthquake
  function colorSelect(depth) {
    switch (true) {
      case depth > 90:
        return "#F00505";
      case depth > 70:
        return "#D95F0E";
      case depth > 50:
        return "#FF9800";
      case depth > 30:
        return "#FFC100";
      case depth > 10:
        return "#FFEC19";
      default:
        return "#BDDE34";
    }
  }

  // Load in the geojson
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(
        latlng,
        // Set the style of the markers using functions above
        {
          radius: markers(feature.properties.mag),
          fillColor: colorSelect(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          weight: 0.6,
        }
      );
    },

    // Create a popup for each earthquake marker on click
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h4> Site: " +
          feature.properties.place +
          "</h4> <hr> <h4> Magnitude: " +
          feature.properties.mag +
          "</h4> <hr> <h4> Time: " +
          new Date(feature.properties.time) +
          "</h4>"
      );
    },
  }).addTo(myMap);

  // Add legend to map
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    depthScale = [-10, 10, 30, 50, 70, 90];
    for (var i = 0; i < depthScale.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        colorSelect(depthScale[i] + 1) +
        '"></i> ' +
        + depthScale[i] +
        (depthScale[i + 1] ? " - " + depthScale[i + 1] + "<br>" : " + ");
    }
    return div;
  };
  legend.addTo(myMap);
});
