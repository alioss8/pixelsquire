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