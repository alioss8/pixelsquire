import { Suspense } from 'react'
import { MergeContent } from './merge-content'

export default function MergeAccountsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MergeContent />
    </Suspense>
  )
}