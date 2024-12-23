const sleighBellsAudio = new Audio("../sound/sleigh_bells.wav");
sleighBellsAudio.volume = 0.3;
sleighBellsAudio.loop = true;

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};
const STATION_ICONS = [
  L.icon({
    iconUrl: "../images/icons/markers/christmas-sock.png",
    iconSize: [32, 32],
  }),
  L.icon({
    iconUrl: "../images/icons/markers/christmas-wreath.png",
    iconSize: [32, 32],
  }),
  L.icon({
    iconUrl: "../images/icons/markers/gifts.png",
    iconSize: [32, 32],
  }),
];

L.interpolatePosition = function (p1, p2, duration, t) {
  var k = t / duration;
  k = k > 0 ? k : 0;
  k = k > 1 ? 1 : k;
  return L.latLng(
    p1.lat + k * (p2.lat - p1.lat),
    p1.lng + k * (p2.lng - p1.lng)
  );
};

L.Marker.MovingMarker = L.Marker.extend({
  //state constants
  statics: {
    notStartedState: 0,
    endedState: 1,
    pausedState: 2,
    runState: 3,
  },

  options: {
    autostart: false,
    loop: false,
    autofollow: false,
    stationInfo: [],
    departureBoard: null,
  },

  initialize: function (latlngs, durations, options) {
    L.Marker.prototype.initialize.call(this, latlngs[0], options);

    this._latlngs = latlngs.map(function (e, index) {
      return L.latLng(e);
    });

    if (durations instanceof Array) {
      this._durations = durations;
    } else {
      this._durations = this._createDurations(this._latlngs, durations);
    }

    this._currentDuration = 0;
    this._currentIndex = 0;

    this._state = L.Marker.MovingMarker.notStartedState;
    this._startTime = 0;
    this._startTimeStamp = 0; // timestamp given by requestAnimFrame
    this._pauseStartTime = 0;
    this._animId = 0;
    this._animRequested = false;
    this._currentLine = [];
    this._stations = {};
    this._stationInfo = [];
    this._follow = false;
    this._play_sound = true;
    this._departureBoard = null;
    this._presentsDelivered = 0;
    this._isAtStation = false;
  },

  isRunning: function () {
    return this._state === L.Marker.MovingMarker.runState;
  },

  isEnded: function () {
    return this._state === L.Marker.MovingMarker.endedState;
  },

  isStarted: function () {
    return this._state !== L.Marker.MovingMarker.notStartedState;
  },

  isPaused: function () {
    return this._state === L.Marker.MovingMarker.pausedState;
  },

  isFollowing: function () {
    return this._follow;
  },

  isPlayingSound: function () {
    return this._play_sound;
  },

  start: function () {
    if (this.isRunning()) {
      return;
    }

    if (this.isPaused()) {
      this.resume();
    } else {
      this._loadLine(0);
      this._startAnimation();
      this.fire("start");
    }
  },

  resume: function () {
    if (!this.isPaused()) {
      return;
    }
    // update the current line
    this._currentLine[0] = this.getLatLng();
    this._currentDuration -= this._pauseStartTime - this._startTime;
    this._startAnimation();
  },

  pause: function () {
    if (!this.isRunning()) {
      return;
    }

    this._pauseStartTime = Date.now();
    this._state = L.Marker.MovingMarker.pausedState;
    this._stopAnimation();
    this._updatePosition();
  },

  follow: function () {
    if (this.isFollowing()) {
      return;
    }

    this._map.setView(this.getLatLng(), 6);

    this._follow = true;
  },

  unfollow: function () {
    if (!this.isFollowing()) {
      return;
    }

    this._follow = false;
  },

  muteSound: function () {
    if (!this.isPlayingSound()) {
      return;
    }

    // stop playing sound
    sleighBellsAudio.pause();

    this._play_sound = false;
  },

  playSound: function () {
    if (this.isPlayingSound()) {
      return;
    }

    // start playing sound
    sleighBellsAudio.play();
    sleighBellsAudio.loop = true;
    this._play_sound = true;
  },

  stop: function (elapsedTime) {
    if (this.isEnded()) {
      return;
    }

    this._stopAnimation();

    if (typeof elapsedTime === "undefined") {
      // user call
      elapsedTime = 0;
      this._updatePosition();
    }

    this._state = L.Marker.MovingMarker.endedState;
    this.fire("end", { elapsedTime: elapsedTime });
  },

  addLatLng: function (latlng, duration) {
    this._latlngs.push(L.latLng(latlng));
    this._durations.push(duration);
  },

  moveTo: function (latlng, duration) {
    this._stopAnimation();
    this._latlngs = [this.getLatLng(), L.latLng(latlng)];
    this._durations = [duration];
    this._state = L.Marker.MovingMarker.notStartedState;
    this.start();
    this.options.loop = false;
  },

  addStation: function (pointIndex, duration) {
    if (pointIndex > this._latlngs.length - 2 || pointIndex < 1) {
      return;
    }
    this._stations[pointIndex] = duration;
  },

  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);

    if (this.options.autostart && !this.isStarted()) {
      this.start();
      return;
    }

    if (this.options.autofollow) {
      this._follow = true;
    }

    if (this.options.stationInfo) {
      this._stationInfo = this.options.stationInfo;
    }

    if (this.options.departureBoard) {
      this._departureBoard = this.options.departureBoard;
    }

    if (this.isRunning()) {
      this._resumeAnimation();
    }
  },

  onRemove: function (map) {
    L.Marker.prototype.onRemove.call(this, map);
    this._stopAnimation();
  },

  _createDurations: function (latlngs, duration) {
    var lastIndex = latlngs.length - 1;
    var distances = [];
    var totalDistance = 0;
    var distance = 0;

    // compute array of distances between points
    for (var i = 0; i < lastIndex; i++) {
      distance = latlngs[i + 1].distanceTo(latlngs[i]);
      distances.push(distance);
      totalDistance += distance;
    }

    var ratioDuration = duration / totalDistance;

    var durations = [];
    for (i = 0; i < distances.length; i++) {
      durations.push(distances[i] * ratioDuration);
    }

    return durations;
  },

  _startAnimation: function () {
    this._state = L.Marker.MovingMarker.runState;
    this._animId = L.Util.requestAnimFrame(
      function (timestamp) {
        this._startTime = Date.now();
        this._startTimeStamp = timestamp;
        this._animate(timestamp);
      },
      this,
      true
    );
    this._animRequested = true;
  },

  _spaceHelper: function (left, right) {
    width = this._departureBoard.getLetterCount();
    right = right.padStart(width - left.length - 1, " "); // +1 is for the colon
    return `${left}:${right}`;
  },

  _resumeAnimation: function () {
    if (!this._animRequested) {
      this._animRequested = true;
      this._animId = L.Util.requestAnimFrame(
        function (timestamp) {
          this._animate(timestamp);
        },
        this,
        true
      );
    }
  },

  _stopAnimation: function () {
    if (this._animRequested) {
      L.Util.cancelAnimFrame(this._animId);
      this._animRequested = false;
    }
  },

  _updatePosition: function () {
    var elapsedTime = Date.now() - this._startTime;
    this._animate(this._startTimeStamp + elapsedTime, true);
  },

  _loadLine: function (index) {
    this._currentIndex = index;
    this._currentDuration = this._durations[index];
    this._currentLine = this._latlngs.slice(index, index + 2);
    if (index > 0) {
      L.marker(this._currentLine[0], { icon: STATION_ICONS.sample() }).addTo(
        this._map
      );
    }
    this._updateFlightInfo();
  },

  _updateFlightInfo: function () {
    if (this._departureBoard) {
      let station = this._stationInfo[this._currentIndex];
      let autc = station.arrivalUTC;
      let nextCity = `${station.city}, ${station.region}`;
      let presents = "presents delivered".padStart(
        this._departureBoard.getLetterCount() - 17,
        " "
      );
      this._departureBoard.setValue([
        this._spaceHelper("current", "flying"),
        this._spaceHelper("population", "-"),
        "",
        this._spaceHelper(
          "next stop",
          nextCity.length > 34 ? station.city : nextCity
        ),
        this._spaceHelper(
          "arrival time (utc)",
          `${autc.hour}:${autc.minute.toString().padStart(2, "0")}`
        ),
        "",
        this._spaceHelper(
          presents,
          station.presentsDeliveredAtLastLocation.toLocaleString("en-US")
        ),
      ]);

      this._departureBoard.setMobileValue(
        false,
        null,
        "Flying",
        "-",
        nextCity.length > 34 ? station.city : nextCity,
        `${autc.hour}:${autc.minute.toString().padStart(2, "0")}`,
        station.presentsDeliveredAtLastLocation.toLocaleString("en-US")
      );
    }
  },

  _updateDeliveryInfo: function () {
    if (this._departureBoard && !this._isAtStation) {
      let station = this._stationInfo[this._currentIndex];
      let boardValue = [];
      if (station.id !== "landing") {
        let currentCity = `${station.city}, ${station.region}`;
        let nextStation = this._stationInfo[this._currentIndex + 1];
        let nextCity = `${nextStation.city}, ${nextStation.region}`;
        let dutc = station.departureUTC;
        let presents = "presents delivered".padStart(
          this._departureBoard.getLetterCount() - 17,
          " "
        );
        boardValue = [
          this._spaceHelper(
            "current",
            currentCity.length > 34 ? station.city : currentCity
          ),
          this._spaceHelper(
            "population",
            station.population.toLocaleString("en-US")
          ),
          "",
          this._spaceHelper(
            "next stop",
            nextCity.length > 34 ? nextStation.city : nextCity
          ),
          this._spaceHelper(
            "departure time (utc)",
            `${dutc.hour}:${dutc.minute.toString().padStart(2, "0")}`
          ),
          "",
          this._spaceHelper(
            presents,
            station.presentsDeliveredAtLastLocation.toLocaleString("en-US")
          ),
        ];

        this._departureBoard.setMobileValue(
          false,
          null,
          currentCity.length > 34 ? station.city : currentCity,
          station.population.toLocaleString("en-US"),
          nextCity.length > 34 ? nextStation.city : nextCity,
          `${dutc.hour}:${dutc.minute.toString().padStart(2, "0")}`,
          station.presentsDeliveredAtLastLocation.toLocaleString("en-US")
        );
      } else {
        this._departureBoard.setMobileValue(true, boardValue);
      }
      this._departureBoard.setValue(boardValue);
      this._isAtStation = true;
    }
  },

  _animatePresentCounter: function (obj, initVal, lastVal, duration) {
    let startTime = null;

    //get the current timestamp and assign it to the currentTime variable
    let currentTime = Date.now();

    //pass the current timestamp to the step function
    const step = (currentTime) => {
      //if the start time is null, assign the current time to startTime
      if (!startTime) {
        startTime = currentTime;
      }

      //calculate the value to be used in calculating the number to be displayed
      const progress = Math.min((currentTime - startTime) / duration, 1);

      //calculate what to be displayed using the value gotten above
      obj.innerHTML = Math.floor(
        progress * (lastVal - initVal) + initVal
      ).toLocaleString("en-US");

      //checking to make sure the counter does not exceed the last value (lastVal)
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        window.cancelAnimationFrame(window.requestAnimationFrame(step));
      }
    };

    //start animating
    window.requestAnimationFrame(step);
  },

  /**
   * Load the line where the marker is
   * @param  {Number} timestamp
   * @return {Number} elapsed time on the current line or null if
   * we reached the end or marker is at a station
   */
  _updateLine: function (timestamp) {
    // time elapsed since the last latlng
    var elapsedTime = timestamp - this._startTimeStamp;

    // not enough time to update the line
    if (elapsedTime <= this._currentDuration) {
      return elapsedTime;
    }

    var lineIndex = this._currentIndex;
    var lineDuration = this._currentDuration;
    var stationDuration;

    while (elapsedTime > lineDuration) {
      // substract time of the current line
      elapsedTime -= lineDuration;
      stationDuration = this._stations[lineIndex + 1];

      // test if there is a station at the end of the line
      if (stationDuration !== undefined) {
        if (elapsedTime < stationDuration) {
          this.setLatLng(this._latlngs[lineIndex + 1]);
          return null;
        }
        elapsedTime -= stationDuration;
      }

      lineIndex++;

      // test if we have reached the end of the polyline
      if (lineIndex >= this._latlngs.length - 1) {
        if (this.options.loop) {
          lineIndex = 0;
          this.fire("loop", { elapsedTime: elapsedTime });
        } else {
          // place the marker at the end, else it would be at
          // the last position
          this.setLatLng(this._latlngs[this._latlngs.length - 1]);
          this.stop(elapsedTime);
          return null;
        }
      }
      lineDuration = this._durations[lineIndex];
    }

    this._loadLine(lineIndex);
    this._startTimeStamp = timestamp - elapsedTime;
    this._startTime = Date.now() - elapsedTime;
    this._isAtStation = false;
    return elapsedTime;
  },

  _animate: function (timestamp, noRequestAnim) {
    this._animRequested = false;

    // find the next line and compute the new elapsedTime
    var elapsedTime = this._updateLine(timestamp);

    if (this.isEnded()) {
      // no need to animate
      return;
    }

    if (elapsedTime != null) {
      // compute the position
      var p = L.interpolatePosition(
        this._currentLine[0],
        this._currentLine[1],
        this._currentDuration,
        elapsedTime
      );
      this.setLatLng(p);

      if (this.isFollowing()) {
        this._map.setView(p);
      }
    } else {
      this._updateDeliveryInfo();
    }

    if (!noRequestAnim) {
      this._animId = L.Util.requestAnimFrame(this._animate, this, false);
      this._animRequested = true;
    }
  },
});

L.Marker.movingMarker = function (latlngs, duration, options) {
  return new L.Marker.MovingMarker(latlngs, duration, options);
};
