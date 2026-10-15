import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, Clock, Send, Mic, MicOff, Bot, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService, type Conversation } from '../services/chat';
import { formatDistanceToNow } from 'date-fns';
import { sendToAssistant, type AssistantMessage } from '../services/aiAssistant';
import { useTranslation } from 'react-i18next';

interface SupportMessage extends AssistantMessage {
  id: string;
  createdAt: string;
  error?: boolean;
}

const initialSupportMessage: SupportMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '',
  createdAt: new Date().toISOString(),
};

const SupportAssistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<SupportMessage[]>(() => [{ ...initialSupportMessage, content: t('assistantWelcome') }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState(() => typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
  const recognitionRef = React.useRef<any>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const submitMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || sending) return;

    const userMessage: SupportMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const history = messages
      .filter((message) => !message.error)
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const reply = await sendToAssistant(trimmed, history, i18n.language === 'hi' ? 'hi' : 'en');
      setMessages((current) => [...current, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      }]);
    } catch {
      setMessages((current) => [...current, {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: t('couldNotRespond'),
        createdAt: new Date().toISOString(),
        error: true,
      }]);
    } finally {
      setSending(false);
    }
  };

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    if (lastUserMessage) {
      setMessages((current) => current.filter((message) => !message.error));
      void submitMessage(lastUserMessage.content);
    }
  };

  const toggleVoiceInput = () => {
    if (!voiceSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      setInput((current) => `${current}${current ? ' ' : ''}${event.results[0][0].transcript}`);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  React.useEffect(() => () => recognitionRef.current?.stop(), []);

  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white"><Bot className="h-5 w-5" /></div>
        <div><h2 className="text-sm font-bold text-slate-900">KaamSathi AI</h2><p className="text-xs text-slate-500">Your platform support assistant</p></div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-primary-600 text-white' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}>
                {message.content}
              </div>
              {message.error ? (
                <button type="button" onClick={retryLastMessage} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"><RotateCcw className="h-3 w-3" /> Try again</button>
              ) : (
                <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
              )}
            </div>
          </div>
        ))}
        {sending && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3"><span className="inline-flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" /></span></div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3">
        <div className="flex items-end gap-2 rounded-full border border-slate-200 bg-slate-50 p-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submitMessage(input); } }} rows={1} placeholder={t('assistantPlaceholder')} className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" disabled={sending} />
          <button type="button" onClick={toggleVoiceInput} disabled={!voiceSupported || sending} title={voiceSupported ? (listening ? t('stopRecording') : t('useVoice')) : t('voiceUnsupported')} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${listening ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:bg-slate-200'} disabled:cursor-not-allowed disabled:opacity-40`} aria-label={voiceSupported ? t('useVoice') : t('voiceUnsupported')}>{listening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}</button>
          <button type="button" onClick={() => void submitMessage(input)} disabled={!input.trim() || sending} aria-label={t('send')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};

export const ChatList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'support'>('jobs');

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const data = await chatService.getConversations(user.id);
      setConversations(data);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const openThread = (conv: Conversation) => {
    navigate(`/chat/${conv.jobId}/${conv.counterpartId}`, {
      state: { jobTitle: conv.jobTitle, counterpartName: conv.counterpartName },
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-6">
        <div className="px-4 pb-2">
          <h1 className="text-xl font-bold text-slate-900">{t('messages')}</h1>
        </div>
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'jobs' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('jobChats')}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'support' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('support')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        {activeTab === 'support' ? (
          <SupportAssistant />
        ) : loading ? (
          /* Skeleton loaders */
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/5" />
                  <div className="h-3 bg-slate-100 rounded w-3/5" />
                </div>
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700">{t('noConversations')}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('noConversationsDescription')}
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={`${conv.jobId}-${conv.counterpartId}`}
              onClick={() => openThread(conv)}
              className="w-full bg-white rounded-2xl p-4 border border-slate-100 hover:border-primary-200 hover:shadow-md active:scale-[0.98] transition-all duration-150 flex items-center gap-3 text-left shadow-sm"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">
                  {conv.counterpartName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm truncate">
                    {conv.counterpartName}
                  </span>
                  {conv.lastMessageAt && (
                    <span className="text-[11px] text-slate-400 ml-2 shrink-0 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-primary-600 font-medium truncate mt-0.5">
                  {conv.jobTitle}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {conv.lastMessage ?? 'No messages yet — say hello!'}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
