"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthManager } from "@/lib/auth"
import { CheckCircle, AlertCircle, Wifi, WifiOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ email: "", password: "", confirmPassword: "", username: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setIsOnline(navigator.onLine)

    // Check for URL parameters
    const errorParam = searchParams.get("error")
    const messageParam = searchParams.get("message")

    if (errorParam === "auth_error") {
      setError("There was an error confirming your email. Please try again.")
    } else if (errorParam === "unexpected_error") {
      setError("An unexpected error occurred. Please try again.")
    } else if (messageParam === "email_confirmed") {
      setSuccess("Email confirmed successfully! You can now sign in.")
    }

    // Initialize auth state
    const authManager = AuthManager.getInstance()
    const unsubscribe = authManager.onAuthStateChange((user) => {
      setAuthInitialized(true)
      if (user) {
        router.push("/dashboard")
      }
    })

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (unsubscribe?.data?.subscription) {
        unsubscribe.data.subscription.unsubscribe()
      }
    }
  }, [router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isOnline) {
      setError("No internet connection. Please check your network and try again.")
      return
    }

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const result = await AuthManager.getInstance().signIn(loginData.email, loginData.password)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isOnline) {
      setError("No internet connection. Please check your network and try again.")
      return
    }

    setError("")
    setSuccess("")
    setLoading(true)

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (!registerData.username.trim()) {
      setError("Username is required")
      setLoading(false)
      return
    }

    if (registerData.username.length < 3) {
      setError("Username must be at least 3 characters")
      setLoading(false)
      return
    }

    try {
      const result = await AuthManager.getInstance().signUp(
        registerData.email,
        registerData.password,
        registerData.username.trim(),
      )

      if (result.success) {
        const user = AuthManager.getInstance().getCurrentUser()
        if (user && !user.email_confirmed_at) {
          setSuccess(
            "Registration successful! Please check your email and click the confirmation link to complete your account setup.",
          )
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while auth is initializing
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">PokeCare</h2>
          <p className="text-white/80">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">No internet connection</span>
          </div>
        </div>
      )}

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-green-300 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-red-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-blue-300 rounded-full animate-bounce"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">🎮 PokeCare</h1>
          <p className="text-white/90 text-xl drop-shadow-lg">Your Virtual Pokémon Companion</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-white/50 relative z-10">
          <CardHeader>
            <CardTitle className="text-center text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Trainer!
            </CardTitle>
            <CardDescription className="text-center">
              Sign in or create an account to start your adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Enter your password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    disabled={loading || !isOnline}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Choose a username"
                      minLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      minLength={6}
                      placeholder="Create a password (min 6 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Confirm your password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    disabled={loading || !isOnline}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Connection Status */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
