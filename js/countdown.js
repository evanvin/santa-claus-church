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
