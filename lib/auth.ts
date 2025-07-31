import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export class AuthManager {
  private static instance: AuthManager
  private currentUser: User | null = null
  private initialized = false // Tracks if initial session check is done

  private constructor() {
    // Don't initialize immediately, wait for first method call
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // New method to quickly get initial session without blocking on profile creation
  public async getInitialSession(): Promise<{ user: User | null; error: string | null }> {
    if (this.initialized) {
      return { user: this.currentUser, error: null }
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.warn("Auth session error (this is normal for new users):", error.message)
        this.currentUser = null
        return { user: null, error: error.message }
      }

      this.currentUser = session?.user || null
      this.initialized = true
      return { user: this.currentUser, error: null }
    } catch (error: any) {
      console.warn("Failed to get initial session:", error)
      this.currentUser = null
      this.initialized = true
      return { user: null, error: error.message || "An unexpected error occurred." }
    }
  }

  public async signUp(
    email: string,
    password: string,
    username: string,
  ): Promise<{ success: boolean; error?: string }> {
    // No need to call initializeAuth here, getInitialSession handles it for app/page.tsx
    // and onAuthStateChange will handle subsequent profile creation.

    // --- START: Added explicit validation before Supabase call ---
    if (!email || email.trim() === "") {
      return { success: false, error: "Email is required." }
    }
    if (!password || password.trim() === "") {
      return { success: false, error: "Password is required." }
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." }
    }
    if (!username || username.trim() === "") {
      return { success: false, error: "Username is required." }
    }
    if (username.trim().length < 3) {
      return { success: false, error: "Username must be at least 3 characters." }
    }
    // --- END: Added explicit validation before Supabase call ---

    try {
      // Get the current URL for redirect
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "https://v0-pokecare-project-em.vercel.app/auth/callback"

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)

        // Handle specific error types
        if (error.message.includes("User already registered")) {
          return { success: false, error: "An account with this email already exists. Please sign in instead." }
        }

        if (error.message.includes("Invalid email")) {
          return { success: false, error: "Please enter a valid email address." }
        }

        if (error.message.includes("Password")) {
          return { success: false, error: "Password must be at least 6 characters long." }
        }

        return { success: false, error: error.message || "Registration failed. Please try again." }
      }

      if (data.user) {
        // Ensure user profile exists after successful signup (async, non-blocking)
        this.currentUser = data.user
        this.ensureUserProfile(data.user, email, username.trim()).catch(console.error)
        return { success: true }
      }

      return { success: false, error: "Failed to create user account" }
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle network errors
      if (error.message?.includes("Failed to fetch") || error.name === "TypeError") {
        return {
          success: false,
          error: "Network error. Please check your internet connection and try again.",
        }
      }

      return {
        success: false,
        error: error.message || "An unexpected error occurred. Please try again.",
      }
    }
  }

  public async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // No need to call initializeAuth here, getInitialSession handles it for app/page.tsx
    // and onAuthStateChange will handle subsequent profile creation.

    // --- START: Added explicit validation before Supabase call ---
    if (!email || email.trim() === "") {
      return { success: false, error: "Email is required." }
    }
    if (!password || password.trim() === "") {
      return { success: false, error: "Password is required." }
    }
    // --- END: Added explicit validation before Supabase call ---

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase signin error:", error)

        // Handle specific error types
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Invalid email or password. Please check your credentials and try again." }
        }

        if (error.message.includes("Email not confirmed")) {
          return { success: false, error: "Please check your email and click the confirmation link before signing in." }
        }

        return { success: false, error: error.message || "Sign in failed. Please try again." }
      }

      // Ensure user profile exists after successful sign in (async, non-blocking)
      if (data.user) {
        this.currentUser = data.user
        this.ensureUserProfile(data.user, email).catch(console.error)
      }

      return { success: true }
    } catch (error: any) {
      console.error("Sign in error:", error)

      // Handle network errors
      if (error.message?.includes("Failed to fetch") || error.name === "TypeError") {
        return {
          success: false,
          error: "Network error. Please check your internet connection and try again.",
        }
      }

      return {
        success: false,
        error: error.message || "An unexpected error occurred. Please try again.",
      }
    }
  }

  private async ensureUserProfile(user: User, email: string, username?: string): Promise<void> {
    try {
      // First check if the users table exists
      const { error: tableCheckError } = await supabase.from("users").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.users" does not exist')) {
          console.error("Database tables not created yet. Please run the SQL script in Supabase.")
          return
        }
        console.error("Error checking users table:", tableCheckError)
        return
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error checking user profile:", fetchError)
        return
      }

      if (!existingProfile) {
        // Create profile with username from metadata, parameter, or email
        const finalUsername = username || user.user_metadata?.username || email.split("@")[0]

        console.log("Creating user profile for:", user.id, email, finalUsername)

        const { data: insertedUser, error } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email,
            username: finalUsername,
          })
          .select()
          .single()

        if (error) {
          console.error("Error creating user profile:", error)

          // Handle duplicate username error
          if (error.code === "23505" && error.message.includes("username")) {
            // Try with a unique username
            const uniqueUsername = `${finalUsername}_${Date.now()}`
            const { error: retryError } = await supabase.from("users").insert({
              id: user.id,
              email,
              username: uniqueUsername,
            })

            if (retryError) {
              console.error("Error creating user profile with unique username:", retryError)
            } else {
              console.log("User profile created with unique username:", uniqueUsername)
            }
          }
        } else {
          console.log("User profile created successfully:", insertedUser)
        }
      } else {
        console.log("User profile already exists:", existingProfile.id)
      }
    } catch (error) {
      console.error("Error ensuring user profile:", error)
    }
  }

  public async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
      this.currentUser = null
      this.initialized = false // Reset initialization state on sign out
    } catch (error) {
      console.error("Sign out error:", error)
      // Force clear local state even if API call fails
      this.currentUser = null
      this.initialized = false
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser
  }

  public async getUserProfile(): Promise<any> {
    // Ensure initial session check is done before trying to get profile
    await this.getInitialSession()

    if (!this.currentUser) return null

    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase.from("users").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.users" does not exist')) {
          console.warn("Database tables not created yet. Using basic user info.")
          return {
            id: this.currentUser.id,
            email: this.currentUser.email,
            username: this.currentUser.user_metadata?.username || this.currentUser.email?.split("@")[0] || "User",
          }
        }
        console.error("Error checking users table:", tableCheckError)
        return null
      }

      const { data, error } = await supabase.from("users").select("*").eq("id", this.currentUser.id).single()

      if (error) {
        if (error.code === "PGRST116") {
          // No profile found, create it and return basic info
          await this.ensureUserProfile(this.currentUser, this.currentUser.email || "")
          return {
            id: this.currentUser.id,
            email: this.currentUser.email,
            username: this.currentUser.user_metadata?.username || this.currentUser.email?.split("@")[0] || "User",
          }
        }
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  public onAuthStateChange(callback: (user: User | null) => void) {
    // Perform initial session check and then subscribe
    this.getInitialSession().then(() => {
      callback(this.currentUser) // Call callback with current user immediately
    })

    return supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentUser = session?.user || null

      // Handle email confirmation and ensure profile exists asynchronously
      if (event === "SIGNED_IN" && session?.user) {
        this.ensureUserProfile(session.user, session.user.email || "").catch(console.error)
      }

      callback(this.currentUser)
    })
  }
}
