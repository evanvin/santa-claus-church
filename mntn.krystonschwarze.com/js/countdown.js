// Get Santa Lift off Date
let santaLiftOff = new Date('Dec 24, 1992 21:00:00');

// Get todays date
let now = new Date();
let currentYear = now.getFullYear();

// Set santaLiftOff year
santaLiftOff.setFullYear(currentYear);

if (now > santaLiftOff) {
  santaLiftOff.setFullYear(currentYear + 1);
}

// Update the count down every 1 second
let x = setInterval(function () {
  // Get today's date and time
  let now = new Date().getTime();

  // Find the distance between now and the count down date
  let distance = santaLiftOff - now;

  // Time calculations for days, hours, minutes and seconds
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById('countdown').innerHTML =
    days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById('countdown').innerHTML = 'EXPIRED';
  }
}, 1000);
