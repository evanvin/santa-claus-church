console.clear();

function CountdownTracker(label, value) {
  let el = document.createElement('span');

  el.className = 'flip-clock__piece';
  el.innerHTML =
    '<b class="flip-clock__card flipcard"><b class="flipcard__top"></b><b class="flipcard__bottom"></b><b class="flipcard__back"><b class="flipcard__bottom"></b></b></b>' +
    '<span class="flip-clock__slot">' +
    label +
    '</span>';

  this.el = el;

  let top = el.querySelector('.flipcard__top'),
    bottom = el.querySelector('.flipcard__bottom'),
    back = el.querySelector('.flipcard__back'),
    backBottom = el.querySelector('.flipcard__back .flipcard__bottom');

  this.update = function (val) {
    // val = ('0' + val).slice(-2);
    if (val !== this.currentValue) {
      if (this.currentValue >= 0) {
        back.setAttribute('data-value', this.currentValue);
        bottom.setAttribute('data-value', this.currentValue);
      }
      this.currentValue = val;
      top.innerText = this.currentValue;
      backBottom.setAttribute('data-value', this.currentValue);

      this.el.classList.remove('flip');
      void this.el.offsetWidth;
      this.el.classList.add('flip');
    }
  };

  console.log(value, label);
  this.update(value);
}

// Calculation adapted from https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/

function getTimeRemaining(endtime) {
  let t = Date.parse(endtime) - Date.parse(new Date());
  return {
    Total: t,
    Days: Math.floor(t / (1000 * 60 * 60 * 24)),
    Hours: Math.floor((t / (1000 * 60 * 60)) % 24),
    Minutes: Math.floor((t / 1000 / 60) % 60),
    Seconds: Math.floor((t / 1000) % 60),
  };
}

function getTime() {
  let t = new Date();
  return {
    Total: t,
    Hours: t.getHours() % 12,
    Minutes: t.getMinutes(),
    Seconds: t.getSeconds(),
  };
}

function Clock(countdown, callback) {
  countdown = countdown ? new Date(Date.parse(countdown)) : false;
  callback = callback || function () {};

  let updateFn = countdown ? getTimeRemaining : getTime;

  this.el = document.createElement('div');
  this.el.className = 'flip-clock';

  let trackers = {},
    t = updateFn(countdown),
    key,
    timeinterval;

  for (key in t) {
    if (key === 'Total') {
      continue;
    }
    trackers[key] = new CountdownTracker(key, t[key]);
    this.el.appendChild(trackers[key].el);
  }

  let i = 0;
  function updateClock() {
    timeinterval = requestAnimationFrame(updateClock);

    // throttle so it's not constantly updating the time.
    if (i++ % 10) {
      return;
    }

    let t = updateFn(countdown);
    if (t.Total < 0) {
      cancelAnimationFrame(timeinterval);
      for (key in trackers) {
        trackers[key].update(0);
      }
      callback();
      return;
    }

    for (key in trackers) {
      trackers[key].update(t[key]);
    }
  }

  setTimeout(updateClock, 500);
}

let deadline = new Date(Date.parse(new Date()) + 12 * 24 * 60 * 60 * 1000);
deadline = new CountdownTime();
let c = new Clock(deadline, function () {
  alert('countdown complete');
});

document.getElementById('countdown').appendChild(c.el);
