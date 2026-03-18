// Auto-generated types from Supabase schema
// Replace with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/database.types.ts

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
      weekly_schedule_items: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          title: string
          start_time: string | null
          end_time: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: number
          title: string
          start_time?: string | null
          end_time?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: number
          title?: string
          start_time?: string | null
          end_time?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_check_items: {
        Row: {
          id: string
          user_id: string
          date: string
          template_item_id: string | null
          title: string
          start_time: string | null
          end_time: string | null
          sort_order: number
          checked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          template_item_id?: string | null
          title: string
          start_time?: string | null
          end_time?: string | null
          sort_order?: number
          checked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          template_item_id?: string | null
          title?: string
          start_time?: string | null
          end_time?: string | null
          sort_order?: number
          checked?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_retros: {
        Row: {
          id: string
          user_id: string
          date: string
          feedback: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          feedback?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          feedback?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          id: string
          user_id: string
          year: number
          month: number
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          month: number
          content?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          month?: number
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_week_plans: {
        Row: {
          id: string
          user_id: string
          year: number
          month: number
          week_number: number
          week_start: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          month: number
          week_number: number
          week_start: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          month?: number
          week_number?: number
          week_start?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          user_id: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          title: string
          start_time: string | null
          end_time: string | null
          priority: 'high' | 'medium' | 'low'
          estimated_minutes: number | null
          tags: string[]
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          title: string
          start_time?: string | null
          end_time?: string | null
          priority?: 'high' | 'medium' | 'low'
          estimated_minutes?: number | null
          tags?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          title?: string
          start_time?: string | null
          end_time?: string | null
          priority?: 'high' | 'medium' | 'low'
          estimated_minutes?: number | null
          tags?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_blocks_plan_id_fkey'
            columns: ['plan_id']
            referencedRelation: 'plans'
            referencedColumns: ['id']
          }
        ]
      }
      retrospectives: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          date: string
          completed_block_ids: string[]
          skipped_block_ids: string[]
          failed_block_ids: string[]
          achievement_rate: number
          study_minutes: number
          tags: string[]
          done_well: string
          self_praise: string
          learned: string
          failed_what: string | null
          failed_cause: string | null
          failed_improve: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          date: string
          completed_block_ids?: string[]
          skipped_block_ids?: string[]
          failed_block_ids?: string[]
          study_minutes?: number
          tags?: string[]
          done_well: string
          self_praise: string
          learned: string
          failed_what?: string | null
          failed_cause?: string | null
          failed_improve?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          date?: string
          completed_block_ids?: string[]
          skipped_block_ids?: string[]
          failed_block_ids?: string[]
          study_minutes?: number
          tags?: string[]
          done_well?: string
          self_praise?: string
          learned?: string
          failed_what?: string | null
          failed_cause?: string | null
          failed_improve?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      retro_stats: {
        Row: {
          user_id: string
          week_start: string
          total_minutes: number
          avg_achievement: number
          retro_count: number
        }
        Relationships: []
      }
    }
    Functions: {
      get_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
    }
  }
}
