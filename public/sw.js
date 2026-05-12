self.addEventListener("push", (event) => {
  let title = "Party Prompt";
  let body = "You have a new update.";
  try {
    if (event.data) {
      const j = event.data.json();
      if (typeof j.title === "string") title = j.title;
      if (typeof j.body === "string") body = j.body;
    }
  } catch (_) {
    try {
      const t = event.data && event.data.text();
      if (t) body = t;
    } catch (_) {}
  }
  event.waitUntil(self.registration.showNotification(title, { body, icon: "/favicon.ico" }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/home"));
});
