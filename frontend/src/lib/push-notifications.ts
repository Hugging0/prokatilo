import {
  deletePushSubscription,
  getWebPushPublicKey,
  savePushSubscription,
} from "@/lib/api/push-notifications";
import type { PushSubscriptionPayload } from "@/types";

export type PushNotificationStatus =
  | "unsupported"
  | "unconfigured"
  | "default"
  | "denied"
  | "enabled"
  | "disabled"
  | "error";

export interface PushNotificationResult {
  status: PushNotificationStatus;
  message: string;
}

function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray.buffer as ArrayBuffer;
}

function subscriptionToPayload(
  subscription: PushSubscription,
): PushSubscriptionPayload {
  const json = subscription.toJSON();

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
  };
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

export function getPushNotificationPermission(): PushNotificationStatus {
  if (!isPushSupported()) return "unsupported";

  if (Notification.permission === "granted") return "enabled";
  if (Notification.permission === "denied") return "denied";

  return "default";
}

export async function enablePushNotifications(
  authToken: string,
): Promise<PushNotificationResult> {
  if (!isPushSupported()) {
    return {
      status: "unsupported",
      message: "Этот браузер не поддерживает push-уведомления.",
    };
  }

  try {
    const webPushKeys = await getWebPushPublicKey();

    if (!webPushKeys.is_configured || !webPushKeys.public_key) {
      return {
        status: "unconfigured",
        message: "Push-уведомления скоро будут доступны.",
      };
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission === "denied") {
      return {
        status: "denied",
        message: "Уведомления отключены в настройках браузера.",
      };
    }

    if (permission !== "granted") {
      return {
        status: "default",
        message: "Нажмите кнопку, чтобы включить уведомления о бронях.",
      };
    }

    const registration = await getServiceWorkerRegistration();
    const existingSubscription = await registration.pushManager.getSubscription();
    const subscription =
      existingSubscription ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(webPushKeys.public_key),
      }));

    await savePushSubscription(authToken, subscriptionToPayload(subscription));

    return {
      status: "enabled",
      message: "Уведомления включены.",
    };
  } catch {
    return {
      status: "error",
      message: "Не удалось включить уведомления. Попробуйте позже.",
    };
  }
}

export async function disablePushNotifications(
  authToken: string,
): Promise<PushNotificationResult> {
  if (!isPushSupported()) {
    return {
      status: "unsupported",
      message: "Этот браузер не поддерживает push-уведомления.",
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await deletePushSubscription(authToken, endpoint);
    }

    return {
      status: "disabled",
      message: "Уведомления выключены.",
    };
  } catch {
    return {
      status: "error",
      message: "Не удалось выключить уведомления. Попробуйте позже.",
    };
  }
}
