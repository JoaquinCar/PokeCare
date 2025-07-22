import { createClient } from "@supabase/supabase-js"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          created_at?: string
        }
      }
      pokemon_team: {
        Row: {
          id: string
          user_id: string
          pokemon_id: number
          pokemon_name: string
          pokemon_data: any
          happiness: number
          health: number
          energy: number
          hunger: number
          activity_points: number
          total_actions: number
          is_mega_evolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pokemon_id: number
          pokemon_name: string
          pokemon_data: any
          happiness?: number
          health?: number
          energy?: number
          hunger?: number
          activity_points?: number
          total_actions?: number
          is_mega_evolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pokemon_id?: number
          pokemon_name?: string
          pokemon_data?: any
          happiness?: number
          health?: number
          energy?: number
          hunger?: number
          activity_points?: number
          total_actions?: number
          is_mega_evolved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
