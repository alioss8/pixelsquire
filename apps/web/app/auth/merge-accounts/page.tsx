import { Suspense } from 'react'
import { MergeContent } from './merge-content'

export default function MergeAccountsPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--wood-950)', minHeight: '100%' }} />}>
      <MergeContent />
    </Suspense>
  )
}