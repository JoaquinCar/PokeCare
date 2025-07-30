"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthManager } from "@/lib/auth"
import { CheckCircle, AlertCircle, Wifi, WifiOff, Loader2 } from "lucide-react"
import { ClassicButton, ClassicCard } from "@/components/classic-pokemon-ui"
import { pokemonTheme } from "@/lib/pokemon-theme"
import { PokemonAssetOptimizer } from "@/lib/pokemon-asset-optimizer"

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
    // Preload critical Pokemon assets
    const assetOptimizer = PokemonAssetOptimizer.getInstance()
    assetOptimizer.preloadCriticalAssets([1, 4, 7, 25, 150]) // Starter Pokemon + Pikachu + Mewtwo

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
      <div
        className={`min-h-screen bg-gradient-to-br ${pokemonTheme.colors.backgrounds.primary} flex items-center justify-center`}
      >
        <ClassicCard variant="primary" className="max-w-md">
          <div className="text-center py-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className={`${pokemonTheme.typography.heading} text-2xl text-blue-800 mb-2`}>PokeCare</h2>
            <p className="text-blue-600">Initializing...</p>
          </div>
        </ClassicCard>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${pokemonTheme.colors.backgrounds.primary} relative overflow-hidden`}
    >
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg border-2 border-red-700 flex items-center gap-2 shadow-xl">
            <WifiOff className="w-4 h-4" />
            <span className={`${pokemonTheme.typography.button} text-sm`}>No Internet Connection</span>
          </div>
        </div>
      )}

      {/* Classic Pokemon Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full border-4 border-yellow-600 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-red-400 rounded-full border-4 border-red-600 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-400 rounded-full border-4 border-green-600 animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-purple-400 rounded-full border-4 border-purple-600 animate-bounce"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Classic Pokemon Logo */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 px-8 py-4 rounded-lg border-4 border-yellow-800 shadow-2xl mb-4">
              <h1 className={`${pokemonTheme.typography.heading} text-4xl`}>🎮 PokeCare</h1>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-gray-800 shadow-lg">
              <p className={`${pokemonTheme.typography.subheading} text-blue-800`}>Your Virtual Pokémon Companion</p>
            </div>
          </div>

          <ClassicCard title="Welcome Trainer!" variant="primary">
            <div className="text-center mb-6">
              <p className="text-gray-700">Sign in or create an account to start your adventure</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border-2 border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-200 border-2 border-gray-400 rounded-lg">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-bold uppercase tracking-wide"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-bold uppercase tracking-wide"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className={pokemonTheme.typography.subheading}>
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Enter your email"
                      className="border-2 border-gray-400 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className={pokemonTheme.typography.subheading}>
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Enter your password"
                      className="border-2 border-gray-400 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <ClassicButton
                    onClick={handleLogin}
                    variant="primary"
                    size="lg"
                    disabled={loading || !isOnline}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </ClassicButton>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className={pokemonTheme.typography.subheading}>
                      Username
                    </Label>
                    <Input
                      id="register-username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Choose a username"
                      minLength={3}
                      className="border-2 border-gray-400 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className={pokemonTheme.typography.subheading}>
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Enter your email"
                      className="border-2 border-gray-400 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className={pokemonTheme.typography.subheading}>
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      minLength={6}
                      placeholder="Create a password (min 6 characters)"
                      className="border-2 border-gray-400 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className={pokemonTheme.typography.subheading}>
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                      disabled={loading || !isOnline}
                      placeholder="Confirm your password"
                      className="border-2 border-gray-400 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <ClassicButton
                    onClick={handleRegister}
                    variant="success"
                    size="lg"
                    disabled={loading || !isOnline}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </ClassicButton>
                </form>
              </TabsContent>
            </Tabs>

            {/* Connection Status */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                {isOnline ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="font-medium">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </ClassicCard>
        </div>
      </div>
    </div>
  )
}
