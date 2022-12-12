Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

//EVENT LISTENERS

// ELEMENTS
let sleigh;
let isFollowing = false;
let isPlayingSound = false;

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

// Sound Button
let soundSpan = document.createElement('span');
soundSpan.textContent = '🔇';
let soundButton = document.createElement('a');
soundButton.classList.add('leaflet-control-zoom-out');
soundButton.setAttribute('role', 'button');
soundButton.setAttribute('title', 'Sound');
soundButton.setAttribute('aria-label', 'Sound');
soundButton.setAttribute('href', '#');
soundButton.appendChild(soundSpan);
zoomControls.appendChild(soundButton);
soundButton.addEventListener('click', toggleSound);

var sleighIcon = L.icon({
  iconUrl: '../images/icons/markers/sleigh.png',
  iconSize: [32, 32],
});

function getCurrentTimeInSecs() {
  let santaLiftOff = new Date(Date.UTC(1992, 11, 24, 21, 0, 0));
  let santaNextDayBuffer = new Date(Date.UTC(1992, 11, 25, 22, 0, 1));

  // Get todays date
  let now = new Date();
  let currentYear = now.getFullYear();

  // Set santaLiftOff year
  santaLiftOff.setFullYear(currentYear);

  // Set santaNextDayBuffer year
  santaNextDayBuffer.setFullYear(currentYear + 1);

  if (now > santaLiftOff) {
    // Santa has started his night

    if (now > santaNextDayBuffer) {
      // Santa has finished
      return -1;
    }

    // Santa is still delivering
    let dif = now.getTime() - santaLiftOff.getTime();

    let seconds = dif / 1000;
    return Math.abs(seconds);
  }

  return -1;
}

function startup() {
  let seconds = getCurrentTimeInSecs();

  if (seconds < 0) {
    // Santa hasn't left yet
    board.setValue(["Ho Ho Ho! Santa hasn't left yet...","","Come back around 8PM UTC time on the 24th!"])
  } else {
    // Santa is in flight
    url =
      'https://cors-anywhere.herokuapp.com/https://clovereartquakedog.pythonanywhere.com/santa/route/58';
    url = `https://clovereartquakedog.pythonanywhere.com/santa/route/${seconds}`;
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

        sleigh.start();
      },
    });
  }
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

function toggleSound() {
  if (isPlayingSound) {
    sleigh.muteSound();
    soundButton.textContent = '🔇';
  } else {
    sleigh.playSound();
    soundButton.textContent = '🔈';
  }

  isPlayingSound = !isPlayingSound;
}

startup();
