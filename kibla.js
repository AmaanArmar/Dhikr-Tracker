window.initQiblaCompass = function() {
  const statusEl = document.getElementById('qiblaStatus');
  const needleEl = document.getElementById('compassNeedle');
  
  if (!navigator.geolocation) {
    if (statusEl) statusEl.innerText = "Geolocation not supported.";
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

      if (statusEl) statusEl.innerText = `Qibla: ${qibla.toFixed(1)}° from North`;
      if (needleEl) {
        needleEl.style.transform = `rotate(${qibla}deg)`;
      }

      // Handle iOS 13+ permission request if present
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(response => {
          if (response === 'granted') {
            startCompassTracking(qibla, needleEl, statusEl);
          } else {
            alert("Compass orientation permission was denied.");
          }
        }).catch(console.error);
      } else {
        startCompassTracking(qibla, needleEl, statusEl);
      }
    },
    (error) => {
      let errorMsg = "Unable to retrieve GPS location.";
      if (error.code === error.PERMISSION_DENIED) {
        errorMsg = "Location permission denied. Please enable Location in site settings.";
      }
      if (statusEl) statusEl.innerText = errorMsg;
      alert(errorMsg);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
};

function startCompassTracking(qiblaAngle, needleEl, statusEl) {
  const handleOrientation = (event) => {
    let heading = null;

    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      // iOS Safari
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android Chrome (use absolute orientation or fallback alpha)
      heading = event.absolute ? event.alpha : (360 - event.alpha);
    }

    if (heading !== null && needleEl) {
      let compassRotation = qiblaAngle - heading;
      needleEl.style.transform = `rotate(${compassRotation}deg)`;
      if (statusEl) {
        statusEl.innerText = `Qibla: ${qiblaAngle.toFixed(1)}° | Device Heading: ${heading.toFixed(0)}°`;
      }
    }
  };

  // Listen to deviceorientationabsolute for Android Chrome, fallback to deviceorientation
  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
  } else {
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}
