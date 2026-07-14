import { api } from './api'

// ✅ MESSAGE LISTENER — content script'ten gelen istekler
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === 'GET_MESSAGE') {
    api
      .get('/messages/next?context=periodic')
      .then((msg) => sendResponse({ ok: true, msg }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true // async response için ŞART
  }
})

// ✅ ALARM LISTENER — alarm tetiklendiğinde balon aç
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'speak') return

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (!tab?.id) return

  try {
    const msg = await api.get('/messages/next?context=periodic')
    chrome.tabs.sendMessage(tab.id, { type: 'SHOW_MESSAGE', msg }).catch(() => {})
  } catch {
    // backend kapalıysa sessiz
  }
})

// ✅ INSTALL LISTENER
chrome.runtime.onInstalled.addListener(async () => {
  const { token } = await chrome.storage.local.get('token')

  if (!token) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const result = await api.post('/devices/register', {
      platform: 'EXTENSION',
      timezone,
    })
    await chrome.storage.local.set({ token: result.token })
    console.log('PixelSquire: registered, token saved')
  } else {
    console.log('PixelSquire: already registered')
  }
  
  const stored = await chrome.storage.local.get('speakInterval')
  const interval = (stored.speakInterval as number) ?? 1
  chrome.alarms.create('speak', { periodInMinutes: interval })
})