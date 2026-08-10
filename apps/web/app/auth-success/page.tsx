import { Suspense } from 'react'
import { SuccessContent } from './success-content'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--wood-950)', minHeight: '100%' }} />}>
      <SuccessContent />
    </Suspense>
  )
}