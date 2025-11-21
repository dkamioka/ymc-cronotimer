export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      boxes: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          box_id: string
          role: 'owner' | 'coach' | 'athlete'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          box_id: string
          role: 'owner' | 'coach' | 'athlete'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          box_id?: string
          role?: 'owner' | 'coach' | 'athlete'
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          box_id: string
          owner_id: string
          slug: string
          name: string
          date: string
          tags: string[] | null
          is_template: boolean
          total_duration: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          box_id: string
          owner_id: string
          slug: string
          name: string
          date: string
          tags?: string[] | null
          is_template?: boolean
          total_duration?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          box_id?: string
          owner_id?: string
          slug?: string
          name?: string
          date?: string
          tags?: string[] | null
          is_template?: boolean
          total_duration?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // More tables will be added as we create migrations
    }
  }
}
