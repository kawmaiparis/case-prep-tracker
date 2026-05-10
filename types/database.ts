export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          partner_id: string | null;
          case_type_id: number | null;
          case_name: string | null;
          case_book: string | null;
          industry: string | null;
          notes: string | null;
          score_structure: number;
          score_math: number;
          score_creativity: number;
          score_communication: number;
          score_data_analysis: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          partner_id?: string | null;
          case_type_id?: number | null;
          case_name?: string | null;
          case_book?: string | null;
          industry?: string | null;
          notes?: string | null;
          score_structure: number;
          score_math: number;
          score_creativity: number;
          score_communication: number;
          score_data_analysis: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "sessions_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_case_type_id_fkey";
            columns: ["case_type_id"];
            isOneToOne: false;
            referencedRelation: "case_types";
            referencedColumns: ["id"];
          }
        ];
      };
      partners: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_paid_coach: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_paid_coach?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Insert"]>;
        Relationships: [];
      };
      case_types: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["case_types"]["Insert"]>;
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
