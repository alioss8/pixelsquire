import { api } from './api'

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
})
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === 'GET_MESSAGE') {
    api
      .get('/messages/next?context=periodic')
      .then((msg) => sendResponse({ ok: true, msg }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true // async response için ŞART
  }
})