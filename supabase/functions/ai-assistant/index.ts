const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the KaamSathi AI assistant. Help users (job providers and service workers) with questions about using the platform, ratings, raising an issue or complaint, posting or finding jobs, understanding match scores, and basic support questions. Be concise, friendly, and helpful. If you are unsure, say so rather than inventing platform features.`;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history: conversationHistory = [], language = 'en' } = await request.json();
    if (typeof message !== 'string' || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const history = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
          .slice(-10)
      : [];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('GROQ_API_KEY') ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT} ${language === 'hi' ? 'Respond in Hindi using Devanagari script.' : 'Respond in English.'}` },
          ...history,
          { role: 'user', content: message.trim() },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!groqResponse.ok) {
      console.error('Groq request failed:', groqResponse.status);
      return new Response(JSON.stringify({ error: 'Assistant request failed.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await groqResponse.json();
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      throw new Error('Empty assistant response.');
    }

    return new Response(JSON.stringify({ reply: reply.trim() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI assistant error:', error);
    return new Response(JSON.stringify({ error: 'Unable to contact assistant.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
