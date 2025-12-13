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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_impersonation_sessions: {
        Row: {
          admin_user_id: string
          ended_at: string | null
          id: string
          impersonated_role: Database["public"]["Enums"]["app_role"]
          is_active: boolean | null
          reason: string | null
          started_at: string | null
        }
        Insert: {
          admin_user_id: string
          ended_at?: string | null
          id?: string
          impersonated_role: Database["public"]["Enums"]["app_role"]
          is_active?: boolean | null
          reason?: string | null
          started_at?: string | null
        }
        Update: {
          admin_user_id?: string
          ended_at?: string | null
          id?: string
          impersonated_role?: Database["public"]["Enums"]["app_role"]
          is_active?: boolean | null
          reason?: string | null
          started_at?: string | null
        }
        Relationships: []
      }
      analysis_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          findings: Json | null
          id: string
          implemented_actions: Json | null
          severity_counts: Json | null
          sites_analyzed: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          findings?: Json | null
          id?: string
          implemented_actions?: Json | null
          severity_counts?: Json | null
          sites_analyzed?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          findings?: Json | null
          id?: string
          implemented_actions?: Json | null
          severity_counts?: Json | null
          sites_analyzed?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          last_used_at: string | null
          name: string
          permissions: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource: string
          resource_id: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource: string
          resource_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string
          resource_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_mail_accounts: {
        Row: {
          created_at: string | null
          credentials_encrypted: string | null
          display_name: string | null
          email: string
          id: string
          imap_host: string | null
          imap_port: number | null
          is_connected: boolean | null
          last_synced_at: string | null
          mailboxes: Json | null
          provider: string | null
          smtp_host: string | null
          smtp_port: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credentials_encrypted?: string | null
          display_name?: string | null
          email: string
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          is_connected?: boolean | null
          last_synced_at?: string | null
          mailboxes?: Json | null
          provider?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credentials_encrypted?: string | null
          display_name?: string | null
          email?: string
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          is_connected?: boolean | null
          last_synced_at?: string | null
          mailboxes?: Json | null
          provider?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          additional_fields: Json | null
          created_at: string | null
          email: string
          id: string
          integration_id: string
          password: string
          site_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          additional_fields?: Json | null
          created_at?: string | null
          email: string
          id?: string
          integration_id: string
          password: string
          site_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_fields?: Json | null
          created_at?: string | null
          email?: string
          id?: string
          integration_id?: string
          password?: string
          site_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      currency_balances: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string
          id: string
          last_updated_at: string | null
          symbol: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency: string
          id?: string
          last_updated_at?: string | null
          symbol: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          last_updated_at?: string | null
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          password: string | null
          site_id: string
          tenant_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          password?: string | null
          site_id: string
          tenant_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password?: string | null
          site_id?: string
          tenant_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_accounts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          account_id: string
          body: string | null
          body_preview: string | null
          created_at: string | null
          flags: string[] | null
          folder: string | null
          id: string
          is_draft: boolean | null
          recipients: Json
          sender: string
          starred: boolean | null
          status: string | null
          subject: string
          thread_id: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          body?: string | null
          body_preview?: string | null
          created_at?: string | null
          flags?: string[] | null
          folder?: string | null
          id?: string
          is_draft?: boolean | null
          recipients?: Json
          sender: string
          starred?: boolean | null
          status?: string | null
          subject: string
          thread_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          body?: string | null
          body_preview?: string | null
          created_at?: string | null
          flags?: string[] | null
          folder?: string | null
          id?: string
          is_draft?: boolean | null
          recipients?: Json
          sender?: string
          starred?: boolean | null
          status?: string | null
          subject?: string
          thread_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component: string | null
          created_at: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
          stack_trace: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string | null
          id?: string
          level?: string
          message: string
          metadata?: Json | null
          stack_trace?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          stack_trace?: string | null
        }
        Relationships: []
      }
      feature_toggles: {
        Row: {
          created_at: string | null
          description: string | null
          feature_key: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      global_payment_providers: {
        Row: {
          created_at: string | null
          credentials_encrypted: string | null
          display_name: string | null
          id: string
          is_connected: boolean | null
          is_sandbox: boolean | null
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credentials_encrypted?: string | null
          display_name?: string | null
          id?: string
          is_connected?: boolean | null
          is_sandbox?: boolean | null
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credentials_encrypted?: string | null
          display_name?: string | null
          id?: string
          is_connected?: boolean | null
          is_sandbox?: boolean | null
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      godmode_sessions: {
        Row: {
          actions_log: Json | null
          admin_user_id: string
          ended_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          reason: string
          started_at: string | null
          user_agent: string | null
        }
        Insert: {
          actions_log?: Json | null
          admin_user_id: string
          ended_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          reason: string
          started_at?: string | null
          user_agent?: string | null
        }
        Update: {
          actions_log?: Json | null
          admin_user_id?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          reason?: string
          started_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      imported_apps: {
        Row: {
          id: string
          imported_at: string | null
          lovable_url: string
          project_name: string
          site_id: string
          user_id: string
        }
        Insert: {
          id?: string
          imported_at?: string | null
          lovable_url: string
          project_name: string
          site_id: string
          user_id: string
        }
        Update: {
          id?: string
          imported_at?: string | null
          lovable_url?: string
          project_name?: string
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_apps_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          status?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      nexuspay_transactions: {
        Row: {
          amount_usd: number
          created_at: string | null
          crypto_network: string | null
          customer_email: string | null
          customer_name: string | null
          fees_usd: number | null
          gateway_ref_id: string
          gateway_source: Database["public"]["Enums"]["payment_gateway"]
          id: string
          metadata: Json | null
          native_amount: number
          site_id: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount_usd: number
          created_at?: string | null
          crypto_network?: string | null
          customer_email?: string | null
          customer_name?: string | null
          fees_usd?: number | null
          gateway_ref_id: string
          gateway_source: Database["public"]["Enums"]["payment_gateway"]
          id?: string
          metadata?: Json | null
          native_amount: number
          site_id: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount_usd?: number
          created_at?: string | null
          crypto_network?: string | null
          customer_email?: string | null
          customer_name?: string | null
          fees_usd?: number | null
          gateway_ref_id?: string
          gateway_source?: Database["public"]["Enums"]["payment_gateway"]
          id?: string
          metadata?: Json | null
          native_amount?: number
          site_id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nexuspay_transactions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_providers: {
        Row: {
          created_at: string | null
          credentials_encrypted: string | null
          id: string
          is_connected: boolean | null
          is_sandbox: boolean | null
          last_synced_at: string | null
          provider: Database["public"]["Enums"]["payment_gateway"]
          site_id: string
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          is_connected?: boolean | null
          is_sandbox?: boolean | null
          last_synced_at?: string | null
          provider: Database["public"]["Enums"]["payment_gateway"]
          site_id: string
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          is_connected?: boolean | null
          is_sandbox?: boolean | null
          last_synced_at?: string | null
          provider?: Database["public"]["Enums"]["payment_gateway"]
          site_id?: string
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_providers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string | null
          feature: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          feature: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          feature?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      security_scans: {
        Row: {
          completed_at: string | null
          created_at: string | null
          findings: Json | null
          id: string
          scan_type: string
          severity_counts: Json | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          scan_type: string
          severity_counts?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          scan_type?: string
          severity_counts?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      site_integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          integration_id: string
          site_id: string
          status: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_id: string
          site_id: string
          status?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_id?: string
          site_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_integrations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_payment_settings: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          provider: string
          site_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          provider: string
          site_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          provider?: string
          site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_payment_settings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          app_color: string | null
          created_at: string
          domain: string | null
          health_status: string | null
          id: string
          lovable_url: string | null
          name: string
          owner_type: string | null
          response_time_ms: number | null
          ssl_status: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string
          uptime_percentage: number | null
        }
        Insert: {
          app_color?: string | null
          created_at?: string
          domain?: string | null
          health_status?: string | null
          id?: string
          lovable_url?: string | null
          name: string
          owner_type?: string | null
          response_time_ms?: number | null
          ssl_status?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
          uptime_percentage?: number | null
        }
        Update: {
          app_color?: string | null
          created_at?: string
          domain?: string | null
          health_status?: string | null
          id?: string
          lovable_url?: string | null
          name?: string
          owner_type?: string | null
          response_time_ms?: number | null
          ssl_status?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
          uptime_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          admin_url: string | null
          backups_enabled: boolean | null
          base_url: string | null
          created_at: string
          custom_domain: boolean | null
          environment: string
          id: string
          name: string
          slug: string
          ssl_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          admin_url?: string | null
          backups_enabled?: boolean | null
          base_url?: string | null
          created_at?: string
          custom_domain?: boolean | null
          environment?: string
          id?: string
          name: string
          slug: string
          ssl_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          admin_url?: string | null
          backups_enabled?: boolean | null
          base_url?: string | null
          created_at?: string
          custom_domain?: boolean | null
          environment?: string
          id?: string
          name?: string
          slug?: string
          ssl_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_social_accounts: {
        Row: {
          access_token_encrypted: string | null
          connected_at: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_connected: boolean | null
          last_synced_at: string | null
          platform: string
          profile_data: Json | null
          profile_image_url: string | null
          refresh_token_encrypted: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced_at?: string | null
          platform: string
          profile_data?: Json | null
          profile_image_url?: string | null
          refresh_token_encrypted?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced_at?: string | null
          platform?: string
          profile_data?: Json | null
          profile_image_url?: string | null
          refresh_token_encrypted?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[] | null
          failure_count: number | null
          id: string
          last_triggered_at: string | null
          name: string
          status: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          failure_count?: number | null
          id?: string
          last_triggered_at?: string | null
          name: string
          status?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          failure_count?: number | null
          id?: string
          last_triggered_at?: string | null
          name?: string
          status?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      users_with_roles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          roles: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_permission: {
        Args: { _action: string; _feature: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
      payment_gateway: "stripe" | "paypal" | "btc" | "usdt" | "eth"
      transaction_status:
        | "pending"
        | "confirmed"
        | "failed"
        | "refunded"
        | "cancelled"
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
    Enums: {
      app_role: ["super_admin", "admin", "editor"],
      payment_gateway: ["stripe", "paypal", "btc", "usdt", "eth"],
      transaction_status: [
        "pending",
        "confirmed",
        "failed",
        "refunded",
        "cancelled",
      ],
    },
  },
} as const
