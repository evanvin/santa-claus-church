// ELEMENTS
let sleigh;
let followButton = document.getElementById('follow');
let isFollowing = false;

// Listeners
followButton.addEventListener('click', toggleFollow);

// Map Initilization
var southWest = L.latLng(-89.98155760646617, -180),
  northEast = L.latLng(89.99346179538875, 180);
// let southWest = L.latLng(-78.4662592, -167.9444468);
// let northEast = L.latLng(84.8965515, 190.7751846);
// southWest = L.latLng(-90, -180);
// northEast = L.latLng(90, 180);
var bounds = L.latLngBounds(southWest, northEast);
var map = L.map('map', {
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 2,
  detectRetina: true,
}).setView([84.6, 168], 3);
document.getElementsByClassName('leaflet-control-attribution')[0].remove();

L.tileLayer(
  'https://api.mapbox.com/styles/v1/evanvin/cl59rnki2000014s1jy5svp8t/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZXZhbnZpbiIsImEiOiJjam81dGg1MGwwZHdkM3ZwYWh5NHJmdWZ3In0.P3Gr9yuJvVVfy0ZvRHsWzA',
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
  }
).addTo(map);

var sleighIcon = L.icon({
  iconUrl: '../images/sleigh.png',
  iconSize: [32, 32],
});

function startup() {
  url =
    'https://cors-anywhere.herokuapp.com/https://clovereartquakedog.pythonanywhere.com/santa/route/58';
  $.ajax({
    headers: { Accept: 'application/json' },
    type: 'GET',
    url: url,
    // crossDomain: true,
    beforeSend: function (xhr) {
      xhr.withCredentials = true;
    },
    success: function (data, textStatus, request) {
      sleigh = L.Marker.movingMarker(data.routes, data.durations, {
        icon: sleighIcon,
        stationInfo: data.stations,
        infoPanel: {
          population: document.getElementById('population'),
          presentsDelivered: document.getElementById('presentsDelivered'),
          nextStopCityRegion: document.getElementById('nextStopCityRegion'),
        },
      }).addTo(map);
      for (let i = 0; i < data.stations.length; i++) {
        sleigh.addStation(i + 1, data.stations[i].stationDuration);
      }
      // sleigh.bindPopup('I am a circle.');

      sleigh.start();
    },
  });
}

// --------------------------------------------------
// FUNCTIONS
// --------------------------------------------------
function toggleFollow() {
  if (isFollowing) {
    sleigh.unfollow();
    followButton.innerText = 'Follow';
  } else {
    sleigh.follow();
    followButton.innerText = 'Unfollow';
  }

  isFollowing = !isFollowing;
}

startup();
