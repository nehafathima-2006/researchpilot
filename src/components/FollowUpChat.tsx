import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, X, ExternalLink } from 'lucide-react';
import { ResearchReport, FollowUpMessage } from '../types/research';
import { renderMarkdown } from '../utils/formatters';

interface FollowUpChatProps {
  report: ResearchReport;
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({
  report,
  isOpen,
  onClose,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<FollowUpMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSend(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || input).trim();
    if (!q || isLoading) return;

    const userMsg: FollowUpMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          question: q,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch follow-up answer');
      }

      const data = await response.json();
      const assistantMsg: FollowUpMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: FollowUpMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Error answering question: ${(err as Error)?.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Research Q&A Assistant
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded in current report & verified sources
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.length === 0 && (
          <div className="text-center py-10 px-4 text-slate-500 space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-slate-700 font-medium text-sm">
              Ask deep follow-up questions
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Interrogate specific trade-offs, edge-cases, implementation roadmaps, or technical benchmarks.
            </p>
            {report.evaluation.suggestedFollowUps && (
              <div className="pt-4 space-y-2 text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Suggested inquiries:
                </span>
                {report.evaluation.suggestedFollowUps.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg text-xs text-slate-800 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3.5 ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-900 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <div
                className="prose prose-xs max-w-none prose-p:my-1 prose-headings:my-1 prose-ul:my-1"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />

              {/* Citations if assistant message */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] space-y-1">
                  <span className="text-slate-500 font-medium">Grounded in:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        <span className="truncate max-w-[150px]">{c.title}</span>
                        {c.url && <ExternalLink className="w-2.5 h-2.5 shrink-0" />}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Consulting research index and reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask a question about this research..."
          className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
