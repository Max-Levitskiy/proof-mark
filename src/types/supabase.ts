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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          dislike_count: number
          id: string
          like_count: number
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          dislike_count?: number
          id?: string
          like_count?: number
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          dislike_count?: number
          id?: string
          like_count?: number
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      article_reactions: {
        Row: {
          article_id: string
          created_at: string
          id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_reactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_mentions: {
        Row: {
          article_id: string
          claim_id: number
          cluster_id: number | null
          created_at: string | null
          id: number
          sentence: string
          sentence_ids: number[] | null
        }
        Insert: {
          article_id: string
          claim_id: number
          cluster_id?: number | null
          created_at?: string | null
          id?: number
          sentence: string
          sentence_ids?: number[] | null
        }
        Update: {
          article_id?: string
          claim_id?: number
          cluster_id?: number | null
          created_at?: string | null
          id?: number
          sentence?: string
          sentence_ids?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_mentions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_embeddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_mentions_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_mentions_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "story_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_verifications: {
        Row: {
          checked_at: string | null
          claim_id: number
          confidence: number | null
          id: number
          publisher: string | null
          raw: Json | null
          source: string | null
          url: string | null
          verdict: string | null
        }
        Insert: {
          checked_at?: string | null
          claim_id: number
          confidence?: number | null
          id?: number
          publisher?: string | null
          raw?: Json | null
          source?: string | null
          url?: string | null
          verdict?: string | null
        }
        Update: {
          checked_at?: string | null
          claim_id?: number
          confidence?: number | null
          id?: number
          publisher?: string | null
          raw?: Json | null
          source?: string | null
          url?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_verifications_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          canonical_sig: string
          canonical_text: string
          date: string | null
          embedding: string | null
          entities: Json | null
          event_type: string | null
          first_seen: string | null
          id: number
          lang: string | null
          last_seen: string | null
          location_qid: string | null
          number_bucket: string | null
          number_value: number | null
          support_count: number | null
        }
        Insert: {
          canonical_sig: string
          canonical_text: string
          date?: string | null
          embedding?: string | null
          entities?: Json | null
          event_type?: string | null
          first_seen?: string | null
          id?: number
          lang?: string | null
          last_seen?: string | null
          location_qid?: string | null
          number_bucket?: string | null
          number_value?: number | null
          support_count?: number | null
        }
        Update: {
          canonical_sig?: string
          canonical_text?: string
          date?: string | null
          embedding?: string | null
          entities?: Json | null
          event_type?: string | null
          first_seen?: string | null
          id?: number
          lang?: string | null
          last_seen?: string | null
          location_qid?: string | null
          number_bucket?: string | null
          number_value?: number | null
          support_count?: number | null
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_embeddings: {
        Row: {
          chunk_index: number | null
          cluster_id: number | null
          cluster_prob: number | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          key: string | null
          metadata: Json | null
          outlier_score: number | null
          raw_content: string | null
          total_chunks: number | null
        }
        Insert: {
          chunk_index?: number | null
          cluster_id?: number | null
          cluster_prob?: number | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          outlier_score?: number | null
          raw_content?: string | null
          total_chunks?: number | null
        }
        Update: {
          chunk_index?: number | null
          cluster_id?: number | null
          cluster_prob?: number | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          outlier_score?: number | null
          raw_content?: string | null
          total_chunks?: number | null
        }
        Relationships: []
      }
      feature_subscriptions: {
        Row: {
          created_at: string
          email: string
          feature_name: string
          id: string
          subscribed_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          feature_name?: string
          id?: string
          subscribed_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          feature_name?: string
          id?: string
          subscribed_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: Json | null
          category: Json
          confidence_level: number
          content: string | null
          created_at: string
          description: string | null
          detailed_analysis: Json | null
          flags: Json | null
          headline: string
          id: string
          image: string | null
          location: string | null
          metadata: Json | null
          news_id: string | null
          original_link: string | null
          published_at: string | null
          read_time: string | null
          source: Json | null
          sources_verified: number | null
          trust_explanation: string | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          author?: Json | null
          category?: Json
          confidence_level?: number
          content?: string | null
          created_at?: string
          description?: string | null
          detailed_analysis?: Json | null
          flags?: Json | null
          headline: string
          id?: string
          image?: string | null
          location?: string | null
          metadata?: Json | null
          news_id?: string | null
          original_link?: string | null
          published_at?: string | null
          read_time?: string | null
          source?: Json | null
          sources_verified?: number | null
          trust_explanation?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          author?: Json | null
          category?: Json
          confidence_level?: number
          content?: string | null
          created_at?: string
          description?: string | null
          detailed_analysis?: Json | null
          flags?: Json | null
          headline?: string
          id?: string
          image?: string | null
          location?: string | null
          metadata?: Json | null
          news_id?: string | null
          original_link?: string | null
          published_at?: string | null
          read_time?: string | null
          source?: Json | null
          sources_verified?: number | null
          trust_explanation?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rss_feed_processing: {
        Row: {
          created_at: string | null
          feed_url: string
          last_processed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          feed_url: string
          last_processed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          feed_url?: string
          last_processed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      story_clusters: {
        Row: {
          centroid: string | null
          created_at: string | null
          id: number
          last_updated: string | null
          size: number | null
        }
        Insert: {
          centroid?: string | null
          created_at?: string | null
          id?: number
          last_updated?: string | null
          size?: number | null
        }
        Update: {
          centroid?: string | null
          created_at?: string | null
          id?: number
          last_updated?: string | null
          size?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_or_create_cluster: {
        Args: { p_id: string }
        Returns: number
      }
      match_content_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          cluster_id: number
          cluster_prob: number
          content: string
          created_at: string
          id: string
          key: string
          metadata: Json
          outlier_score: number
          similarity: number
        }[]
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      maybe_merge_around: {
        Args: { p_cluster_id: number }
        Returns: number
      }
      merge_clusters: {
        Args: { p_absorb: number; p_keep: number }
        Returns: number
      }
      near_clusters: {
        Args: { k?: number; p_cluster_id: number }
        Returns: {
          cosine_sim: number
          other_id: number
        }[]
      }
      nn_candidates: {
        Args: { k?: number; q: string; since?: unknown }
        Returns: {
          cluster_id: number
          cosine_sim: number
          created_at: string
          id: string
        }[]
      }
      sweep_merge: {
        Args: { limit_clusters?: number }
        Returns: undefined
      }
      update_key_by_content: {
        Args: { p_content: string; p_new_key: string }
        Returns: undefined
      }
    }
    Enums: {
      reaction_type: "like" | "dislike"
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
      reaction_type: ["like", "dislike"],
    },
  },
} as const
