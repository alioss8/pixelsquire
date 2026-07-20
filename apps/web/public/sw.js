self.addEventListener('push', (event) => {
  const payload = event.data.json()
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
    //   icon: 
    })
  )
});

self.addEventListener('notificationclick', (event)=> {
   event.notification.close()
   event.waitUntil(
    clients.openWindow('/') //  web app roots
   )     
}) 

