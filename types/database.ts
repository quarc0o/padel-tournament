export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      matches: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          round_number: number;
          started_at: string | null;
          status: Database["public"]["Enums"]["match_status"];
          team_a_player1_id: string;
          team_a_player2_id: string;
          team_a_score: number | null;
          team_b_player1_id: string;
          team_b_player2_id: string;
          team_b_score: number | null;
          tournament_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          round_number: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["match_status"];
          team_a_player1_id: string;
          team_a_player2_id: string;
          team_a_score?: number | null;
          team_b_player1_id: string;
          team_b_player2_id: string;
          team_b_score?: number | null;
          tournament_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          round_number?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["match_status"];
          team_a_player1_id?: string;
          team_a_player2_id?: string;
          team_a_score?: number | null;
          team_b_player1_id?: string;
          team_b_player2_id?: string;
          team_b_score?: number | null;
          tournament_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_team_a_player1_id_fkey";
            columns: ["team_a_player1_id"];
            isOneToOne: false;
            referencedRelation: "tournament_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_team_a_player2_id_fkey";
            columns: ["team_a_player2_id"];
            isOneToOne: false;
            referencedRelation: "tournament_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_team_b_player1_id_fkey";
            columns: ["team_b_player1_id"];
            isOneToOne: false;
            referencedRelation: "tournament_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_team_b_player2_id_fkey";
            columns: ["team_b_player2_id"];
            isOneToOne: false;
            referencedRelation: "tournament_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          }
        ];
      };
      player_pairings: {
        Row: {
          id: string;
          paired_as_opponents: number;
          paired_as_teammates: number;
          player1_id: string;
          player2_id: string;
          tournament_id: string;
        };
        Insert: {
          id?: string;
          paired_as_opponents?: number;
          paired_as_teammates?: number;
          player1_id: string;
          player2_id: string;
          tournament_id: string;
        };
        Update: {
          id?: string;
          paired_as_opponents?: number;
          paired_as_teammates?: number;
          player1_id?: string;
          player2_id?: string;
          tournament_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_pairings_player1_id_fkey";
            columns: ["player1_id"];
            isOneToOne: false;
            referencedRelation: "tournament_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_pairings_player2_id_fkey";
            columns: ["player2_id"];
            isOneToOne: false;
            referencedRelation: "tournament_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_pairings_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          }
        ];
      };
      tournament_players: {
        Row: {
          created_at: string;
          id: string;
          matches_played: number;
          matches_won: number;
          player_name: string;
          player_order: number;
          total_points: number;
          tournament_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          matches_played?: number;
          matches_won?: number;
          player_name: string;
          player_order: number;
          total_points?: number;
          tournament_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          matches_played?: number;
          matches_won?: number;
          player_name?: string;
          player_order?: number;
          total_points?: number;
          tournament_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournament_players_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          }
        ];
      };
      tournaments: {
        Row: {
          created_at: string;
          created_by: string | null;
          current_round: number;
          id: string;
          name: string;
          status: Database["public"]["Enums"]["tournament_status"];
          target_points: number;
          tournament_type: Database["public"]["Enums"]["tournament_type"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          current_round?: number;
          id?: string;
          name: string;
          status?: Database["public"]["Enums"]["tournament_status"];
          target_points: number;
          tournament_type: Database["public"]["Enums"]["tournament_type"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          current_round?: number;
          id?: string;
          name?: string;
          status?: Database["public"]["Enums"]["tournament_status"];
          target_points?: number;
          tournament_type?: Database["public"]["Enums"]["tournament_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      match_status: "pending" | "in_progress" | "completed";
      tournament_status: "draft" | "active" | "completed";
      tournament_type: "americano" | "mexicano";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      match_status: ["pending", "in_progress", "completed"],
      tournament_status: ["draft", "active", "completed"],
      tournament_type: ["americano", "mexicano"],
    },
  },
} as const;
