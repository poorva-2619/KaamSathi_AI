import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { chatService, type Message } from '../../services/chat';
import { formatDistanceToNow } from 'date-fns';

interface LocationState {
  jobTitle?: string;
  counterpartName?: string;
}

export const ChatThread: React.FC = () => {
  const { jobId, counterpartId } = useParams<{ jobId: string; counterpartId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = (location.state as LocationState) ?? {};
  const jobTitle = state.jobTitle ?? 'Job Chat';
  const counterpartName = state.counterpartName ?? 'User';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track message IDs to avoid duplicates from realtime + poll
  const seenIds = useRef<Set<string>>(new Set());

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  const appendMessage = useCallback((msg: Message) => {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Load initial messages
  useEffect(() => {
    if (!jobId) return;
    const load = async () => {
      setLoading(true);
      const data = await chatService.getMessages(jobId);
      seenIds.current = new Set(data.map((m) => m.id));
      setMessages(data);
      setLoading(false);
    };
    load();
  }, [jobId]);

  // Subscribe to realtime (or polling fallback)
  useEffect(() => {
    if (!jobId) return;
    const unsubscribe = chatService.subscribeToMessages(jobId, (newMsg) => {
      appendMessage(newMsg);
    });
    return unsubscribe;
  }, [jobId, appendMessage]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (!loading) {
      scrollToBottom(messages.length <= 1 ? 'instant' : 'smooth');
    }
  }, [messages, loading, scrollToBottom]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id || !jobId || !counterpartId || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic append
    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      sender_id: user.id,
      receiver_id: counterpartId,
      job_id: jobId,
      content: text,
      created_at: new Date().toISOString(),
    };
    seenIds.current.add(optimisticMsg.id);
    setMessages((prev) => [...prev, optimisticMsg]);

    const saved = await chatService.sendMessage(user.id, counterpartId, jobId, text);
    setSending(false);

    if (saved) {
      // Replace optimistic message with real one
      seenIds.current.add(saved.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? saved : m)),
      );
    } else {
      // Remove optimistic message on failure
      seenIds.current.delete(optimisticMsg.id);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOwnMessage = (msg: Message) => msg.sender_id === user?.id;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
        <button
          onClick={() => navigate('/chat')}
          className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Back to chat list"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-sm truncate">{counterpartName}</div>
          <div className="text-xs text-primary-600 truncate">{jobTitle}</div>
        </div>
        {/* Counterpart avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">
            {counterpartName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
            <p className="text-sm text-slate-500">No messages yet.</p>
            <p className="text-xs text-slate-400">Say hello to get the conversation started!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const own = isOwnMessage(msg);
            return (
              <div
                key={msg.id}
                className={`flex ${own ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl shadow-sm ${
                    own
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-snug break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      own ? 'text-primary-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — sits just above the BottomNav (pb-16 on mobile) */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3">
        {/* Extra clearance on mobile to sit above BottomNav (h-16) */}
        <div className="mb-16 md:mb-0 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary-300 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
