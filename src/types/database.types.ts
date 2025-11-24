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
          is_favorite: boolean
          last_executed_at: string | null
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
          is_favorite?: boolean
          last_executed_at?: string | null
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
          is_favorite?: boolean
          last_executed_at?: string | null
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
      sections: {
        Row: {
          id: string
          workout_id: string
          name: string
          order: number
          color: string | null
          repeat_count: number
          exclude_from_total: boolean
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          order: number
          color?: string | null
          repeat_count?: number
          exclude_from_total?: boolean
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          order?: number
          color?: string | null
          repeat_count?: number
          exclude_from_total?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sections_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      exercises: {
        Row: {
          id: string
          section_id: string
          name: string
          notes: string | null
          order: number
        }
        Insert: {
          id?: string
          section_id: string
          name: string
          notes?: string | null
          order: number
        }
        Update: {
          id?: string
          section_id?: string
          name?: string
          notes?: string | null
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercises_section_id_fkey"
            columns: ["section_id"]
            referencedRelation: "sections"
            referencedColumns: ["id"]
          }
        ]
      }
      rounds: {
        Row: {
          id: string
          exercise_id: string
          duration: string
          mode: 'countup' | 'countdown'
          color: string | null
          exclude_from_total: boolean
          order: number
        }
        Insert: {
          id?: string
          exercise_id: string
          duration: string
          mode: 'countup' | 'countdown'
          color?: string | null
          exclude_from_total?: boolean
          order: number
        }
        Update: {
          id?: string
          exercise_id?: string
          duration?: string
          mode?: 'countup' | 'countdown'
          color?: string | null
          exclude_from_total?: boolean
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "rounds_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      execution_logs: {
        Row: {
          id: string
          workout_id: string
          round_id: string
          planned_duration: string
          actual_duration: string
          started_at: string
          ended_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          round_id: string
          planned_duration: string
          actual_duration: string
          started_at: string
          ended_at: string
        }
        Update: {
          id?: string
          workout_id?: string
          round_id?: string
          planned_duration?: string
          actual_duration?: string
          started_at?: string
          ended_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_logs_round_id_fkey"
            columns: ["round_id"]
            referencedRelation: "rounds"
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
