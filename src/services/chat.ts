import { supabase } from './supabase';
import type { Database } from '../types/database.types';

export type Message = Database['public']['Tables']['messages']['Row'];

export interface Conversation {
  jobId: string;
  jobTitle: string;
  counterpartId: string;
  counterpartName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

export const chatService = {
  /**
   * Derive the list of conversations for a user from accepted applications.
   * Works for both roles:
   *  - As job_provider: find applications where job.provider_id = userId AND status = 'accepted'
   *  - As service_provider: find applications where worker_id = userId AND status = 'accepted'
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    // Fetch accepted applications where user is the worker
    const { data: asWorker } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        worker_id,
        status,
        jobs (
          id,
          title,
          provider_id,
          profiles!jobs_provider_id_fkey (
            id,
            full_name
          )
        )
      `)
      .eq('worker_id', userId)
      .eq('status', 'accepted');

    // Fetch accepted applications where user is the provider (via joined jobs)
    const { data: asProvider } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        worker_id,
        status,
        jobs!inner (
          id,
          title,
          provider_id,
          profiles!jobs_provider_id_fkey (
            id,
            full_name
          )
        ),
        worker_profile:profiles!applications_worker_id_fkey (
          id,
          full_name
        )
      `)
      .eq('jobs.provider_id', userId)
      .eq('status', 'accepted');

    const conversations: Conversation[] = [];

    // Build conversation list from worker perspective (counterpart = provider)
    if (asWorker) {
      for (const app of (asWorker as any[])) {
        const job = (app as any).jobs;
        if (!job) continue;
        const providerProfile = job.profiles;
        conversations.push({
          jobId: (app as any).job_id,
          jobTitle: job.title ?? 'Job',
          counterpartId: job.provider_id,
          counterpartName: providerProfile?.full_name ?? 'Provider',
          lastMessage: null,
          lastMessageAt: null,
        });
      }
    }

    // Build conversation list from provider perspective (counterpart = worker)
    if (asProvider) {
      for (const app of (asProvider as any[])) {
        const job = app.jobs as any;
        const workerProfile = (app as any).worker_profile;
        if (!job) continue;
        // Avoid duplicates in case the same user is somehow in both results
        const alreadyAdded = conversations.some(c => c.jobId === app.job_id && c.counterpartId === app.worker_id);
        if (alreadyAdded) continue;
        conversations.push({
          jobId: app.job_id,
          jobTitle: job.title ?? 'Job',
          counterpartId: app.worker_id,
          counterpartName: workerProfile?.full_name ?? 'Worker',
          lastMessage: null,
          lastMessageAt: null,
        });
      }
    }

    if (conversations.length === 0) return [];

    // Fetch last message for each conversation (by job_id) to enable sorting
    const jobIds = [...new Set(conversations.map(c => c.jobId))];
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('job_id, content, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false });

    if (lastMessages) {
      // Keep only the latest per job_id
      const latestByJob: Record<string, { content: string; created_at: string }> = {};
      // @ts-ignore
        for (const msg of (lastMessages as any[])) {
        if ((msg as any).job_id && !latestByJob[(msg as any).job_id]) {
          latestByJob[(msg as any).job_id] = { content: (msg as any).content, created_at: (msg as any).created_at };
        }
      }
      for (const conv of conversations) {
        if (latestByJob[conv.jobId]) {
          conv.lastMessage = latestByJob[conv.jobId].content;
          conv.lastMessageAt = latestByJob[conv.jobId].created_at;
        }
      }
    }

    // Sort by most recent activity (nulls last)
    conversations.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return conversations;
  },

  /** Fetch all messages for a job thread, ordered oldest → newest */
  async getMessages(jobId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
    return (data as Message[]) ?? [];
  },

  /** Insert a new message row */
  async sendMessage(
    senderId: string,
    receiverId: string,
    jobId: string,
    content: string,
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      // @ts-ignore
        .insert({ sender_id: senderId, receiver_id: receiverId, job_id: jobId, content })
      .select()
      .single();

    if (error) {
      console.error('Failed to send message:', error);
      return null;
    }
    return data as Message;
  },

  /**
   * Subscribe to new messages for a job via Supabase Realtime.
   * Returns an unsubscribe function.
   * Falls back to polling every 5 s if the channel fails to connect.
   */
  subscribeToMessages(
    jobId: string,
    onNewMessage: (msg: Message) => void,
  ): () => void {
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    let lastSeenAt = new Date().toISOString();

    const channel = supabase
      .channel(`public:messages:job_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Realtime unavailable — fall back to polling
          console.warn('[Chat] Realtime unavailable, falling back to 5s polling.');
          if (!pollingInterval) {
            pollingInterval = setInterval(async () => {
              const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('job_id', jobId)
                .gt('created_at', lastSeenAt)
                .order('created_at', { ascending: true });

              if (data && data.length > 0) {
                for (const msg of data as Message[]) {
                  onNewMessage(msg);
                }
                lastSeenAt = (data as Message[])[data.length - 1].created_at;
              }
            }, 5000);
          }
        }
      });

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      supabase.removeChannel(channel);
    };
  },
};
