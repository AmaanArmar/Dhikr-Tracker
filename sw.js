// sw.js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Dhikr Reminder';
  const options = {
    body: data.body || 'Time to go back to the remembrance of Allah.',
    icon: 'icon.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

