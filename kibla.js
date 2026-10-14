window.initQiblaCompass = function() {
  const statusEl = document.getElementById('qiblaStatus');
  const needleEl = document.getElementById('compassNeedle');
  
  if (!navigator.geolocation) {
    if (statusEl) statusEl.innerText = "Error: Geolocation not supported.";
    alert("Geolocation is not supported by your browser.");
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

      if (statusEl) statusEl.innerText = `GPS OK. Qibla: ${qibla.toFixed(1)}°. Requesting sensors...`;

      // Handle iOS 13+ permission request
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              startCompassTracking(qibla, needleEl, statusEl);
            } else {
              if (statusEl) statusEl.innerText = "Sensor permission denied (iOS).";
            }
          })
          .catch(err => {
            if (statusEl) statusEl.innerText = "Sensor error: " + err.message;
          });
      } else {
        // Android / Standard Browsers
        startCompassTracking(qibla, needleEl, statusEl);
      }
    },
    (error) => {
      let errorMsg = "GPS Failed: ";
      if (error.code === error.PERMISSION_DENIED) {
        errorMsg += "Location permission denied.";
      } else {
        errorMsg += error.message;
      }
      if (statusEl) statusEl.innerText = errorMsg;
      alert(errorMsg);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
};

function startCompassTracking(qiblaAngle, needleEl, statusEl) {
  let sensorDetected = false;

  const handleOrientation = (event) => {
    let heading = null;

    // 1. Check iOS Safari specific compass property
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading;
    } 
    // 2. Check Android / Standard alpha property
    else if (event.alpha !== null && event.alpha !== undefined) {
      // Normalizing alpha to a 0-360 degree heading
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null) {
      sensorDetected = true;
      let compassRotation = (qiblaAngle - heading + 360) % 360;
      
      if (needleEl) {
        needleEl.style.transform = `rotate(${compassRotation}deg)`;
        needleEl.style.transition = 'transform 0.1s ease-out'; // Smooth out jitter
      }

      if (statusEl) {
        statusEl.innerText = `Qibla: ${qiblaAngle.toFixed(1)}° | Heading: ${heading.toFixed(0)}° | Rot: ${compassRotation.toFixed(0)}°`;
      }
    } else {
      if (!sensorDetected && statusEl) {
        statusEl.innerText = `GPS OK (${qiblaAngle.toFixed(1)}°), but device sensors (alpha/heading) returning null. Try moving phone in figure-8.`;
      }
    }
  };

  // Attach both listeners for maximum compatibility
  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
  window.addEventListener('deviceorientation', handleOrientation, true);
}
