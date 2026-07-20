'use client'
import { useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushRegister() {
  // İŞ 1: mount'ta otomatik register
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  // İŞ 2: butona bağlı
  async function subscribeToPush() {
    const permisson = await Notification.requestPermission()
    if (permisson !== 'granted') return

    // const registration = await navigator.serviceWorker.ready

    // const subscription = await registration.pushManager.subscribe({
    //     userVisibleOnly: true,
    //     applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) || " "
    // }
        
    // )
    // adım 3: registration.pushManager.subscribe({ ... })
    // adım 4: subscription'ı düzleştir → /push/subscribe'a POST
  }

  return (
    <button onClick={subscribeToPush}>Bildirimleri aç</button>
  )
}