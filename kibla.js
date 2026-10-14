// kibla.js - Real-time Rotating Qibla Compass Logic
window.initQiblaCompass = function() {
  const statusEl = document.getElementById('qiblaStatus');
  const needleEl = document.getElementById('compassNeedle');
  
  if (!navigator.geolocation) {
    if (statusEl) statusEl.innerText = "Geolocation not supported.";
    return;
  }

  if (statusEl) statusEl.innerText = "Acquiring GPS location...";

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

      // Handle iOS 13+ permission request for device orientation
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(response => {
          if (response === 'granted') {
            setupOrientationListener(qibla, needleEl, statusEl);
          }
        }).catch(err => console.log("Orientation permission error:", err));
      } else {
        setupOrientationListener(qibla, needleEl, statusEl);
      }
    },
    (error) => {
      if (statusEl) statusEl.innerText = "Location permission denied or unavailable.";
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};

function setupOrientationListener(qibla, needleEl, statusEl) {
  window.addEventListener('deviceorientation', (event) => {
    let heading = null;
    if (event.webkitCompassHeading !== undefined) {
      heading = event.webkitCompassHeading; // iOS Safari
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha; // Android Chrome
    }

    if (heading !== null && needleEl) {
      let finalRotation = qibla - heading;
      needleEl.style.transform = `rotate(${finalRotation}deg)`;
      if (statusEl) {
        statusEl.innerText = `Qibla: ${qibla.toFixed(1)}° | Heading: ${heading.toFixed(0)}°`;
      }
    }
  }, true);
}
