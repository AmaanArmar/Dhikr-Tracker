// kibla.js - Standalone Qibla Module
function initQiblaCompass() {
  const statusEl = document.getElementById('qiblaStatus');
  const needleEl = document.getElementById('compassNeedle');
  
  if (statusEl) statusEl.innerText = "Finding location...";

  if (!navigator.geolocation) {
    if (statusEl) statusEl.innerText = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      const kaabaLat = 21.4225;
      const kaabaLng = 39.8262;

      const phiK = (kaabaLat * Math.PI) / 180;
      const lambdaK = (kaabaLng * Math.PI) / 180;
      const phi = (lat * Math.PI) / 180;
      const lambda = (lng * Math.PI) / 180;

      const y = Math.sin(lambdaK - lambda);
      const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
      let qibla = Math.atan2(y, x);
      qibla = (qibla * 180) / Math.PI;
      qibla = (qibla + 360) % 360;

      if (statusEl) statusEl.innerText = `Qibla: ${qibla.toFixed(1)}° from North`;
      if (needleEl) {
        needleEl.style.transform = `rotate(${qibla}deg)`;
      }

      startCompassTracking(qibla, needleEl, statusEl);
    },
    (error) => {
      if (statusEl) statusEl.innerText = "Location permission denied or unavailable.";
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

function startCompassTracking(qiblaAngle, needleEl, statusEl) {
  const handleOrientation = (event) => {
    let heading = null;
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null && needleEl) {
      let compassRotation = (qiblaAngle - heading + 360) % 360;
      needleEl.style.transform = `rotate(${compassRotation}deg)`;
      if (statusEl) {
        statusEl.innerText = `Qibla: ${qiblaAngle.toFixed(1)}° | Heading: ${heading.toFixed(0)}°`;
      }
    }
  };

  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
  window.addEventListener('deviceorientation', handleOrientation, true);
}
