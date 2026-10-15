import { supabase } from './supabase';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendToAssistant(
  message: string,
  conversationHistory: AssistantMessage[],
  language: 'en' | 'hi' = 'en',
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history: conversationHistory, language },
  });

  if (error) throw error;
  if (!data?.reply || typeof data.reply !== 'string') {
    throw new Error('The assistant returned an invalid response.');
  }

  return data.reply;
}
