import { supabase } from './supabase';
import type { Database } from '../types/database.types';

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
    const { data, error } = await supabase
      .from('jobs')
      // @ts-ignore - Supabase type inference helper
      .insert(job)
      .select('*')
      .single();

    if (error) throw error;
    return data as JobRow;
  },
};

