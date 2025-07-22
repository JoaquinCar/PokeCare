"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/?error=auth_error")
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          // No session, redirect to login
          router.push("/?message=email_confirmed")
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error)
        router.push("/?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Confirming your email..." />
        <p className="text-white mt-4">Please wait while we verify your account...</p>
      </div>
    </div>
  )
}
