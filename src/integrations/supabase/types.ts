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
      bom_fields: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          label: string
          name: string
          options: string[] | null
          order_position: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          label: string
          name: string
          options?: string[] | null
          order_position?: number
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          label?: string
          name?: string
          options?: string[] | null
          order_position?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      bom_items: {
        Row: {
          bom_id: string
          created_at: string
          id: string
          inventory_item_id: string
          notes: string | null
          quantity_required: number
          updated_at: string
        }
        Insert: {
          bom_id: string
          created_at?: string
          id?: string
          inventory_item_id: string
          notes?: string | null
          quantity_required?: number
          updated_at?: string
        }
        Update: {
          bom_id?: string
          created_at?: string
          id?: string
          inventory_item_id?: string
          notes?: string | null
          quantity_required?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bom_items_bom_id_fkey"
            columns: ["bom_id"]
            isOneToOne: false
            referencedRelation: "boms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      boms: {
        Row: {
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          block_type: string
          content: Json
          created_at: string
          id: string
          is_active: boolean
          is_global: boolean
          page_id: string
          parent_id: string | null
          position: number
          styles: Json
          updated_at: string
        }
        Insert: {
          block_type: string
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          page_id: string
          parent_id?: string | null
          position?: number
          styles?: Json
          updated_at?: string
        }
        Update: {
          block_type?: string
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          page_id?: string
          parent_id?: string | null
          position?: number
          styles?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "content_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revisions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          page_id: string
          revision_data: Json
          revision_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          page_id: string
          revision_data: Json
          revision_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          page_id?: string
          revision_data?: Json
          revision_number?: number
        }
        Relationships: []
      }
      content_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system: boolean
          name: string
          template_data: Json
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_columns: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          label: string
          name: string
          order_position: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          label: string
          name: string
          order_position?: number
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          label?: string
          name?: string
          order_position?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          description: string | null
          id: string
          image_url: string | null
          location_id: string | null
          name: string
          quantity: number
          sku: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          location_id?: string | null
          name: string
          quantity?: number
          sku: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          location_id?: string | null
          name?: string
          quantity?: number
          sku?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      onedrive_file_tracking: {
        Row: {
          created_at: string
          file_name: string
          id: string
          onedrive_file_id: string
          onedrive_file_path: string
          original_file_id: string
          updated_at: string
          upload_timestamp: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          onedrive_file_id: string
          onedrive_file_path: string
          original_file_id: string
          updated_at?: string
          upload_timestamp?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          onedrive_file_id?: string
          onedrive_file_path?: string
          original_file_id?: string
          updated_at?: string
          upload_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "onedrive_file_tracking_original_file_id_fkey"
            columns: ["original_file_id"]
            isOneToOne: false
            referencedRelation: "work_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      page_configs: {
        Row: {
          created_at: string
          custom_css: string | null
          id: string
          is_published: boolean
          layout_settings: Json
          meta_description: string | null
          meta_title: string | null
          page_id: string
          page_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_css?: string | null
          id?: string
          is_published?: boolean
          layout_settings?: Json
          meta_description?: string | null
          meta_title?: string | null
          page_id: string
          page_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_css?: string | null
          id?: string
          is_published?: boolean
          layout_settings?: Json
          meta_description?: string | null
          meta_title?: string | null
          page_id?: string
          page_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          theme: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          theme?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      work_order_fields: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          label: string
          name: string
          options: string[] | null
          order_position: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          label: string
          name: string
          options?: string[] | null
          order_position?: number
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          label?: string
          name?: string
          options?: string[] | null
          order_position?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_order_items: {
        Row: {
          created_at: string
          file_path: string | null
          file_size: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_locked: boolean
          is_stage_subfolder: boolean
          mime_type: string | null
          name: string
          parent_id: string | null
          type: string
          updated_at: string
          workflow_stage_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_locked?: boolean
          is_stage_subfolder?: boolean
          mime_type?: string | null
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
          workflow_stage_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_locked?: boolean
          is_stage_subfolder?: boolean
          mime_type?: string | null
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
          workflow_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "work_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          assigned_to: string | null
          bom_id: string | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          description: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          bom_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          bom_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_bom_id_fkey"
            columns: ["bom_id"]
            isOneToOne: false
            referencedRelation: "boms"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          order_position: number
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id: string
          name: string
          order_position: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          order_position?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "admin" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "staff"],
    },
  },
} as const
