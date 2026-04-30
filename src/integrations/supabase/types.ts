export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      commissions: {
        Row: {
          base_amount: number
          commission_amount: number
          created_at: string
          id: string
          rate: number
          transaction_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          base_amount: number
          commission_amount: number
          created_at?: string
          id?: string
          rate: number
          transaction_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          base_amount?: number
          commission_amount?: number
          created_at?: string
          id?: string
          rate?: number
          transaction_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          accused_id: string
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          accused_id: string
          created_at?: string
          id?: string
          reason?: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          accused_id?: string
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          commentaire: string | null
          created_at: string
          evaluated_id: string
          evaluator_id: string
          id: string
          note: number
          transaction_id: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          evaluated_id: string
          evaluator_id: string
          id?: string
          note: number
          transaction_id: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          evaluated_id?: string
          evaluator_id?: string
          id?: string
          note?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invitee_id: string
          location: string | null
          meeting_date: string
          organizer_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invitee_id: string
          location?: string | null
          meeting_date: string
          organizer_id: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invitee_id?: string
          location?: string | null
          meeting_date?: string
          organizer_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      operator_links: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          operator_name: string
          phone_number: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          operator_name: string
          phone_number?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          operator_name?: string
          phone_number?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_initials: string | null
          avg_rating: number
          bio: string | null
          created_at: string
          debt_capacity: number
          display_name: string
          email: string | null
          first_transaction_at: string | null
          id: string
          last_transaction_at: string | null
          license_number: string | null
          lokalpay_id: string
          market: string
          organization_name: string | null
          phone: string
          profile_type: string
          rating_count: number
          reliability_pct: number
          score: number
          score_level: string
          show_email: boolean
          show_phone: boolean
          show_volume: boolean
          solvency_score: number
          subscription_plan: string
          total_transactions: number
          total_volume: number
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          avatar_initials?: string | null
          avg_rating?: number
          bio?: string | null
          created_at?: string
          debt_capacity?: number
          display_name?: string
          email?: string | null
          first_transaction_at?: string | null
          id?: string
          last_transaction_at?: string | null
          license_number?: string | null
          lokalpay_id?: string
          market?: string
          organization_name?: string | null
          phone?: string
          profile_type?: string
          rating_count?: number
          reliability_pct?: number
          score?: number
          score_level?: string
          show_email?: boolean
          show_phone?: boolean
          show_volume?: boolean
          solvency_score?: number
          subscription_plan?: string
          total_transactions?: number
          total_volume?: number
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          avatar_initials?: string | null
          avg_rating?: number
          bio?: string | null
          created_at?: string
          debt_capacity?: number
          display_name?: string
          email?: string | null
          first_transaction_at?: string | null
          id?: string
          last_transaction_at?: string | null
          license_number?: string | null
          lokalpay_id?: string
          market?: string
          organization_name?: string | null
          phone?: string
          profile_type?: string
          rating_count?: number
          reliability_pct?: number
          score?: number
          score_level?: string
          show_email?: boolean
          show_phone?: boolean
          show_volume?: boolean
          solvency_score?: number
          subscription_plan?: string
          total_transactions?: number
          total_volume?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_fcfa: number
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_fcfa?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_fcfa?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          blockchain_status: string
          created_at: string
          id: string
          montant: number
          partenaire: string
          payment_method: string
          produit: string
          recipient_id: string | null
          synced: boolean
          tx_hash: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blockchain_status?: string
          created_at?: string
          id?: string
          montant: number
          partenaire?: string
          payment_method?: string
          produit?: string
          recipient_id?: string | null
          synced?: boolean
          tx_hash?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blockchain_status?: string
          created_at?: string
          id?: string
          montant?: number
          partenaire?: string
          payment_method?: string
          produit?: string
          recipient_id?: string | null
          synced?: boolean
          tx_hash?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_reputation_score: {
        Args: { p_user_id: string }
        Returns: number
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
  public: {
    Enums: {},
  },
} as const
