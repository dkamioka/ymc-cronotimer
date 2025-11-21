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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "users_box_id_fkey"
            columns: ["box_id"]
            referencedRelation: "boxes"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "workouts_box_id_fkey"
            columns: ["box_id"]
            referencedRelation: "boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_box_and_user: {
        Args: {
          p_box_name: string
          p_box_slug: string
          p_user_name: string
          p_user_email: string
          p_user_role?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
