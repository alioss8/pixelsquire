'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const deviceToken = searchParams.get('deviceToken')

  useEffect(() => {
    // Extension'dan geliyorsa token'ı storage'a yaz
    if (deviceToken && typeof window !== 'undefined') {
      // Burada işlem yapabilirsin
      console.log('Auth başarılı, token:', deviceToken)
    }
  }, [deviceToken])

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>⚔️ Auth successful!</h1>
      <p>Your Google account is linked: <strong>{email}</strong></p>
      <p>Returning to extension...</p>
    </div>
  )
}