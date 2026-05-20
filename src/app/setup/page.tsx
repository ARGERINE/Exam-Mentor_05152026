"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/study-plan")
  }, [])

  return <p>Redirecting...</p>
}