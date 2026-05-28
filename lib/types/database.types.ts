/**
 * EDU LUZ — Database types for Supabase client.
 *
 * STATUS: hand-written to mirror `supabase/migrations/0001_*` through `0014_*`.
 * Format follows what `supabase gen types typescript` would produce.
 *
 * REGENERATE once you have a linked Supabase project or local Docker:
 *   supabase gen types typescript --local > lib/types/database.types.ts
 *   # or
 *   supabase gen types typescript --project-id <ref> > lib/types/database.types.ts
 *
 * Conventions:
 *   - `numeric` columns are typed as `number` (PostgREST `db-default-numeric=number`
 *     configuration assumed; if you stay on default-string, switch to `string`).
 *   - `date` / `time` / `timestamptz` are returned as ISO strings by PostgREST.
 *   - Auth schema is not included — only `public`.
 *   - Relationships arrays are filled in for FK joins commonly used in queries;
 *     less-used joins may be empty (regenerate for full coverage).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // ────────────────────────────────────────────────────────────────────
      // profiles
      // ────────────────────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string
          role: Database['public']['Enums']['user_role']
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          initials: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: Database['public']['Enums']['user_role']
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: Database['public']['Enums']['user_role']
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // subjects
      // ────────────────────────────────────────────────────────────────────
      subjects: {
        Row: {
          id: string
          name: string
          color: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }

      // ────────────────────────────────────────────────────────────────────
      // rooms
      // ────────────────────────────────────────────────────────────────────
      rooms: {
        Row: {
          id: string
          name: string
          capacity: number
          equipment: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          capacity: number
          equipment?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          equipment?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }

      // ────────────────────────────────────────────────────────────────────
      // center_settings (singleton: id = 1)
      // ────────────────────────────────────────────────────────────────────
      center_settings: {
        Row: {
          id: number
          name: string
          full_name: string | null
          address: string
          phone: string
          email: string
          nip: string | null
          bank_account: string | null
          bank_name: string | null
          payment_title_template: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          full_name?: string | null
          address: string
          phone: string
          email: string
          nip?: string | null
          bank_account?: string | null
          bank_name?: string | null
          payment_title_template?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          full_name?: string | null
          address?: string
          phone?: string
          email?: string
          nip?: string | null
          bank_account?: string | null
          bank_name?: string | null
          payment_title_template?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ────────────────────────────────────────────────────────────────────
      // working_hours
      // ────────────────────────────────────────────────────────────────────
      working_hours: {
        Row: {
          id: string
          kind: Database['public']['Enums']['working_hours_kind']
          day_of_week: number
          open_time: string
          close_time: string
          is_active: boolean
        }
        Insert: {
          id?: string
          kind: Database['public']['Enums']['working_hours_kind']
          day_of_week: number
          open_time: string
          close_time: string
          is_active?: boolean
        }
        Update: {
          id?: string
          kind?: Database['public']['Enums']['working_hours_kind']
          day_of_week?: number
          open_time?: string
          close_time?: string
          is_active?: boolean
        }
        Relationships: []
      }

      // ────────────────────────────────────────────────────────────────────
      // contract_terms (singleton: id = 1)
      // ────────────────────────────────────────────────────────────────────
      contract_terms: {
        Row: {
          id: number
          payment_deadline_day: number
          min_contract_months: number
          cancellation_notice_days: number
          makeup_deadline_days: number
          late_entry_hours: number
          cancellation_hours_cutoff: number
          no_show_policy: string
          cancellation_policy: string
          updated_at: string
        }
        Insert: {
          id?: number
          payment_deadline_day?: number
          min_contract_months?: number
          cancellation_notice_days?: number
          makeup_deadline_days?: number
          late_entry_hours?: number
          cancellation_hours_cutoff?: number
          no_show_policy?: string
          cancellation_policy?: string
          updated_at?: string
        }
        Update: {
          id?: number
          payment_deadline_day?: number
          min_contract_months?: number
          cancellation_notice_days?: number
          makeup_deadline_days?: number
          late_entry_hours?: number
          cancellation_hours_cutoff?: number
          no_show_policy?: string
          cancellation_policy?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ────────────────────────────────────────────────────────────────────
      // parents
      // ────────────────────────────────────────────────────────────────────
      parents: {
        Row: {
          profile_id: string
          address: string | null
          late_count: number
          last_overdue_at: string | null
          created_at: string
        }
        Insert: {
          profile_id: string
          address?: string | null
          late_count?: number
          last_overdue_at?: string | null
          created_at?: string
        }
        Update: {
          profile_id?: string
          address?: string | null
          late_count?: number
          last_overdue_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'parents_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // students
      // ────────────────────────────────────────────────────────────────────
      students: {
        Row: {
          profile_id: string
          parent_id: string
          school_class: string
          school_name: string | null
          level: Database['public']['Enums']['student_level']
          birth_date: string
          created_at: string
        }
        Insert: {
          profile_id: string
          parent_id: string
          school_class: string
          school_name?: string | null
          level: Database['public']['Enums']['student_level']
          birth_date: string
          created_at?: string
        }
        Update: {
          profile_id?: string
          parent_id?: string
          school_class?: string
          school_name?: string | null
          level?: Database['public']['Enums']['student_level']
          birth_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'students_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'parents'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // tutors
      // ────────────────────────────────────────────────────────────────────
      tutors: {
        Row: {
          profile_id: string
          bio: string | null
          hired_date: string | null
          created_at: string
        }
        Insert: {
          profile_id: string
          bio?: string | null
          hired_date?: string | null
          created_at?: string
        }
        Update: {
          profile_id?: string
          bio?: string | null
          hired_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutors_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // tutor_subjects
      // ────────────────────────────────────────────────────────────────────
      tutor_subjects: {
        Row: {
          tutor_id: string
          subject_id: string
        }
        Insert: {
          tutor_id: string
          subject_id: string
        }
        Update: {
          tutor_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_subjects_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'tutor_subjects_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // tutor_rates
      // ────────────────────────────────────────────────────────────────────
      tutor_rates: {
        Row: {
          id: string
          tutor_id: string
          individual_rate: number
          group_rate: number
          effective_from: string
          note: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tutor_id: string
          individual_rate: number
          group_rate: number
          effective_from: string
          note?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tutor_id?: string
          individual_rate?: number
          group_rate?: number
          effective_from?: string
          note?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_rates_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // availability_blocks
      // ────────────────────────────────────────────────────────────────────
      availability_blocks: {
        Row: {
          id: string
          tutor_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          tutor_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Update: {
          id?: string
          tutor_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
        }
        Relationships: [
          {
            foreignKeyName: 'availability_blocks_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // extra_slots
      // ────────────────────────────────────────────────────────────────────
      extra_slots: {
        Row: {
          id: string
          tutor_id: string
          slot_date: string
          start_time: string
          end_time: string
          room_id: string | null
          status: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          slot_date: string
          start_time: string
          end_time: string
          room_id?: string | null
          status?: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          slot_date?: string
          start_time?: string
          end_time?: string
          room_id?: string | null
          status?: string
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'extra_slots_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'extra_slots_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // groups
      // ────────────────────────────────────────────────────────────────────
      groups: {
        Row: {
          id: string
          name: string
          subject_id: string
          level: Database['public']['Enums']['student_level']
          tutor_id: string
          max_size: number
          monthly_fee_per_student: number
          status: string
          dissolved_at: string | null
          dissolved_reason: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          subject_id: string
          level: Database['public']['Enums']['student_level']
          tutor_id: string
          max_size: number
          monthly_fee_per_student: number
          status?: string
          dissolved_at?: string | null
          dissolved_reason?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          subject_id?: string
          level?: Database['public']['Enums']['student_level']
          tutor_id?: string
          max_size?: number
          monthly_fee_per_student?: number
          status?: string
          dissolved_at?: string | null
          dissolved_reason?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'groups_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'groups_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // group_members
      // ────────────────────────────────────────────────────────────────────
      group_members: {
        Row: {
          group_id: string
          student_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          group_id: string
          student_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          group_id?: string
          student_id?: string
          joined_at?: string
          left_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_members_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // classes
      // ────────────────────────────────────────────────────────────────────
      classes: {
        Row: {
          id: string
          form: Database['public']['Enums']['class_form']
          subject_id: string
          tutor_id: string
          level: Database['public']['Enums']['student_level']
          student_id: string | null
          group_id: string | null
          monthly_fee: number
          room_id: string | null
          notes: string | null
          status: string
          start_date: string
          end_date: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          form: Database['public']['Enums']['class_form']
          subject_id: string
          tutor_id: string
          level: Database['public']['Enums']['student_level']
          student_id?: string | null
          group_id?: string | null
          monthly_fee: number
          room_id?: string | null
          notes?: string | null
          status?: string
          start_date: string
          end_date?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          form?: Database['public']['Enums']['class_form']
          subject_id?: string
          tutor_id?: string
          level?: Database['public']['Enums']['student_level']
          student_id?: string | null
          group_id?: string | null
          monthly_fee?: number
          room_id?: string | null
          notes?: string | null
          status?: string
          start_date?: string
          end_date?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'classes_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'classes_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'classes_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'classes_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'classes_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // weekly_slots
      // ────────────────────────────────────────────────────────────────────
      weekly_slots: {
        Row: {
          id: string
          class_id: string
          day_of_week: number
          start_time: string
          end_time: string
          room_id: string | null
          active_from: string
          active_to: string | null
        }
        Insert: {
          id?: string
          class_id: string
          day_of_week: number
          start_time: string
          end_time: string
          room_id?: string | null
          active_from: string
          active_to?: string | null
        }
        Update: {
          id?: string
          class_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          room_id?: string | null
          active_from?: string
          active_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'weekly_slots_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'weekly_slots_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // lessons
      // ────────────────────────────────────────────────────────────────────
      lessons: {
        Row: {
          id: string
          class_id: string
          tutor_id: string
          subject_id: string
          room_id: string | null
          lesson_date: string
          start_time: string
          end_time: string
          duration_minutes: number | null
          status: Database['public']['Enums']['lesson_status']
          weekly_slot_id: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancel_reason: string | null
          cancelled_more_than_24h: boolean | null
          makeup_for_lesson_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          tutor_id: string
          subject_id: string
          room_id?: string | null
          lesson_date: string
          start_time: string
          end_time: string
          status?: Database['public']['Enums']['lesson_status']
          weekly_slot_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancel_reason?: string | null
          cancelled_more_than_24h?: boolean | null
          makeup_for_lesson_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          tutor_id?: string
          subject_id?: string
          room_id?: string | null
          lesson_date?: string
          start_time?: string
          end_time?: string
          status?: Database['public']['Enums']['lesson_status']
          weekly_slot_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancel_reason?: string | null
          cancelled_more_than_24h?: boolean | null
          makeup_for_lesson_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lessons_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lessons_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'lessons_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lessons_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lessons_weekly_slot_id_fkey'
            columns: ['weekly_slot_id']
            isOneToOne: false
            referencedRelation: 'weekly_slots'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lessons_makeup_for_lesson_id_fkey'
            columns: ['makeup_for_lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // attendance
      // ────────────────────────────────────────────────────────────────────
      attendance: {
        Row: {
          id: string
          lesson_id: string
          student_id: string
          status: Database['public']['Enums']['attendance_status']
          notified_more_than_24h: boolean | null
          noted_at: string
          noted_by: string | null
        }
        Insert: {
          id?: string
          lesson_id: string
          student_id: string
          status: Database['public']['Enums']['attendance_status']
          notified_more_than_24h?: boolean | null
          noted_at?: string
          noted_by?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string
          student_id?: string
          status?: Database['public']['Enums']['attendance_status']
          notified_more_than_24h?: boolean | null
          noted_at?: string
          noted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'attendance_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendance_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // schedule_exceptions
      // ────────────────────────────────────────────────────────────────────
      schedule_exceptions: {
        Row: {
          id: string
          class_id: string
          exception_date: string
          exception_type: Database['public']['Enums']['schedule_exception_type']
          reason: string | null
          details: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          class_id: string
          exception_date: string
          exception_type: Database['public']['Enums']['schedule_exception_type']
          reason?: string | null
          details?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          class_id?: string
          exception_date?: string
          exception_type?: Database['public']['Enums']['schedule_exception_type']
          reason?: string | null
          details?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'schedule_exceptions_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // entries
      // ────────────────────────────────────────────────────────────────────
      entries: {
        Row: {
          id: string
          lesson_id: string
          status: Database['public']['Enums']['entry_status']
          topic: string | null
          note_for_student: string | null
          internal_note: string | null
          published_at: string | null
          locked_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          lesson_id: string
          status?: Database['public']['Enums']['entry_status']
          topic?: string | null
          note_for_student?: string | null
          internal_note?: string | null
          published_at?: string | null
          locked_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string
          status?: Database['public']['Enums']['entry_status']
          topic?: string | null
          note_for_student?: string | null
          internal_note?: string | null
          published_at?: string | null
          locked_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'entries_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: true
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // entry_parent_notes
      // ────────────────────────────────────────────────────────────────────
      entry_parent_notes: {
        Row: {
          entry_id: string
          student_id: string
          note: string
          created_at: string
          updated_at: string
        }
        Insert: {
          entry_id: string
          student_id: string
          note: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          entry_id?: string
          student_id?: string
          note?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'entry_parent_notes_entry_id_fkey'
            columns: ['entry_id']
            isOneToOne: false
            referencedRelation: 'entries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'entry_parent_notes_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // homework
      // ────────────────────────────────────────────────────────────────────
      homework: {
        Row: {
          id: string
          entry_id: string
          content: string
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          content: string
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          content?: string
          due_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'homework_entry_id_fkey'
            columns: ['entry_id']
            isOneToOne: true
            referencedRelation: 'entries'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // homework_completions
      // ────────────────────────────────────────────────────────────────────
      homework_completions: {
        Row: {
          homework_id: string
          student_id: string
          is_done: boolean
          done_at: string | null
          is_verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          homework_id: string
          student_id: string
          is_done?: boolean
          done_at?: string | null
          is_verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          homework_id?: string
          student_id?: string
          is_done?: boolean
          done_at?: string | null
          is_verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'homework_completions_homework_id_fkey'
            columns: ['homework_id']
            isOneToOne: false
            referencedRelation: 'homework'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homework_completions_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'homework_completions_verified_by_fkey'
            columns: ['verified_by']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // payments
      // ────────────────────────────────────────────────────────────────────
      payments: {
        Row: {
          id: string
          parent_id: string
          billing_month: string
          due_date: string
          total_amount: number
          status: Database['public']['Enums']['payment_status']
          delay_number: number
          paid_at: string | null
          paid_amount: number | null
          paid_on_time: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          billing_month: string
          due_date: string
          total_amount: number
          status?: Database['public']['Enums']['payment_status']
          delay_number?: number
          paid_at?: string | null
          paid_amount?: number | null
          paid_on_time?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          billing_month?: string
          due_date?: string
          total_amount?: number
          status?: Database['public']['Enums']['payment_status']
          delay_number?: number
          paid_at?: string | null
          paid_amount?: number | null
          paid_on_time?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'parents'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // payment_lines
      // ────────────────────────────────────────────────────────────────────
      payment_lines: {
        Row: {
          id: string
          payment_id: string
          student_id: string
          class_id: string | null
          description: string
          lessons_per_week: number | null
          amount: number
        }
        Insert: {
          id?: string
          payment_id: string
          student_id: string
          class_id?: string | null
          description: string
          lessons_per_week?: number | null
          amount: number
        }
        Update: {
          id?: string
          payment_id?: string
          student_id?: string
          class_id?: string | null
          description?: string
          lessons_per_week?: number | null
          amount?: number
        }
        Relationships: [
          {
            foreignKeyName: 'payment_lines_payment_id_fkey'
            columns: ['payment_id']
            isOneToOne: false
            referencedRelation: 'payments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payment_lines_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'payment_lines_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // payment_reminder_templates
      // ────────────────────────────────────────────────────────────────────
      payment_reminder_templates: {
        Row: {
          id: string
          send_day_of_month: number
          send_time: string
          label: string
          subject_template: string
          body_template: string
          is_enabled: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          id?: string
          send_day_of_month: number
          send_time?: string
          label: string
          subject_template: string
          body_template: string
          is_enabled?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          id?: string
          send_day_of_month?: number
          send_time?: string
          label?: string
          subject_template?: string
          body_template?: string
          is_enabled?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }

      // ────────────────────────────────────────────────────────────────────
      // payment_reminders_sent
      // ────────────────────────────────────────────────────────────────────
      payment_reminders_sent: {
        Row: {
          id: string
          payment_id: string
          template_id: string
          sent_at: string
          channel: Database['public']['Enums']['message_channel']
          delivered: boolean | null
          error_message: string | null
        }
        Insert: {
          id?: string
          payment_id: string
          template_id: string
          sent_at?: string
          channel: Database['public']['Enums']['message_channel']
          delivered?: boolean | null
          error_message?: string | null
        }
        Update: {
          id?: string
          payment_id?: string
          template_id?: string
          sent_at?: string
          channel?: Database['public']['Enums']['message_channel']
          delivered?: boolean | null
          error_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'payment_reminders_sent_payment_id_fkey'
            columns: ['payment_id']
            isOneToOne: false
            referencedRelation: 'payments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payment_reminders_sent_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'payment_reminder_templates'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // notification_preferences
      // ────────────────────────────────────────────────────────────────────
      notification_preferences: {
        Row: {
          profile_id: string
          notif_type: Database['public']['Enums']['notification_type']
          email_enabled: boolean
          push_enabled: boolean
        }
        Insert: {
          profile_id: string
          notif_type: Database['public']['Enums']['notification_type']
          email_enabled?: boolean
          push_enabled?: boolean
        }
        Update: {
          profile_id?: string
          notif_type?: Database['public']['Enums']['notification_type']
          email_enabled?: boolean
          push_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // makeup_requests
      // ────────────────────────────────────────────────────────────────────
      makeup_requests: {
        Row: {
          id: string
          original_lesson_id: string
          status: Database['public']['Enums']['makeup_status']
          current_round: number
          deadline: string | null
          resulting_lesson_id: string | null
          cancel_reason: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          outcome_label: string | null
        }
        Insert: {
          id?: string
          original_lesson_id: string
          status?: Database['public']['Enums']['makeup_status']
          current_round?: number
          deadline?: string | null
          resulting_lesson_id?: string | null
          cancel_reason?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          outcome_label?: string | null
        }
        Update: {
          id?: string
          original_lesson_id?: string
          status?: Database['public']['Enums']['makeup_status']
          current_round?: number
          deadline?: string | null
          resulting_lesson_id?: string | null
          cancel_reason?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          outcome_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'makeup_requests_original_lesson_id_fkey'
            columns: ['original_lesson_id']
            isOneToOne: true
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'makeup_requests_resulting_lesson_id_fkey'
            columns: ['resulting_lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // makeup_proposals
      // ────────────────────────────────────────────────────────────────────
      makeup_proposals: {
        Row: {
          id: string
          request_id: string
          round_number: number
          proposed_by: Database['public']['Enums']['makeup_actor']
          proposed_by_id: string
          action: Database['public']['Enums']['makeup_action']
          proposed_date: string | null
          proposed_start: string | null
          proposed_end: string | null
          extra_slot_id: string | null
          note: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          round_number: number
          proposed_by: Database['public']['Enums']['makeup_actor']
          proposed_by_id: string
          action: Database['public']['Enums']['makeup_action']
          proposed_date?: string | null
          proposed_start?: string | null
          proposed_end?: string | null
          extra_slot_id?: string | null
          note?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          round_number?: number
          proposed_by?: Database['public']['Enums']['makeup_actor']
          proposed_by_id?: string
          action?: Database['public']['Enums']['makeup_action']
          proposed_date?: string | null
          proposed_start?: string | null
          proposed_end?: string | null
          extra_slot_id?: string | null
          note?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'makeup_proposals_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'makeup_requests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'makeup_proposals_extra_slot_id_fkey'
            columns: ['extra_slot_id']
            isOneToOne: false
            referencedRelation: 'extra_slots'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // tutor_absences
      // ────────────────────────────────────────────────────────────────────
      tutor_absences: {
        Row: {
          id: string
          tutor_id: string
          absence_type: Database['public']['Enums']['tutor_absence_type']
          start_date: string
          end_date: string
          reason: string | null
          approved_at: string | null
          approved_by: string | null
          affected_lessons_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          absence_type: Database['public']['Enums']['tutor_absence_type']
          start_date: string
          end_date: string
          reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          affected_lessons_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          absence_type?: Database['public']['Enums']['tutor_absence_type']
          start_date?: string
          end_date?: string
          reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          affected_lessons_count?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_absences_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['profile_id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // admin_announcements
      // ────────────────────────────────────────────────────────────────────
      admin_announcements: {
        Row: {
          id: string
          sent_by: string
          audience: Database['public']['Enums']['message_audience']
          recipient_id: string | null
          channel: Database['public']['Enums']['message_channel']
          subject: string
          body: string
          recipients_count: number | null
          sent_at: string
        }
        Insert: {
          id?: string
          sent_by: string
          audience: Database['public']['Enums']['message_audience']
          recipient_id?: string | null
          channel: Database['public']['Enums']['message_channel']
          subject: string
          body: string
          recipients_count?: number | null
          sent_at?: string
        }
        Update: {
          id?: string
          sent_by?: string
          audience?: Database['public']['Enums']['message_audience']
          recipient_id?: string | null
          channel?: Database['public']['Enums']['message_channel']
          subject?: string
          body?: string
          recipients_count?: number | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'admin_announcements_sent_by_fkey'
            columns: ['sent_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'admin_announcements_recipient_id_fkey'
            columns: ['recipient_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // lesson_cancel_requests (0016)
      // ────────────────────────────────────────────────────────────────────
      lesson_cancel_requests: {
        Row: {
          id: string
          lesson_id: string
          student_id: string
          status: 'pending' | 'approved' | 'rejected'
          reason: string | null
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          lesson_id: string
          student_id: string
          status?: 'pending' | 'approved' | 'rejected'
          reason?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string
          student_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          reason?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'lesson_cancel_requests_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lesson_cancel_requests_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'lesson_cancel_requests_resolved_by_fkey'
            columns: ['resolved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ────────────────────────────────────────────────────────────────────
      // direct_messages
      // ────────────────────────────────────────────────────────────────────
      direct_messages: {
        Row: {
          id: string
          thread_id: string | null
          sender_id: string
          recipient_id: string
          subject: string | null
          body: string
          is_read: boolean
          read_at: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          thread_id?: string | null
          sender_id: string
          recipient_id: string
          subject?: string | null
          body: string
          is_read?: boolean
          read_at?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          thread_id?: string | null
          sender_id?: string
          recipient_id?: string
          subject?: string | null
          body?: string
          is_read?: boolean
          read_at?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'direct_messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'direct_messages_recipient_id_fkey'
            columns: ['recipient_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }

    Views: Record<string, never>
    Functions: Record<string, never>

    Enums: {
      user_role: 'admin' | 'tutor' | 'parent' | 'student'
      student_level: 'SP' | 'E8' | 'SR' | 'SR_EXT' | 'EM' | 'EM_EXT'
      lesson_status:
        | 'planned'
        | 'in_progress'
        | 'completed'
        | 'completed_no_entry'
        | 'cancelled'
        | 'no_show'
        | 'makeup'
      entry_status: 'missing' | 'draft' | 'published' | 'locked' | 'blocked'
      attendance_status: 'present' | 'absent'
      class_form: 'individual' | 'pair' | 'group'
      payment_status: 'paid' | 'pending' | 'overdue' | 'paid_late'
      makeup_status:
        | 'waiting_for_parent'
        | 'waiting_for_tutor'
        | 'proposed'
        | 'accepted'
        | 'rejected'
        | 'expired'
        | 'completed'
        | 'cancelled'
      makeup_actor: 'tutor' | 'parent'
      makeup_action: 'proposed' | 'counter_proposed' | 'accepted' | 'rejected'
      tutor_absence_type: 'sick' | 'vacation' | 'other'
      message_channel: 'email' | 'push' | 'both'
      rate_effective_mode: 'immediately' | 'next_month' | 'specific_date'
      schedule_exception_type: 'cancelled' | 'room_change' | 'time_change'
      message_audience:
        | 'all_parents'
        | 'parents_with_overdue'
        | 'all_tutors'
        | 'individual_parent'
        | 'individual_tutor'
      working_hours_kind: 'lessons' | 'phone'
      notification_type:
        | 'payment_reminder_10'
        | 'payment_reminder_20'
        | 'payment_reminder_last'
        | 'new_entry'
        | 'schedule_change'
        | 'makeup_proposal'
        | 'message_received'
        | 'new_absence_request'
        | 'entry_blocked_48h'
        | 'payment_received'
        | 'payment_overdue'
        | 'makeup_no_response'
        | 'contract_ending'
    }

    CompositeTypes: Record<string, never>
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Helper types — match @supabase/supabase-js conventions
// ════════════════════════════════════════════════════════════════════════════

type PublicSchema = Database['public']

export type Tables<
  T extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][T]['Row']

export type TablesInsert<
  T extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][T]['Insert']

export type TablesUpdate<
  T extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][T]['Update']

export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T]
