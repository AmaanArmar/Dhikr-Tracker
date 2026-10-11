// kibla.js - Qibla Direction & Rotating Compass Logic

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

let qiblaBearing = 0;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('qibla-btn');
  if (btn) {
    btn.addEventListener('click', initQiblaCompass);
  }
});

function initQiblaCompass() {
  const statusEl = document.getElementById('qibla-status');
  
  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  if (statusEl) statusEl.textContent = "Acquiring GPS location...";

  navigator.geolocation.getCurrentPosition(
    position => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      
      qiblaBearing = calculateQiblaBearing(userLat, userLng);
      if (statusEl) statusEl.textContent = `Qibla Direction: ${qiblaBearing.toFixed(1)}° from North`;
      
      // Handle iOS 13+ sensor permissions explicitly on user click
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, true);
              hideCompassButton();
            } else {
              if (statusEl) statusEl.textContent = "Compass permission denied.";
            }
          })
          .catch(err => console.error(err));
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
        hideCompassButton();
      }
    },
    error => {
      if (statusEl) statusEl.textContent = "Location access needed to calculate Qibla.";
    }
  );
}

function calculateQiblaBearing(lat1, lng1) {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = KAABA_LAT * rad;
  const deltaLambda = (KAABA_LNG - lng1) * rad;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

function handleOrientation(event) {
  let heading = event.webkitCompassHeading || (event.alpha ? 360 - event.alpha : 0);
  
  if (heading !== null && heading !== undefined) {
    let needleAngle = qiblaBearing - heading;
    const needle = document.getElementById('qibla-needle');
    if (needle) {
      needle.style.transform = `rotate(${needleAngle}deg)`;
    }
  }
}

function hideCompassButton() {
  const btn = document.getElementById('qibla-btn');
  if (btn) btn.style.display = 'none';
}
