Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

//EVENT LISTENERS

// ELEMENTS
let sleigh;
let isFollowing = false;

const board = new DepartureBoard(document.getElementById('info-board'), {
  rowCount: 7,
  letterCount: 48,
});

// Map Initilization
var bounds = L.latLngBounds(
  L.latLng(-89.98155760646617, -180), // Southwest
  L.latLng(89.99346179538875, 180) // Northeast
);
var map = L.map('map', {
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 2,
  detectRetina: true,
}).setView([70.1170759479725, 26.30972185655632], 3);
document.getElementsByClassName('leaflet-control-attribution')[0].remove();
var el = document.getElementById('infoPanel');

L.tileLayer(
  // 'https://api.mapbox.com/styles/v1/evanvin/cl59rnki2000014s1jy5svp8t/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZXZhbnZpbiIsImEiOiJjam81dGg1MGwwZHdkM3ZwYWh5NHJmdWZ3In0.P3Gr9yuJvVVfy0ZvRHsWzA',
  'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: 'Santa Claus Tracker',
  }
).addTo(map);

// Follow Button
let zoomControls = document.getElementsByClassName('leaflet-control-zoom')[0];
let followSpan = document.createElement('span');
followSpan.textContent = 'f';
let followButton = document.createElement('a');
followButton.classList.add('leaflet-control-zoom-out');
followButton.setAttribute('role', 'button');
followButton.setAttribute('title', 'Follow');
followButton.setAttribute('aria-label', 'Follow');
followButton.setAttribute('href', '#');
followButton.appendChild(followSpan);
zoomControls.appendChild(followButton);
followButton.addEventListener('click', toggleFollow);

var sleighIcon = L.icon({
  iconUrl: '../images/icons/markers/sleigh.png',
  iconSize: [32, 32],
});

function startup() {
  url =
    'https://cors-anywhere.herokuapp.com/https://clovereartquakedog.pythonanywhere.com/santa/route/58';
  url =
    'https://clovereartquakedog.pythonanywhere.com/santa/route/58';
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
        departureBoard: board,
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
    followButton.textContent = 'f';
  } else {
    sleigh.follow();
    followButton.textContent = 'u';
  }

  isFollowing = !isFollowing;
}

startup();
