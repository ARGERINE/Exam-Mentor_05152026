import { Suspense } from "react"
import RevisionAttemptClient from "./RevisionAttemptClient"

export default function Page() {

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Preparing Revision Session...
        </div>
      }
    >
      <RevisionAttemptClient />
    </Suspense>
  )
}