function Subscribe() {
  let emailInput = document.getElementById('email-input');
  let val = emailInput.value;
  emailInput.value = 'Thank You!';

  let submitButton = document.getElementById('submit');
  submitButton.disabled = true;

  url =
    'https://cors-anywhere.herokuapp.com/https://clovereartquakedog.pythonanywhere.com/santa/email/sub';
  url = 'https://clovereartquakedog.pythonanywhere.com/santa/email/sub';
  $.ajax({
    headers: { Accept: 'application/json' },
    type: 'POST',
    url: url,
    data: {
      email: val,
    },
    dataType: 'json',
    success: function (data, textStatus, request) {
      console.log(emailInput.value);
      submitButton.disabled = false;
    },
    error: function (jqXHR, textStatus, errorThrown) {
      submitButton.disabled = false;
    },
  });
}

function CountdownTime() {
  // Get Santa Lift off Date
  let santaLiftOff = new Date(Date.UTC('Dec 24, 1992 21:00:00'));

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

document.getElementById('submit').addEventListener('click', Subscribe);

/*
let sinatraVideo = document.getElementById('sinatra');

function repositionVideo() {
  let windowHeight = window.innerHeight;
  let sinatraBtm = Number(
    window
      .getComputedStyle(sinatraVideo, null)
      .getPropertyValue('bottom')
      .replace('px', '')
  );
  let btm = `${
    windowHeight + window.scrollY - sinatraBtm - sinatraVideo.offsetHeight
  }px`;
  sinatraVideo.style.top = btm;
}

window.addEventListener('scroll', repositionVideo);
window.addEventListener('resize', repositionVideo);
*/
