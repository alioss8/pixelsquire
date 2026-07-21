self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/"), //  web app roots
  );
});

self.addEventListener("push", (event) => {
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "PixelSquire", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, { body: payload.body }),
  );
});
