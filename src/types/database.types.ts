export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'job_provider' | 'service_provider';
export type WageType = 'daily' | 'hourly' | 'fixed';
export type JobStatus = 'open' | 'assigned' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type NotificationType = 'job_application' | 'job_accepted' | 'job_rejected' | 'chat' | 'system';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          skills: string[];
          hazards_avoided: string[];
          lat: number | null;
          lng: number | null;
          address: string | null;
          max_distance_km: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          skills?: string[];
          hazards_avoided?: string[];
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          max_distance_km?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          skills?: string[];
          hazards_avoided?: string[];
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          max_distance_km?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          description: string | null;
          category: string;
          wage: number;
          wage_type: WageType;
          lat: number;
          lng: number;
          address: string | null;
          required_skills: string[];
          hazards: string[];
          status: JobStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          description?: string | null;
          category: string;
          wage: number;
          wage_type: WageType;
          lat: number;
          lng: number;
          address?: string | null;
          required_skills?: string[];
          hazards?: string[];
          status?: JobStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          wage?: number;
          wage_type?: WageType;
          lat?: number;
          lng?: number;
          address?: string | null;
          required_skills?: string[];
          hazards?: string[];
          status?: JobStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          worker_id: string;
          status: ApplicationStatus;
          cover_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          worker_id: string;
          status?: ApplicationStatus;
          cover_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          worker_id?: string;
          status?: ApplicationStatus;
          cover_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          is_read: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: NotificationType;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          job_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          job_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          job_id?: string | null;
          content?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      accept_job_application: {
        Args: {
          p_application_id: string;
          p_job_id: string;
        };
        Returns: {
          success: boolean;
          job_id?: string;
          application_id?: string;
          worker_id?: string;
          error?: string;
        };
      };
    };
  };
}
