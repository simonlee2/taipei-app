var center =  L.latLng(25.0419989,121.5465422);
var radius = 600;
var zoom = 15;
var layers = []; // marker layers
var map = L.map("map").setView(center, zoom);

addTileLayer(map);
addCenterMarker(map, center, radius);
listenForLocation(map);

function addTileLayer(map) {
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map)
}

function addCenterMarker(map, center, radius) {
  L.marker(center).addTo(map).bindPopup(`${center}`).openPopup();
  L.circle(center, radius).addTo(map);
}

function onLocationFound(e) {
  let accuracyRadius = e.accuracy / 2;
  L.marker(e.latlng).addTo(map)
  .bindPopup("You are within " + accuracyRadius + " meters from this point").openPopup();

  L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
  alert(e.message);
}

function listenForLocation(map) {
  map.on('locationfound', onLocationFound);
  map.on('locationerror', onLocationError);

  map.locate({setView: true, maxZoom: 16});
}

function send() {
  // Clear layers if necessary
  layers.forEach((layer) => {
    if( map.hasLayer(layer)) {
      layer.clearLayers();
    }
  });

  // Remove all layers for now
  layers = [];

  // Grab query from #code
  let query = encodeURIComponent(window.editor.getValue());

  // Get result using endpoing /sql?q=
  fetch('http://localhost:3000/sql?q=' + query)
    .then(res => res.json())
    .then((out) => addLayer(map, out))
    .catch((err) => console.log(err))
}

function addLayer(map, features) {
  //create an L.geoJson layer, add it to the map
  let layer = L.geoJson(features, {
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
        title: latlng.distanceTo(center)
      });
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(feature.properties.name);
    }
  }).addTo(map)
  layers.push(layer);
  map.fitBounds(layer.getBounds());
}
