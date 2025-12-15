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
      accounting_documents: {
        Row: {
          created_at: string | null
          document_type: string
          extracted_data: Json | null
          file_name: string | null
          file_url: string
          id: string
          processing_status: string | null
          site_id: string | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          extracted_data?: Json | null
          file_name?: string | null
          file_url: string
          id?: string
          processing_status?: string | null
          site_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          extracted_data?: Json | null
          file_name?: string | null
          file_url?: string
          id?: string
          processing_status?: string | null
          site_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_documents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_documents_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "accounting_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_transactions: {
        Row: {
          ai_extracted_data: Json | null
          amount: number
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          receipt_url: string | null
          site_id: string | null
          tags: Json | null
          transaction_date: string
          type: string
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          ai_extracted_data?: Json | null
          amount: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          receipt_url?: string | null
          site_id?: string | null
          tags?: Json | null
          transaction_date: string
          type: string
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          ai_extracted_data?: Json | null
          amount?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          receipt_url?: string | null
          site_id?: string | null
          tags?: Json | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_transactions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
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
      ai_personas: {
        Row: {
          avatar_url: string | null
          capabilities: Json | null
          created_at: string | null
          daily_schedule: Json | null
          id: string
          name: string
          personality: Json | null
          role: string
          site_id: string | null
          status: string | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          capabilities?: Json | null
          created_at?: string | null
          daily_schedule?: Json | null
          id?: string
          name: string
          personality?: Json | null
          role: string
          site_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          capabilities?: Json | null
          created_at?: string | null
          daily_schedule?: Json | null
          id?: string
          name?: string
          personality?: Json | null
          role?: string
          site_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_personas_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
      crm_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          id: string
          lead_id: string | null
          outcome: string | null
          persona_id: string | null
          scheduled_at: string | null
          site_id: string | null
          subject: string | null
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          outcome?: string | null
          persona_id?: string | null
          scheduled_at?: string | null
          site_id?: string | null
          subject?: string | null
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          outcome?: string | null
          persona_id?: string | null
          scheduled_at?: string | null
          site_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          created_at: string | null
          currency: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          persona_id: string | null
          probability: number | null
          site_id: string | null
          stage: string | null
          title: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          persona_id?: string | null
          probability?: number | null
          site_id?: string | null
          stage?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          persona_id?: string | null
          probability?: number | null
          site_id?: string | null
          stage?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          enrichment_data: Json | null
          id: string
          last_contacted_at: string | null
          linkedin_url: string | null
          name: string
          persona_id: string | null
          phone: string | null
          revenue_score: number | null
          site_id: string | null
          source: string | null
          status: string | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          enrichment_data?: Json | null
          id?: string
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name: string
          persona_id?: string | null
          phone?: string | null
          revenue_score?: number | null
          site_id?: string | null
          source?: string | null
          status?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          enrichment_data?: Json | null
          id?: string
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name?: string
          persona_id?: string | null
          phone?: string | null
          revenue_score?: number | null
          site_id?: string | null
          source?: string | null
          status?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_site_id_fkey"
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
          github_default_branch: string | null
          github_last_commit_sha: string | null
          github_last_push_at: string | null
          github_repo_name: string | null
          github_repo_owner: string | null
          github_repo_url: string | null
          github_visibility: string | null
          github_visibility_updated_at: string | null
          id: string
          imported_at: string | null
          lovable_url: string
          project_name: string
          site_id: string
          user_id: string
        }
        Insert: {
          github_default_branch?: string | null
          github_last_commit_sha?: string | null
          github_last_push_at?: string | null
          github_repo_name?: string | null
          github_repo_owner?: string | null
          github_repo_url?: string | null
          github_visibility?: string | null
          github_visibility_updated_at?: string | null
          id?: string
          imported_at?: string | null
          lovable_url: string
          project_name: string
          site_id: string
          user_id: string
        }
        Update: {
          github_default_branch?: string | null
          github_last_commit_sha?: string | null
          github_last_push_at?: string | null
          github_repo_name?: string | null
          github_repo_owner?: string | null
          github_repo_url?: string | null
          github_visibility?: string | null
          github_visibility_updated_at?: string | null
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
      persona_conversations: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          persona_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          persona_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          persona_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_conversations_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_daily_reports: {
        Row: {
          blockers: Json | null
          created_at: string | null
          highlights: Json | null
          id: string
          key_metrics: Json | null
          next_day_plan: Json | null
          persona_id: string
          report_date: string
          site_id: string | null
          summary: string | null
          tasks_completed: number | null
          tasks_pending: number | null
        }
        Insert: {
          blockers?: Json | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          key_metrics?: Json | null
          next_day_plan?: Json | null
          persona_id: string
          report_date?: string
          site_id?: string | null
          summary?: string | null
          tasks_completed?: number | null
          tasks_pending?: number | null
        }
        Update: {
          blockers?: Json | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          key_metrics?: Json | null
          next_day_plan?: Json | null
          persona_id?: string
          report_date?: string
          site_id?: string | null
          summary?: string | null
          tasks_completed?: number | null
          tasks_pending?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_daily_reports_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_daily_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_tasks: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          persona_id: string
          priority: string | null
          rejected_at: string | null
          result: Json | null
          site_id: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          persona_id: string
          priority?: string | null
          rejected_at?: string | null
          result?: Json | null
          site_id?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          persona_id?: string
          priority?: string | null
          rejected_at?: string | null
          result?: Json | null
          site_id?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_tasks_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_tasks_site_id_fkey"
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
      quantops_apply_events: {
        Row: {
          actor_role: string
          actor_user_id: string | null
          breached_thresholds: Json | null
          build_id: string | null
          card_id: string | null
          commit_sha: string | null
          created_at: string | null
          duration_ms: number | null
          environment: Database["public"]["Enums"]["deploy_environment"]
          error_summary: string | null
          id: string
          metrics_snapshot: Json | null
          persona_id: string | null
          pr_number: number | null
          pr_url: string | null
          result: Database["public"]["Enums"]["apply_result"] | null
          rollback_ref: string | null
          site_id: string | null
          tests_passed: boolean | null
        }
        Insert: {
          actor_role: string
          actor_user_id?: string | null
          breached_thresholds?: Json | null
          build_id?: string | null
          card_id?: string | null
          commit_sha?: string | null
          created_at?: string | null
          duration_ms?: number | null
          environment: Database["public"]["Enums"]["deploy_environment"]
          error_summary?: string | null
          id?: string
          metrics_snapshot?: Json | null
          persona_id?: string | null
          pr_number?: number | null
          pr_url?: string | null
          result?: Database["public"]["Enums"]["apply_result"] | null
          rollback_ref?: string | null
          site_id?: string | null
          tests_passed?: boolean | null
        }
        Update: {
          actor_role?: string
          actor_user_id?: string | null
          breached_thresholds?: Json | null
          build_id?: string | null
          card_id?: string | null
          commit_sha?: string | null
          created_at?: string | null
          duration_ms?: number | null
          environment?: Database["public"]["Enums"]["deploy_environment"]
          error_summary?: string | null
          id?: string
          metrics_snapshot?: Json | null
          persona_id?: string | null
          pr_number?: number | null
          pr_url?: string | null
          result?: Database["public"]["Enums"]["apply_result"] | null
          rollback_ref?: string | null
          site_id?: string | null
          tests_passed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quantops_apply_events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "quantops_recommendation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantops_apply_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "quantops_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantops_apply_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      quantops_kpi_thresholds: {
        Row: {
          auto_rollback: boolean | null
          created_at: string | null
          critical_threshold: number | null
          direction: string | null
          id: string
          metric_name: string
          notification_channels: string[] | null
          persona_id: string | null
          updated_at: string | null
          warning_threshold: number | null
        }
        Insert: {
          auto_rollback?: boolean | null
          created_at?: string | null
          critical_threshold?: number | null
          direction?: string | null
          id?: string
          metric_name: string
          notification_channels?: string[] | null
          persona_id?: string | null
          updated_at?: string | null
          warning_threshold?: number | null
        }
        Update: {
          auto_rollback?: boolean | null
          created_at?: string | null
          critical_threshold?: number | null
          direction?: string | null
          id?: string
          metric_name?: string
          notification_channels?: string[] | null
          persona_id?: string | null
          updated_at?: string | null
          warning_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quantops_kpi_thresholds_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "quantops_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      quantops_personas: {
        Row: {
          avatar_url: string | null
          capabilities: Json | null
          codename: string
          created_at: string | null
          description: string | null
          github_config: Json | null
          id: string
          kpi_thresholds: Json | null
          lovable_config: Json | null
          name: string
          role: string
          site_id: string | null
          status: string | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          capabilities?: Json | null
          codename: string
          created_at?: string | null
          description?: string | null
          github_config?: Json | null
          id?: string
          kpi_thresholds?: Json | null
          lovable_config?: Json | null
          name: string
          role: string
          site_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          capabilities?: Json | null
          codename?: string
          created_at?: string | null
          description?: string | null
          github_config?: Json | null
          id?: string
          kpi_thresholds?: Json | null
          lovable_config?: Json | null
          name?: string
          role?: string
          site_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantops_personas_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      quantops_recommendation_cards: {
        Row: {
          card_type: string
          code_patches: Json | null
          created_at: string | null
          description: string | null
          estimated_improvement: Json | null
          expires_at: string | null
          id: string
          impact_score: number | null
          persona_id: string | null
          priority: string | null
          proposed_changes: Json | null
          risk_level: string | null
          rollback_plan: Json | null
          site_id: string | null
          status: string | null
          test_requirements: Json | null
          title: string
          trigger_metrics: Json | null
          updated_at: string | null
        }
        Insert: {
          card_type: string
          code_patches?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_improvement?: Json | null
          expires_at?: string | null
          id?: string
          impact_score?: number | null
          persona_id?: string | null
          priority?: string | null
          proposed_changes?: Json | null
          risk_level?: string | null
          rollback_plan?: Json | null
          site_id?: string | null
          status?: string | null
          test_requirements?: Json | null
          title: string
          trigger_metrics?: Json | null
          updated_at?: string | null
        }
        Update: {
          card_type?: string
          code_patches?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_improvement?: Json | null
          expires_at?: string | null
          id?: string
          impact_score?: number | null
          persona_id?: string | null
          priority?: string | null
          proposed_changes?: Json | null
          risk_level?: string | null
          rollback_plan?: Json | null
          site_id?: string | null
          status?: string | null
          test_requirements?: Json | null
          title?: string
          trigger_metrics?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantops_recommendation_cards_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "quantops_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantops_recommendation_cards_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
      social_content_calendar: {
        Row: {
          content: string
          created_at: string | null
          engagement_metrics: Json | null
          hashtags: Json | null
          id: string
          media_urls: Json | null
          persona_id: string | null
          platform: string
          published_at: string | null
          scheduled_at: string | null
          site_id: string | null
          status: string | null
          updated_at: string | null
          variation_group: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          engagement_metrics?: Json | null
          hashtags?: Json | null
          id?: string
          media_urls?: Json | null
          persona_id?: string | null
          platform: string
          published_at?: string | null
          scheduled_at?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
          variation_group?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          engagement_metrics?: Json | null
          hashtags?: Json | null
          id?: string
          media_urls?: Json | null
          persona_id?: string | null
          platform?: string
          published_at?: string | null
          scheduled_at?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
          variation_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_content_calendar_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_content_calendar_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
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
      whatsapp_chats: {
        Row: {
          contact_name: string | null
          contact_phone: string
          created_at: string | null
          id: string
          is_muted: boolean | null
          is_pinned: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          profile_picture_url: string | null
          session_id: string | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          contact_name?: string | null
          contact_phone: string
          created_at?: string | null
          id?: string
          is_muted?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          profile_picture_url?: string | null
          session_id?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_name?: string | null
          contact_phone?: string
          created_at?: string | null
          id?: string
          is_muted?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          profile_picture_url?: string | null
          session_id?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_chats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          chat_id: string | null
          content: string | null
          created_at: string | null
          direction: string
          id: string
          media_type: string | null
          media_url: string | null
          status: string | null
          wa_message_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content?: string | null
          created_at?: string | null
          direction: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          status?: string | null
          wa_message_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          status?: string | null
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          id: string
          last_connected_at: string | null
          phone_number: string | null
          phone_number_id: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
          waba_id: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          last_connected_at?: string | null
          phone_number?: string | null
          phone_number_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
          waba_id?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          last_connected_at?: string | null
          phone_number?: string | null
          phone_number_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
          waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_analytics: {
        Row: {
          avg_view_duration: number | null
          channel_id: string | null
          comments: number | null
          cpm_cents: number | null
          created_at: string | null
          ctr: number | null
          date: string
          demographics: Json | null
          devices: Json | null
          dislikes: number | null
          id: string
          impressions: number | null
          likes: number | null
          revenue_cents: number | null
          rpm_cents: number | null
          shares: number | null
          subscribers_gained: number | null
          subscribers_lost: number | null
          traffic_sources: Json | null
          video_id: string | null
          views: number | null
          watch_time_minutes: number | null
        }
        Insert: {
          avg_view_duration?: number | null
          channel_id?: string | null
          comments?: number | null
          cpm_cents?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          demographics?: Json | null
          devices?: Json | null
          dislikes?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          revenue_cents?: number | null
          rpm_cents?: number | null
          shares?: number | null
          subscribers_gained?: number | null
          subscribers_lost?: number | null
          traffic_sources?: Json | null
          video_id?: string | null
          views?: number | null
          watch_time_minutes?: number | null
        }
        Update: {
          avg_view_duration?: number | null
          channel_id?: string | null
          comments?: number | null
          cpm_cents?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          demographics?: Json | null
          devices?: Json | null
          dislikes?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          revenue_cents?: number | null
          rpm_cents?: number | null
          shares?: number | null
          subscribers_gained?: number | null
          subscribers_lost?: number | null
          traffic_sources?: Json | null
          video_id?: string | null
          views?: number | null
          watch_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_analytics_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_analytics_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_audience_insights: {
        Row: {
          age_groups: Json | null
          channel_id: string | null
          created_at: string | null
          date: string
          device_types: Json | null
          gender_distribution: Json | null
          geography: Json | null
          id: string
          interests: Json | null
          returning_viewer_rate: number | null
          subscriber_growth_rate: number | null
          traffic_sources: Json | null
          watch_time_patterns: Json | null
        }
        Insert: {
          age_groups?: Json | null
          channel_id?: string | null
          created_at?: string | null
          date: string
          device_types?: Json | null
          gender_distribution?: Json | null
          geography?: Json | null
          id?: string
          interests?: Json | null
          returning_viewer_rate?: number | null
          subscriber_growth_rate?: number | null
          traffic_sources?: Json | null
          watch_time_patterns?: Json | null
        }
        Update: {
          age_groups?: Json | null
          channel_id?: string | null
          created_at?: string | null
          date?: string
          device_types?: Json | null
          gender_distribution?: Json | null
          geography?: Json | null
          id?: string
          interests?: Json | null
          returning_viewer_rate?: number | null
          subscriber_growth_rate?: number | null
          traffic_sources?: Json | null
          watch_time_patterns?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_audience_insights_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_brand_deals: {
        Row: {
          assigned_persona_id: string | null
          brand_logo_url: string | null
          brand_name: string
          brand_website: string | null
          channel_id: string | null
          contact_email: string | null
          contact_name: string | null
          contract_signed_at: string | null
          contract_url: string | null
          created_at: string | null
          deal_type: string | null
          deliverables: Json | null
          end_date: string | null
          id: string
          notes: string | null
          payment_status: string | null
          payment_terms: string | null
          rate_negotiated_cents: number | null
          rate_offered_cents: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["deal_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_persona_id?: string | null
          brand_logo_url?: string | null
          brand_name: string
          brand_website?: string | null
          channel_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          deal_type?: string | null
          deliverables?: Json | null
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          rate_negotiated_cents?: number | null
          rate_offered_cents?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["deal_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_persona_id?: string | null
          brand_logo_url?: string | null
          brand_name?: string
          brand_website?: string | null
          channel_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          deal_type?: string | null
          deliverables?: Json | null
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          rate_negotiated_cents?: number | null
          rate_offered_cents?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["deal_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_brand_deals_assigned_persona_id_fkey"
            columns: ["assigned_persona_id"]
            isOneToOne: false
            referencedRelation: "youtube_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_brand_deals_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_channel_health: {
        Row: {
          audience_score: number | null
          calculated_at: string | null
          category_breakdown: Json | null
          channel_id: string | null
          consistency_score: number | null
          content_score: number | null
          created_at: string | null
          engagement_score: number | null
          growth_score: number | null
          id: string
          monetization_score: number | null
          overall_grade: string | null
          overall_score: number | null
          quick_wins: Json | null
          recommendations: Json | null
          seo_score: number | null
        }
        Insert: {
          audience_score?: number | null
          calculated_at?: string | null
          category_breakdown?: Json | null
          channel_id?: string | null
          consistency_score?: number | null
          content_score?: number | null
          created_at?: string | null
          engagement_score?: number | null
          growth_score?: number | null
          id?: string
          monetization_score?: number | null
          overall_grade?: string | null
          overall_score?: number | null
          quick_wins?: Json | null
          recommendations?: Json | null
          seo_score?: number | null
        }
        Update: {
          audience_score?: number | null
          calculated_at?: string | null
          category_breakdown?: Json | null
          channel_id?: string | null
          consistency_score?: number | null
          content_score?: number | null
          created_at?: string | null
          engagement_score?: number | null
          growth_score?: number | null
          id?: string
          monetization_score?: number | null
          overall_grade?: string | null
          overall_score?: number | null
          quick_wins?: Json | null
          recommendations?: Json | null
          seo_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_channel_health_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_channel_portfolios: {
        Row: {
          aggregate_health_score: number | null
          channels: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          primary_channel_id: string | null
          total_subscribers: number | null
          total_videos: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aggregate_health_score?: number | null
          channels?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          primary_channel_id?: string | null
          total_subscribers?: number | null
          total_videos?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aggregate_health_score?: number | null
          channels?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          primary_channel_id?: string | null
          total_subscribers?: number | null
          total_videos?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_channel_portfolios_primary_channel_id_fkey"
            columns: ["primary_channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_channels: {
        Row: {
          channel_id: string
          channel_name: string
          channel_url: string | null
          country: string | null
          created_at: string | null
          custom_url: string | null
          description: string | null
          health_score: number | null
          id: string
          is_monetized: boolean | null
          is_verified: boolean | null
          keywords: string[] | null
          last_synced_at: string | null
          persona_id: string | null
          site_id: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          updated_at: string | null
          video_count: number | null
          view_count: number | null
        }
        Insert: {
          channel_id: string
          channel_name: string
          channel_url?: string | null
          country?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          health_score?: number | null
          id?: string
          is_monetized?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          last_synced_at?: string | null
          persona_id?: string | null
          site_id?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Update: {
          channel_id?: string
          channel_name?: string
          channel_url?: string | null
          country?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          health_score?: number | null
          id?: string
          is_monetized?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          last_synced_at?: string | null
          persona_id?: string | null
          site_id?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_channels_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_channels_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_collaborations: {
        Row: {
          assigned_persona_id: string | null
          audience_overlap_percent: number | null
          channel_id: string | null
          collab_type: string | null
          compatibility_score: number | null
          content_synergy_score: number | null
          created_at: string | null
          growth_potential_score: number | null
          id: string
          outreach_message: string | null
          partner_channel_id: string
          partner_channel_name: string
          partner_subscriber_count: number | null
          partner_thumbnail_url: string | null
          proposed_concept: string | null
          response_received: boolean | null
          results: Json | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["collab_status"] | null
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          assigned_persona_id?: string | null
          audience_overlap_percent?: number | null
          channel_id?: string | null
          collab_type?: string | null
          compatibility_score?: number | null
          content_synergy_score?: number | null
          created_at?: string | null
          growth_potential_score?: number | null
          id?: string
          outreach_message?: string | null
          partner_channel_id: string
          partner_channel_name: string
          partner_subscriber_count?: number | null
          partner_thumbnail_url?: string | null
          proposed_concept?: string | null
          response_received?: boolean | null
          results?: Json | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["collab_status"] | null
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          assigned_persona_id?: string | null
          audience_overlap_percent?: number | null
          channel_id?: string | null
          collab_type?: string | null
          compatibility_score?: number | null
          content_synergy_score?: number | null
          created_at?: string | null
          growth_potential_score?: number | null
          id?: string
          outreach_message?: string | null
          partner_channel_id?: string
          partner_channel_name?: string
          partner_subscriber_count?: number | null
          partner_thumbnail_url?: string | null
          proposed_concept?: string | null
          response_received?: boolean | null
          results?: Json | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["collab_status"] | null
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_collaborations_assigned_persona_id_fkey"
            columns: ["assigned_persona_id"]
            isOneToOne: false
            referencedRelation: "youtube_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_collaborations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_collaborations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_content_calendar: {
        Row: {
          assigned_personas: string[] | null
          channel_id: string | null
          checklist: Json | null
          content_type: string | null
          created_at: string | null
          description: string | null
          id: string
          notes: string | null
          persona_id: string | null
          priority: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: Database["public"]["Enums"]["video_status"] | null
          title: string
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          assigned_personas?: string[] | null
          channel_id?: string | null
          checklist?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          persona_id?: string | null
          priority?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["video_status"] | null
          title: string
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          assigned_personas?: string[] | null
          channel_id?: string | null
          checklist?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          persona_id?: string | null
          priority?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["video_status"] | null
          title?: string
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_content_calendar_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_content_calendar_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "youtube_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_content_calendar_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_crisis_events: {
        Row: {
          actions_taken: Json | null
          assigned_persona_id: string | null
          channel_id: string | null
          created_at: string | null
          description: string | null
          detected_at: string | null
          dislike_ratio: number | null
          escalation_level: number | null
          id: string
          negative_comment_count: number | null
          resolved_at: string | null
          response_recommendations: Json | null
          sentiment_score: number | null
          severity: Database["public"]["Enums"]["crisis_severity"] | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          actions_taken?: Json | null
          assigned_persona_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          dislike_ratio?: number | null
          escalation_level?: number | null
          id?: string
          negative_comment_count?: number | null
          resolved_at?: string | null
          response_recommendations?: Json | null
          sentiment_score?: number | null
          severity?: Database["public"]["Enums"]["crisis_severity"] | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          actions_taken?: Json | null
          assigned_persona_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          dislike_ratio?: number | null
          escalation_level?: number | null
          id?: string
          negative_comment_count?: number | null
          resolved_at?: string | null
          response_recommendations?: Json | null
          sentiment_score?: number | null
          severity?: Database["public"]["Enums"]["crisis_severity"] | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_crisis_events_assigned_persona_id_fkey"
            columns: ["assigned_persona_id"]
            isOneToOne: false
            referencedRelation: "youtube_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_crisis_events_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_crisis_events_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_live_streams: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          assigned_persona_id: string | null
          avg_viewers: number | null
          channel_id: string | null
          created_at: string | null
          description: string | null
          highlights: Json | null
          id: string
          moderation_stats: Json | null
          peak_viewers: number | null
          post_stream_analytics: Json | null
          scheduled_start: string | null
          status: string | null
          stream_id: string | null
          title: string
          total_chat_messages: number | null
          total_memberships: number | null
          total_super_chats_cents: number | null
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_persona_id?: string | null
          avg_viewers?: number | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          highlights?: Json | null
          id?: string
          moderation_stats?: Json | null
          peak_viewers?: number | null
          post_stream_analytics?: Json | null
          scheduled_start?: string | null
          status?: string | null
          stream_id?: string | null
          title: string
          total_chat_messages?: number | null
          total_memberships?: number | null
          total_super_chats_cents?: number | null
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_persona_id?: string | null
          avg_viewers?: number | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          highlights?: Json | null
          id?: string
          moderation_stats?: Json | null
          peak_viewers?: number | null
          post_stream_analytics?: Json | null
          scheduled_start?: string | null
          status?: string | null
          stream_id?: string | null
          title?: string
          total_chat_messages?: number | null
          total_memberships?: number | null
          total_super_chats_cents?: number | null
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_live_streams_assigned_persona_id_fkey"
            columns: ["assigned_persona_id"]
            isOneToOne: false
            referencedRelation: "youtube_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_live_streams_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_live_streams_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_merch_stores: {
        Row: {
          api_key_encrypted: string | null
          channel_id: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_synced_at: string | null
          provider: string
          store_id: string | null
          store_url: string | null
          total_products: number | null
          total_revenue_cents: number | null
          total_sales_cents: number | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced_at?: string | null
          provider: string
          store_id?: string | null
          store_url?: string | null
          total_products?: number | null
          total_revenue_cents?: number | null
          total_sales_cents?: number | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced_at?: string | null
          provider?: string
          store_id?: string | null
          store_url?: string | null
          total_products?: number | null
          total_revenue_cents?: number | null
          total_sales_cents?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_merch_stores_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_monetization: {
        Row: {
          ad_revenue_cents: number | null
          affiliate_cents: number | null
          channel_id: string | null
          created_at: string | null
          date: string
          estimated_cpm_cents: number | null
          estimated_rpm_cents: number | null
          id: string
          membership_cents: number | null
          merch_cents: number | null
          monetized_playbacks: number | null
          sponsorship_cents: number | null
          super_chat_cents: number | null
          total_cents: number | null
        }
        Insert: {
          ad_revenue_cents?: number | null
          affiliate_cents?: number | null
          channel_id?: string | null
          created_at?: string | null
          date: string
          estimated_cpm_cents?: number | null
          estimated_rpm_cents?: number | null
          id?: string
          membership_cents?: number | null
          merch_cents?: number | null
          monetized_playbacks?: number | null
          sponsorship_cents?: number | null
          super_chat_cents?: number | null
          total_cents?: number | null
        }
        Update: {
          ad_revenue_cents?: number | null
          affiliate_cents?: number | null
          channel_id?: string | null
          created_at?: string | null
          date?: string
          estimated_cpm_cents?: number | null
          estimated_rpm_cents?: number | null
          id?: string
          membership_cents?: number | null
          merch_cents?: number | null
          monetized_playbacks?: number | null
          sponsorship_cents?: number | null
          super_chat_cents?: number | null
          total_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_monetization_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_personas: {
        Row: {
          avatar_url: string | null
          base_persona_id: string | null
          capabilities: Json | null
          channel_id: string | null
          created_at: string | null
          daily_schedule: Json | null
          id: string
          name: string
          performance_metrics: Json | null
          role: Database["public"]["Enums"]["youtube_persona_role"]
          site_id: string | null
          status: string | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          base_persona_id?: string | null
          capabilities?: Json | null
          channel_id?: string | null
          created_at?: string | null
          daily_schedule?: Json | null
          id?: string
          name: string
          performance_metrics?: Json | null
          role: Database["public"]["Enums"]["youtube_persona_role"]
          site_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          base_persona_id?: string | null
          capabilities?: Json | null
          channel_id?: string | null
          created_at?: string | null
          daily_schedule?: Json | null
          id?: string
          name?: string
          performance_metrics?: Json | null
          role?: Database["public"]["Enums"]["youtube_persona_role"]
          site_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_personas_base_persona_id_fkey"
            columns: ["base_persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_personas_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_personas_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_seo_analysis: {
        Row: {
          analyzed_at: string | null
          competitor_comparison: Json | null
          created_at: string | null
          description_score: number | null
          id: string
          keyword_analysis: Json | null
          overall_score: number | null
          recommendations: Json | null
          tags_score: number | null
          thumbnail_score: number | null
          title_score: number | null
          trend_alignment: Json | null
          video_id: string | null
        }
        Insert: {
          analyzed_at?: string | null
          competitor_comparison?: Json | null
          created_at?: string | null
          description_score?: number | null
          id?: string
          keyword_analysis?: Json | null
          overall_score?: number | null
          recommendations?: Json | null
          tags_score?: number | null
          thumbnail_score?: number | null
          title_score?: number | null
          trend_alignment?: Json | null
          video_id?: string | null
        }
        Update: {
          analyzed_at?: string | null
          competitor_comparison?: Json | null
          created_at?: string | null
          description_score?: number | null
          id?: string
          keyword_analysis?: Json | null
          overall_score?: number | null
          recommendations?: Json | null
          tags_score?: number | null
          thumbnail_score?: number | null
          title_score?: number | null
          trend_alignment?: Json | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_seo_analysis_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_video_ideas: {
        Row: {
          audience_match: number | null
          calendar_id: string | null
          channel_id: string | null
          competition_level: string | null
          created_at: string | null
          description: string | null
          estimated_ctr: number | null
          estimated_views: number | null
          id: string
          keywords: string[] | null
          promoted_to_calendar: boolean | null
          score: number | null
          source: string | null
          source_data: Json | null
          status: string | null
          tags: string[] | null
          thumbnail_concepts: Json | null
          title: string
          trend_relevance: number | null
          updated_at: string | null
        }
        Insert: {
          audience_match?: number | null
          calendar_id?: string | null
          channel_id?: string | null
          competition_level?: string | null
          created_at?: string | null
          description?: string | null
          estimated_ctr?: number | null
          estimated_views?: number | null
          id?: string
          keywords?: string[] | null
          promoted_to_calendar?: boolean | null
          score?: number | null
          source?: string | null
          source_data?: Json | null
          status?: string | null
          tags?: string[] | null
          thumbnail_concepts?: Json | null
          title: string
          trend_relevance?: number | null
          updated_at?: string | null
        }
        Update: {
          audience_match?: number | null
          calendar_id?: string | null
          channel_id?: string | null
          competition_level?: string | null
          created_at?: string | null
          description?: string | null
          estimated_ctr?: number | null
          estimated_views?: number | null
          id?: string
          keywords?: string[] | null
          promoted_to_calendar?: boolean | null
          score?: number | null
          source?: string | null
          source_data?: Json | null
          status?: string | null
          tags?: string[] | null
          thumbnail_concepts?: Json | null
          title?: string
          trend_relevance?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_video_ideas_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "youtube_content_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_video_ideas_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_videos: {
        Row: {
          avg_view_duration: number | null
          category_id: string | null
          channel_id: string | null
          comment_count: number | null
          created_at: string | null
          ctr: number | null
          description: string | null
          dislike_count: number | null
          duration_seconds: number | null
          engagement_rate: number | null
          id: string
          is_monetized: boolean | null
          is_shorts: boolean | null
          like_count: number | null
          published_at: string | null
          seo_score: number | null
          status: Database["public"]["Enums"]["video_status"] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_id: string
          view_count: number | null
        }
        Insert: {
          avg_view_duration?: number | null
          category_id?: string | null
          channel_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          ctr?: number | null
          description?: string | null
          dislike_count?: number | null
          duration_seconds?: number | null
          engagement_rate?: number | null
          id?: string
          is_monetized?: boolean | null
          is_shorts?: boolean | null
          like_count?: number | null
          published_at?: string | null
          seo_score?: number | null
          status?: Database["public"]["Enums"]["video_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_id: string
          view_count?: number | null
        }
        Update: {
          avg_view_duration?: number | null
          category_id?: string | null
          channel_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          ctr?: number | null
          description?: string | null
          dislike_count?: number | null
          duration_seconds?: number | null
          engagement_rate?: number | null
          id?: string
          is_monetized?: boolean | null
          is_shorts?: boolean | null
          like_count?: number | null
          published_at?: string | null
          seo_score?: number | null
          status?: Database["public"]["Enums"]["video_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
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
      apply_result: "pending" | "success" | "failed" | "rolled_back"
      collab_status:
        | "discovered"
        | "analyzing"
        | "outreach"
        | "discussing"
        | "planning"
        | "scheduled"
        | "completed"
        | "declined"
      crisis_severity: "low" | "medium" | "high" | "critical"
      deal_status:
        | "prospecting"
        | "outreach"
        | "negotiating"
        | "contracted"
        | "active"
        | "completed"
        | "cancelled"
      deploy_environment: "demo" | "paper" | "canary" | "live"
      payment_gateway: "stripe" | "paypal" | "btc" | "usdt" | "eth"
      transaction_status:
        | "pending"
        | "confirmed"
        | "failed"
        | "refunded"
        | "cancelled"
      video_status:
        | "idea"
        | "scripting"
        | "filming"
        | "editing"
        | "review"
        | "scheduled"
        | "published"
        | "archived"
      youtube_persona_role:
        | "content_strategist"
        | "seo_specialist"
        | "analytics_expert"
        | "monetization_manager"
        | "community_manager"
        | "live_producer"
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
      apply_result: ["pending", "success", "failed", "rolled_back"],
      collab_status: [
        "discovered",
        "analyzing",
        "outreach",
        "discussing",
        "planning",
        "scheduled",
        "completed",
        "declined",
      ],
      crisis_severity: ["low", "medium", "high", "critical"],
      deal_status: [
        "prospecting",
        "outreach",
        "negotiating",
        "contracted",
        "active",
        "completed",
        "cancelled",
      ],
      deploy_environment: ["demo", "paper", "canary", "live"],
      payment_gateway: ["stripe", "paypal", "btc", "usdt", "eth"],
      transaction_status: [
        "pending",
        "confirmed",
        "failed",
        "refunded",
        "cancelled",
      ],
      video_status: [
        "idea",
        "scripting",
        "filming",
        "editing",
        "review",
        "scheduled",
        "published",
        "archived",
      ],
      youtube_persona_role: [
        "content_strategist",
        "seo_specialist",
        "analytics_expert",
        "monetization_manager",
        "community_manager",
        "live_producer",
      ],
    },
  },
} as const
