// kibla.js - Unwrapped & Smooth Sensor-Tracking Qibla Module

let currentDisplayedRotation = 0; // Tracks global rotation angle across continuous turns

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
        currentDisplayedRotation = qiblaAngle;
        needleEl.style.transform = `translate(-50%, -100%) rotate(${qiblaAngle}deg)`;
      }

      // iOS 13+ Orientation Permission Handler
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(response => {
          if (response === 'granted') {
            startCompassTracking(qiblaAngle, needleEl, statusEl);
          } else {
            if (statusEl) statusEl.innerText = "Compass permission denied in settings.";
          }
        }).catch(err => {
          console.error(err);
          startCompassTracking(qiblaAngle, needleEl, statusEl);
        });
      } else {
        startCompassTracking(qiblaAngle, needleEl, statusEl);
      }
    },
    (error) => {
      let errorMsg = "Unable to retrieve GPS location.";
      if (error.code === error.PERMISSION_DENIED) {
        errorMsg = "Location permission denied. Please allow access.";
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

    // Retrieve device heading
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading; // iOS Safari
    } else if (event.alpha !== null) {
      heading = (360 - event.alpha) % 360; // Standard Android Chrome
    }

    if (heading !== null && needleEl) {
      // Calculate target rotation relative to north
      let targetDegree = (qiblaAngle - heading + 360) % 360;

      // --- SHORTEST PATH ANGLE UNWRAPPING (Prevents 360° Wild Spins) ---
      let delta = targetDegree - (currentDisplayedRotation % 360);
      
      if (delta < -180) {
        delta += 360;
      } else if (delta > 180) {
        delta -= 360;
      }

      // Continuously accumulate rotation angle without snap back
      currentDisplayedRotation += delta;

      // Apply transformation cleanly anchored to center dot
      needleEl.style.transform = `translate(-50%, -100%) rotate(${currentDisplayedRotation}deg)`;
      
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
