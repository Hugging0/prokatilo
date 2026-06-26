self.addEventListener("push", (event) => {
  let payload = {
    title: "ПРОКАТило",
    body: "У вас новое уведомление",
    url: "/app",
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/prokatilo-icon-192.png",
      badge: "/icons/favicon-96x96.png",
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || "/app", self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const matchingClient = clientList.find((client) => client.url === targetUrl);

        if (matchingClient) {
          return matchingClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
