// kibla.js - Standalone Qibla Compass Module

window.initQiblaCompass = function() {
  const statusEl = document.getElementById('qibla-status');
  const needleEl = document.getElementById('qibla-needle');
  
  if (statusEl) statusEl.innerText = "Acquiring GPS location...";

  if (!navigator.geolocation) {
    if (statusEl) statusEl.innerText = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      const kaabaLat = 21.4225;
      const kaabaLng = 39.8262;

      // Spherical Trigonometry Formula for Qibla Bearing
      const phiK = (kaabaLat * Math.PI) / 180;
      const lambdaK = (kaabaLng * Math.PI) / 180;
      const phi = (lat * Math.PI) / 180;
      const lambda = (lng * Math.PI) / 180;

      const y = Math.sin(lambdaK - lambda);
      const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
      let qiblaAngle = Math.atan2(y, x);
      qiblaAngle = (qiblaAngle * 180) / Math.PI;
      qiblaAngle = (qiblaAngle + 360) % 360;

      if (statusEl) {
        statusEl.innerText = `Qibla: ${qiblaAngle.toFixed(1)}° from North`;
      }
      
      if (needleEl) {
        needleEl.style.transform = `rotate(${qiblaAngle}deg)`;
      }

      // Handle iOS 13+ Device Orientation Permission
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(response => {
          if (response === 'granted') {
            startCompassTracking(qiblaAngle, needleEl, statusEl);
          } else {
            if (statusEl) statusEl.innerText = "Compass permission denied in browser settings.";
          }
        }).catch(err => {
          console.error(err);
          startCompassTracking(qiblaAngle, needleEl, statusEl);
        });
      } else {
        // Standard Android / Desktop Tracking
        startCompassTracking(qiblaAngle, needleEl, statusEl);
      }
    },
    (error) => {
      let errorMsg = "Unable to retrieve GPS location.";
      if (error.code === error.PERMISSION_DENIED) {
        errorMsg = "Location permission denied. Please allow location access.";
      }
      if (statusEl) statusEl.innerText = errorMsg;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
};

function startCompassTracking(qiblaAngle, needleEl, statusEl) {
  let trackerAttached = false;

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

  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    trackerAttached = true;
  }
  
  if (!trackerAttached) {
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}
