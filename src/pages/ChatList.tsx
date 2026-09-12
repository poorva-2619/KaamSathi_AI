import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService, type Conversation } from '../services/chat';
import { formatDistanceToNow } from 'date-fns';

export const ChatList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-white border-b border-slate-200 px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500 mt-0.5">Conversations from accepted jobs</p>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        {loading ? (
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
            <h2 className="text-lg font-semibold text-slate-700">No conversations yet</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Conversations start once a job is accepted. Accept an application or wait for
              your application to be accepted.
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
