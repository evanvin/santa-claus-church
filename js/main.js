function Subscribe() {
  let emailInput = document.getElementById("email-input");
  let val = emailInput.value;
  emailInput.value = "Thank You!";

  let submitButton = document.getElementById("submit");
  submitButton.disabled = true;

  url =
    "https://cors-anywhere.herokuapp.com/https://clovereartquakedog.pythonanywhere.com/santa/email/sub";
  url = "https://clovereartquakedog.pythonanywhere.com/santa/email/sub";
  $.ajax({
    headers: { Accept: "application/json" },
    type: "POST",
    url: url,
    data: {
      email: val,
    },
    dataType: "json",
    success: function (data, textStatus, request) {
      submitButton.disabled = false;
    },
    error: function (jqXHR, textStatus, errorThrown) {
      submitButton.disabled = false;
    },
  });
}

function CountdownTime() {
  const now = new Date(); // Current date and time
  const currentYear = now.getFullYear();

  // Dec 24, 21:00:00 for the current year
  const santaLiftOff = new Date(currentYear, 11, 24, 21, 0, 0); // Month is 0-based, so 11 = December

  // Dec 26, 00:00:00 for the current year
  const cutoffDate = new Date(currentYear, 11, 26, 0, 0, 0);

  // If the current date is after the cutoff, return Dec 24, 21:00:00 of the next year
  if (now > cutoffDate) {
    return new Date(currentYear + 1, 11, 24, 21, 0, 0);
  }

  // Otherwise, return Dec 24, 21:00:00 of the current year
  return santaLiftOff;
}

// setTimeout(function () {
//   document.getElementsByClassName("jingle-bells-video")[0].muted = false;
//   document.getElementsByClassName("jingle-bells-video")[0].play();
// }, 2000);

document.getElementById("submit").addEventListener("click", Subscribe);

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
