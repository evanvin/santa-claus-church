function CountdownTime() {
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

  return santaLiftOff;
}

setTimeout(function () {
  document.getElementsByClassName('jingle-bells-video')[0].muted = false;
  document.getElementsByClassName('jingle-bells-video')[0].play();
}, 2000);
