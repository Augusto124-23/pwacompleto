// Configuración para el manejo de Push Notifications en la PWA

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function needsIosInstall(): boolean {
  // Detectar si es iOS y no está en modo standalone (instalado)
  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
  return isIos && !isInStandaloneMode;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(0);
  }
  return outputArray;
}

export async function getSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function subscribePush(): Promise<PushSubscription> {
  const registration = await navigator.serviceWorker.ready;
  
  // Llave pública VAPID desde las variables de entorno de Vite
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || ""; 
  
  const options: PushSubscriptionOptionsInit = {
    userVisibleOnly: true,
    ...(vapidPublicKey && { applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) }),
  };

  const subscription = await registration.pushManager.subscribe(options);

  // Enviar la suscripción a tu backend de Express/MongoDB
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  return subscription;
}

export async function unsubscribePush(): Promise<void> {
  const subscription = await getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }
}

export async function sendTestPush(): Promise<void> {
  await fetch("/api/push/test", {
    method: "POST",
  });
}