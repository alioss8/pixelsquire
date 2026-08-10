import { api } from './api'

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === 'GET_MESSAGE') {
    api.get('/messages/next?context=periodic')
      .then((msg) => sendResponse({ ok: true, msg }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true
  }

  if (req.type === 'CHECKIN_QUICK') {
    api.post('/checkin', {})
      .then((msg) => sendResponse({ ok: true, msg }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true
  }

  if (req.type === 'GET_SUMMARY') {
    api.get('/me/summary')
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true
  }

  if (req.type === 'MUTE_TODAY') {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)   // bugünün sonu = yarın 00:00
  chrome.storage.local.set({ mutedUntil: tomorrow.getTime() })
    .then(() => sendResponse({ ok: true }))
  return true
  }
  if (req.type === 'CREATE_GOAL') {
    api.post('/goals', { title: req.title, cadence: req.cadence })
      .then((goal) => sendResponse({ ok: true, goal }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true
  }
})


chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'speak') return

  const stored = await chrome.storage.local.get('mutedUntil')
  const mutedUntil = (stored.mutedUntil as number) ?? 0
  if (Date.now() < mutedUntil) return 

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (!tab?.id) return

  try {
    const msg = await api.get('/messages/next?context=periodic')
    chrome.tabs.sendMessage(tab.id, { type: 'SHOW_MESSAGE', msg }).catch(() => {})
  } catch {
    // backend kapalıysa sessiz
  }
})


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
  const interval = (stored.speakInterval as number) ?? 90
  chrome.alarms.create('speak', { periodInMinutes: interval })
})