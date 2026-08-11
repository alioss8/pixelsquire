"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type PushState = "checking" | "subscribed" | "unsubscribed" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function PushRegister() {
  const [state, setState] = useState<PushState>("checking");

  // İŞ 1: mount'ta otomatik register + mevcut durumu öğren
  useEffect(() => {
    async function checkState() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      try {
        await navigator.serviceWorker.register("/sw.js");
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setState(sub ? "subscribed" : "unsubscribed");
      } catch {
        setState("unsubscribed");
      }
    }
    checkState();
  }, []);

  // İŞ 2: butona bağlı
  async function subscribeToPush() {
    const permisson = await Notification.requestPermission();
    if (permisson !== "granted") {
      setState(permisson === "denied" ? "denied" : "unsubscribed");
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });

    await fetch("/api/v1/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ← cookie'yi gönderir, Bearer header'a gerek yok
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
        auth: arrayBufferToBase64(subscription.getKey("auth")!),
      }),
    });

    setState("subscribed");
  }

  if (state === "unsupported") return null;

  if (state === "subscribed") {
    return (
      <Button variant="ghost" size="sm" disabled>
        🔔 Bildirimler açık
      </Button>
    );
  }

  if (state === "denied") {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        title="Bildirimlere tarayıcı ayarlarından izin vermen gerekiyor"
      >
        🔕 Bildirimler kapalı
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={subscribeToPush} disabled={state === "checking"}>
      🔔 Bildirimleri aç
    </Button>
  );
}
