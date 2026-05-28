export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      admin_announcements: {
        Row: {
          audience: Database["public"]["Enums"]["message_audience"]
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          id: string
          recipient_id: string | null
          recipients_count: number | null
          sent_at: string
          sent_by: string
          subject: string
        }
        Insert: {
          audience: Database["public"]["Enums"]["message_audience"]
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          id?: string
          recipient_id?: string | null
          recipients_count?: number | null
          sent_at?: string
          sent_by: string
          subject: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["message_audience"]
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          id?: string
          recipient_id?: string | null
          recipients_count?: number | null
          sent_at?: string
          sent_by?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_announcements_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_announcements_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          id: string
          lesson_id: string
          noted_at: string
          noted_by: string | null
          notified_more_than_24h: boolean | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          id?: string
          lesson_id: string
          noted_at?: string
          noted_by?: string | null
          notified_more_than_24h?: boolean | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          id?: string
          lesson_id?: string
          noted_at?: string
          noted_by?: string | null
          notified_more_than_24h?: boolean | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_noted_by_fkey"
            columns: ["noted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          tutor_id: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          tutor_id: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      center_settings: {
        Row: {
          address: string
          bank_account: string | null
          bank_name: string | null
          email: string
          full_name: string | null
          id: number
          name: string
          nip: string | null
          payment_title_template: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          bank_account?: string | null
          bank_name?: string | null
          email: string
          full_name?: string | null
          id?: number
          name: string
          nip?: string | null
          payment_title_template?: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          bank_account?: string | null
          bank_name?: string | null
          email?: string
          full_name?: string | null
          id?: number
          name?: string
          nip?: string | null
          payment_title_template?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          form: Database["public"]["Enums"]["class_form"]
          goal: Database["public"]["Enums"]["class_goal"] | null
          group_id: string | null
          id: string
          level: Database["public"]["Enums"]["student_level"]
          level_scope: Database["public"]["Enums"]["class_level_scope"] | null
          monthly_fee: number
          notes: string | null
          room_id: string | null
          start_date: string
          status: string
          student_id: string | null
          subject_id: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          form: Database["public"]["Enums"]["class_form"]
          goal?: Database["public"]["Enums"]["class_goal"] | null
          group_id?: string | null
          id?: string
          level: Database["public"]["Enums"]["student_level"]
          level_scope?: Database["public"]["Enums"]["class_level_scope"] | null
          monthly_fee: number
          notes?: string | null
          room_id?: string | null
          start_date: string
          status?: string
          student_id?: string | null
          subject_id: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          form?: Database["public"]["Enums"]["class_form"]
          goal?: Database["public"]["Enums"]["class_goal"] | null
          group_id?: string | null
          id?: string
          level?: Database["public"]["Enums"]["student_level"]
          level_scope?: Database["public"]["Enums"]["class_level_scope"] | null
          monthly_fee?: number
          notes?: string | null
          room_id?: string | null
          start_date?: string
          status?: string
          student_id?: string | null
          subject_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      contract_terms: {
        Row: {
          cancellation_hours_cutoff: number
          cancellation_notice_days: number
          cancellation_policy: string
          id: number
          late_entry_hours: number
          makeup_deadline_days: number
          min_contract_months: number
          no_show_policy: string
          payment_deadline_day: number
          updated_at: string
        }
        Insert: {
          cancellation_hours_cutoff?: number
          cancellation_notice_days?: number
          cancellation_policy?: string
          id?: number
          late_entry_hours?: number
          makeup_deadline_days?: number
          min_contract_months?: number
          no_show_policy?: string
          payment_deadline_day?: number
          updated_at?: string
        }
        Update: {
          cancellation_hours_cutoff?: number
          cancellation_notice_days?: number
          cancellation_policy?: string
          id?: number
          late_entry_hours?: number
          makeup_deadline_days?: number
          min_contract_months?: number
          no_show_policy?: string
          payment_deadline_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          id: string
          is_read: boolean
          read_at: string | null
          recipient_id: string
          sender_id: string
          sent_at: string
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          body: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          recipient_id: string
          sender_id: string
          sent_at?: string
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          body?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          sent_at?: string
          subject?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          internal_note: string | null
          lesson_id: string
          locked_at: string | null
          note_for_student: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["entry_status"]
          topic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          internal_note?: string | null
          lesson_id: string
          locked_at?: string | null
          note_for_student?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          topic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          internal_note?: string | null
          lesson_id?: string
          locked_at?: string | null
          note_for_student?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_parent_notes: {
        Row: {
          created_at: string
          entry_id: string
          note: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          note: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          note?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_parent_notes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_parent_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      extra_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          note: string | null
          room_id: string | null
          slot_date: string
          start_time: string
          status: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          note?: string | null
          room_id?: string | null
          slot_date: string
          start_time: string
          status?: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          note?: string | null
          room_id?: string | null
          slot_date?: string
          start_time?: string
          status?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_slots_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_slots_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          left_at: string | null
          student_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          left_at?: string | null
          student_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          left_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string | null
          dissolved_at: string | null
          dissolved_reason: string | null
          id: string
          level: Database["public"]["Enums"]["student_level"]
          max_size: number
          monthly_fee_per_student: number
          name: string
          status: string
          subject_id: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dissolved_at?: string | null
          dissolved_reason?: string | null
          id?: string
          level: Database["public"]["Enums"]["student_level"]
          max_size: number
          monthly_fee_per_student: number
          name: string
          status?: string
          subject_id: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dissolved_at?: string | null
          dissolved_reason?: string | null
          id?: string
          level?: Database["public"]["Enums"]["student_level"]
          max_size?: number
          monthly_fee_per_student?: number
          name?: string
          status?: string
          subject_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      homework: {
        Row: {
          content: string
          created_at: string
          due_date: string | null
          entry_id: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string
          due_date?: string | null
          entry_id: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string
          due_date?: string | null
          entry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: true
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_completions: {
        Row: {
          done_at: string | null
          homework_id: string
          is_done: boolean
          is_verified: boolean
          student_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          done_at?: string | null
          homework_id: string
          is_done?: boolean
          is_verified?: boolean
          student_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          done_at?: string | null
          homework_id?: string
          is_done?: boolean
          is_verified?: boolean
          student_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_completions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_completions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "homework_completions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      lesson_cancel_requests: {
        Row: {
          id: string
          lesson_id: string
          reason: string | null
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          id?: string
          lesson_id: string
          reason?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          student_id: string
        }
        Update: {
          id?: string
          lesson_id?: string
          reason?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_cancel_requests_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_cancel_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_cancel_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      lessons: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_more_than_24h: boolean | null
          class_id: string
          created_at: string
          duration_minutes: number | null
          end_time: string
          id: string
          lesson_date: string
          makeup_for_lesson_id: string | null
          room_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["lesson_status"]
          subject_id: string
          tutor_id: string
          updated_at: string
          weekly_slot_id: string | null
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_more_than_24h?: boolean | null
          class_id: string
          created_at?: string
          duration_minutes?: number | null
          end_time: string
          id?: string
          lesson_date: string
          makeup_for_lesson_id?: string | null
          room_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["lesson_status"]
          subject_id: string
          tutor_id: string
          updated_at?: string
          weekly_slot_id?: string | null
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_more_than_24h?: boolean | null
          class_id?: string
          created_at?: string
          duration_minutes?: number | null
          end_time?: string
          id?: string
          lesson_date?: string
          makeup_for_lesson_id?: string | null
          room_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["lesson_status"]
          subject_id?: string
          tutor_id?: string
          updated_at?: string
          weekly_slot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_makeup_for_lesson_id_fkey"
            columns: ["makeup_for_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "lessons_weekly_slot_id_fkey"
            columns: ["weekly_slot_id"]
            isOneToOne: false
            referencedRelation: "weekly_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      makeup_proposals: {
        Row: {
          action: Database["public"]["Enums"]["makeup_action"]
          created_at: string
          extra_slot_id: string | null
          id: string
          note: string | null
          proposed_by: Database["public"]["Enums"]["makeup_actor"]
          proposed_by_id: string
          proposed_date: string | null
          proposed_end: string | null
          proposed_start: string | null
          request_id: string
          responded_at: string | null
          round_number: number
        }
        Insert: {
          action: Database["public"]["Enums"]["makeup_action"]
          created_at?: string
          extra_slot_id?: string | null
          id?: string
          note?: string | null
          proposed_by: Database["public"]["Enums"]["makeup_actor"]
          proposed_by_id: string
          proposed_date?: string | null
          proposed_end?: string | null
          proposed_start?: string | null
          request_id: string
          responded_at?: string | null
          round_number: number
        }
        Update: {
          action?: Database["public"]["Enums"]["makeup_action"]
          created_at?: string
          extra_slot_id?: string | null
          id?: string
          note?: string | null
          proposed_by?: Database["public"]["Enums"]["makeup_actor"]
          proposed_by_id?: string
          proposed_date?: string | null
          proposed_end?: string | null
          proposed_start?: string | null
          request_id?: string
          responded_at?: string | null
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "makeup_proposals_extra_slot_id_fkey"
            columns: ["extra_slot_id"]
            isOneToOne: false
            referencedRelation: "extra_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_proposals_proposed_by_id_fkey"
            columns: ["proposed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_proposals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "makeup_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      makeup_requests: {
        Row: {
          cancel_reason: string | null
          completed_at: string | null
          created_at: string
          current_round: number
          deadline: string | null
          id: string
          original_lesson_id: string
          outcome_label: string | null
          resulting_lesson_id: string | null
          status: Database["public"]["Enums"]["makeup_status"]
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          completed_at?: string | null
          created_at?: string
          current_round?: number
          deadline?: string | null
          id?: string
          original_lesson_id: string
          outcome_label?: string | null
          resulting_lesson_id?: string | null
          status?: Database["public"]["Enums"]["makeup_status"]
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          completed_at?: string | null
          created_at?: string
          current_round?: number
          deadline?: string | null
          id?: string
          original_lesson_id?: string
          outcome_label?: string | null
          resulting_lesson_id?: string | null
          status?: Database["public"]["Enums"]["makeup_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "makeup_requests_original_lesson_id_fkey"
            columns: ["original_lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_requests_resulting_lesson_id_fkey"
            columns: ["resulting_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean
          notif_type: Database["public"]["Enums"]["notification_type"]
          profile_id: string
          push_enabled: boolean
        }
        Insert: {
          email_enabled?: boolean
          notif_type: Database["public"]["Enums"]["notification_type"]
          profile_id: string
          push_enabled?: boolean
        }
        Update: {
          email_enabled?: boolean
          notif_type?: Database["public"]["Enums"]["notification_type"]
          profile_id?: string
          push_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: string | null
          created_at: string
          last_overdue_at: string | null
          late_count: number
          profile_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          last_overdue_at?: string | null
          late_count?: number
          profile_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          last_overdue_at?: string | null
          late_count?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_lines: {
        Row: {
          amount: number
          class_id: string | null
          description: string
          id: string
          lessons_per_week: number | null
          payment_id: string
          student_id: string
        }
        Insert: {
          amount: number
          class_id?: string | null
          description: string
          id?: string
          lessons_per_week?: number | null
          payment_id: string
          student_id: string
        }
        Update: {
          amount?: number
          class_id?: string | null
          description?: string
          id?: string
          lessons_per_week?: number | null
          payment_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_lines_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_lines_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_lines_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      payment_reminder_templates: {
        Row: {
          body_template: string
          id: string
          is_enabled: boolean
          label: string
          send_day_of_month: number
          send_time: string
          sort_order: number
          subject_template: string
          updated_at: string
        }
        Insert: {
          body_template: string
          id?: string
          is_enabled?: boolean
          label: string
          send_day_of_month: number
          send_time?: string
          sort_order?: number
          subject_template: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          id?: string
          is_enabled?: boolean
          label?: string
          send_day_of_month?: number
          send_time?: string
          sort_order?: number
          subject_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_reminders_sent: {
        Row: {
          channel: Database["public"]["Enums"]["message_channel"]
          delivered: boolean | null
          error_message: string | null
          id: string
          payment_id: string
          sent_at: string
          template_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["message_channel"]
          delivered?: boolean | null
          error_message?: string | null
          id?: string
          payment_id: string
          sent_at?: string
          template_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["message_channel"]
          delivered?: boolean | null
          error_message?: string | null
          id?: string
          payment_id?: string
          sent_at?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_sent_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_sent_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "payment_reminder_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          billing_month: string
          created_at: string
          delay_number: number
          due_date: string
          id: string
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          paid_on_time: boolean | null
          parent_id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          billing_month: string
          created_at?: string
          delay_number?: number
          due_date: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          paid_on_time?: boolean | null
          parent_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          billing_month?: string
          created_at?: string
          delay_number?: number
          due_date?: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          paid_on_time?: boolean | null
          parent_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          initials: string | null
          is_active: boolean
          last_login_at: string | null
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id: string
          initials?: string | null
          is_active?: boolean
          last_login_at?: string | null
          last_name: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          initials?: string | null
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          equipment: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          capacity: number
          created_at?: string
          equipment?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          capacity?: number
          created_at?: string
          equipment?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      schedule_exceptions: {
        Row: {
          class_id: string
          created_at: string
          created_by: string | null
          details: string | null
          exception_date: string
          exception_type: Database["public"]["Enums"]["schedule_exception_type"]
          id: string
          reason: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          exception_date: string
          exception_type: Database["public"]["Enums"]["schedule_exception_type"]
          id?: string
          reason?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          exception_date?: string
          exception_type?: Database["public"]["Enums"]["schedule_exception_type"]
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_exceptions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_exceptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string
          created_at: string
          level: Database["public"]["Enums"]["student_level"]
          parent_id: string
          profile_id: string
          school_class: string
          school_name: string | null
        }
        Insert: {
          birth_date: string
          created_at?: string
          level: Database["public"]["Enums"]["student_level"]
          parent_id: string
          profile_id: string
          school_class: string
          school_name?: string | null
        }
        Update: {
          birth_date?: string
          created_at?: string
          level?: Database["public"]["Enums"]["student_level"]
          parent_id?: string
          profile_id?: string
          school_class?: string
          school_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      tutor_absences: {
        Row: {
          absence_type: Database["public"]["Enums"]["tutor_absence_type"]
          affected_lessons_count: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          end_time: string | null
          id: string
          is_urgent: boolean
          reason: string | null
          start_date: string
          start_time: string | null
          tutor_id: string
        }
        Insert: {
          absence_type: Database["public"]["Enums"]["tutor_absence_type"]
          affected_lessons_count?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          end_time?: string | null
          id?: string
          is_urgent?: boolean
          reason?: string | null
          start_date: string
          start_time?: string | null
          tutor_id: string
        }
        Update: {
          absence_type?: Database["public"]["Enums"]["tutor_absence_type"]
          affected_lessons_count?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          end_time?: string | null
          id?: string
          is_urgent?: boolean
          reason?: string | null
          start_date?: string
          start_time?: string | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_absences_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_absences_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tutor_penalty_points: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          id: string
          lesson_id: string | null
          reason: string
          tutor_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          id?: string
          lesson_id?: string | null
          reason: string
          tutor_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          id?: string
          lesson_id?: string | null
          reason?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_penalty_points_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_penalty_points_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_penalty_points_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tutor_rates: {
        Row: {
          created_at: string
          created_by: string | null
          effective_from: string
          group_rate: number
          id: string
          individual_rate: number
          note: string | null
          tutor_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_from: string
          group_rate: number
          id?: string
          individual_rate: number
          note?: string | null
          tutor_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_from?: string
          group_rate?: number
          id?: string
          individual_rate?: number
          note?: string | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_rates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_rates_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tutor_subjects: {
        Row: {
          subject_id: string
          tutor_id: string
        }
        Insert: {
          subject_id: string
          tutor_id: string
        }
        Update: {
          subject_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_subjects_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tutors: {
        Row: {
          bio: string | null
          created_at: string
          hired_date: string | null
          profile_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          hired_date?: string | null
          profile_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          hired_date?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_slots: {
        Row: {
          active_from: string
          active_to: string | null
          class_id: string
          day_of_week: number
          end_time: string
          id: string
          room_id: string | null
          start_time: string
        }
        Insert: {
          active_from: string
          active_to?: string | null
          class_id: string
          day_of_week: number
          end_time: string
          id?: string
          room_id?: string | null
          start_time: string
        }
        Update: {
          active_from?: string
          active_to?: string | null
          class_id?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_slots_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_slots_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          close_time: string
          day_of_week: number
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["working_hours_kind"]
          open_time: string
        }
        Insert: {
          close_time: string
          day_of_week: number
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["working_hours_kind"]
          open_time: string
        }
        Update: {
          close_time?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["working_hours_kind"]
          open_time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attendance_status: "present" | "absent"
      class_form: "individual" | "pair" | "group"
      class_goal: "e8" | "matura" | "support"
      class_level_scope: "basic" | "extended"
      entry_status: "missing" | "draft" | "published" | "locked" | "blocked"
      lesson_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "completed_no_entry"
        | "cancelled"
        | "no_show"
        | "makeup"
      makeup_action: "proposed" | "counter_proposed" | "accepted" | "rejected"
      makeup_actor: "tutor" | "parent"
      makeup_status:
        | "waiting_for_parent"
        | "waiting_for_tutor"
        | "proposed"
        | "accepted"
        | "rejected"
        | "expired"
        | "completed"
        | "cancelled"
      message_audience:
        | "all_parents"
        | "parents_with_overdue"
        | "all_tutors"
        | "individual_parent"
        | "individual_tutor"
      message_channel: "email" | "push" | "both"
      notification_type:
        | "payment_reminder_10"
        | "payment_reminder_20"
        | "payment_reminder_last"
        | "new_entry"
        | "schedule_change"
        | "makeup_proposal"
        | "message_received"
        | "new_absence_request"
        | "entry_blocked_48h"
        | "payment_received"
        | "payment_overdue"
        | "makeup_no_response"
        | "contract_ending"
      payment_status: "paid" | "pending" | "overdue" | "paid_late"
      rate_effective_mode: "immediately" | "next_month" | "specific_date"
      schedule_exception_type: "cancelled" | "room_change" | "time_change"
      student_level: "SP" | "E8" | "SR" | "SR_EXT" | "EM" | "EM_EXT"
      tutor_absence_type: "sick" | "vacation" | "other"
      user_role: "admin" | "tutor" | "parent" | "student"
      working_hours_kind: "lessons" | "phone"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      attendance_status: ["present", "absent"],
      class_form: ["individual", "pair", "group"],
      class_goal: ["e8", "matura", "support"],
      class_level_scope: ["basic", "extended"],
      entry_status: ["missing", "draft", "published", "locked", "blocked"],
      lesson_status: [
        "planned",
        "in_progress",
        "completed",
        "completed_no_entry",
        "cancelled",
        "no_show",
        "makeup",
      ],
      makeup_action: ["proposed", "counter_proposed", "accepted", "rejected"],
      makeup_actor: ["tutor", "parent"],
      makeup_status: [
        "waiting_for_parent",
        "waiting_for_tutor",
        "proposed",
        "accepted",
        "rejected",
        "expired",
        "completed",
        "cancelled",
      ],
      message_audience: [
        "all_parents",
        "parents_with_overdue",
        "all_tutors",
        "individual_parent",
        "individual_tutor",
      ],
      message_channel: ["email", "push", "both"],
      notification_type: [
        "payment_reminder_10",
        "payment_reminder_20",
        "payment_reminder_last",
        "new_entry",
        "schedule_change",
        "makeup_proposal",
        "message_received",
        "new_absence_request",
        "entry_blocked_48h",
        "payment_received",
        "payment_overdue",
        "makeup_no_response",
        "contract_ending",
      ],
      payment_status: ["paid", "pending", "overdue", "paid_late"],
      rate_effective_mode: ["immediately", "next_month", "specific_date"],
      schedule_exception_type: ["cancelled", "room_change", "time_change"],
      student_level: ["SP", "E8", "SR", "SR_EXT", "EM", "EM_EXT"],
      tutor_absence_type: ["sick", "vacation", "other"],
      user_role: ["admin", "tutor", "parent", "student"],
      working_hours_kind: ["lessons", "phone"],
    },
  },
} as const

