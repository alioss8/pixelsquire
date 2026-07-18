'use client'

import { useSearchParams } from 'next/navigation'

export function SuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>⚔️ Auth successful!</h1>
      <p>Your Google account is linked: <strong>{email}</strong></p>
      <p>Returning to extension...</p>
    </div>
  )
}