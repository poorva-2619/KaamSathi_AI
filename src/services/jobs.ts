import { supabase } from './supabase';
import type { Database } from '../types/database.types';
import { deriveTags } from '../utils/autoTag';

export type JobRow = Database['public']['Tables']['jobs']['Row'];

export const jobsService = {
  async getJobs(): Promise<JobRow[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as JobRow[];
  },

  async getJobById(id: string): Promise<JobRow | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as JobRow | null;
  },

  async getJobCountsByProvider(providerId: string): Promise<{ posted: number; completed: number }> {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('provider_id', providerId);

    if (error) {
      console.error('Error fetching job counts:', error);
      return { posted: 0, completed: 0 };
    }

    const jobs = (data || []) as Array<{ id: string; status: string }>;
    const posted = jobs.length;
    const completed = jobs.filter((j) => j.status === 'completed').length;

    return { posted, completed };
  },


  async createJob(job: Database['public']['Tables']['jobs']['Insert']): Promise<JobRow> {
    // Derive required_skills and hazards from title/description using the simple heuristic
    const { required_skills, hazards } = deriveTags(job.title, job.description ?? '');
    const jobWithTags = {
      ...job,
      required_skills,
      hazards,
      status: 'open' as const, // default status
    };

    const { data, error } = await supabase
      .from('jobs')
      // @ts-ignore - Supabase type inference helper
      .insert(jobWithTags)
      .select('*')
      .single();

    if (error) throw error;
    return data as JobRow;
  },



  /** Get all jobs created by a specific provider */
  async getJobsByProvider(providerId: string): Promise<JobRow[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as JobRow[];
  },

  /** Get all jobs with status 'open' (used later by Feature F6) */
  async getOpenJobs(): Promise<JobRow[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as JobRow[];
  },

  /** Lightweight count of open jobs */
  async getOpenJobsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');
    if (error) throw error;
    return count ?? 0;
  },
};
