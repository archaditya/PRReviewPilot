'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Square,
  Sparkles,
  Bot,
  Compass,
  FileCode2,
  Network,
  RotateCw,
} from 'lucide-react';
import { useChat, ChatMessageItem } from '@/hooks/use-chat';
import { ChatMessage } from './chat-message';
import { Button } from '@/components/ui/button';

interface ChatPanelProps {
  repositoryId: string;
  repositoryName: string;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Network,
    title: 'Architecture Overview',
    prompt: 'Can you give me a high-level overview of this repository architecture and main modules?',
  },
  {
    icon: Compass,
    title: 'API Endpoints',
    prompt: 'What are the main API endpoints in this repository and where are they defined?',
  },
  {
    icon: FileCode2,
    title: 'Call Hierarchy',
    prompt: 'Which functions and controllers call the core services in this repository?',
  },
];

export function ChatPanel({ repositoryId, repositoryName }: ChatPanelProps) {
  const {
    sessions,
    sessionsLoading,
    activeSessionId,
    setActiveSessionId,
    activeSession,
    messagesLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    stopStreaming,
    createSession,
    deleteSession,
  } = useChat(repositoryId);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const messages = activeSession?.messages || [];

  return (
    <div className="card-chai p-0 flex h-[calc(100vh-12rem)] min-h-[580px] w-full overflow-hidden">
      {/* ── Sessions Sidebar ── */}
      <div className="w-72 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="p-3 border-b border-white/10">
          <button
            onClick={() => createSession('New Chat')}
            className="w-full justify-start gap-2 h-9 text-xs font-medium rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center px-3 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-neutral-400" />
            <span>New conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessionsLoading && (
            <div className="text-xs font-mono text-neutral-500 p-3 text-center">
              Loading conversations...
            </div>
          )}
          {!sessionsLoading && sessions.length === 0 && (
            <div className="text-xs text-neutral-500 p-4 text-center leading-relaxed">
              No conversations yet. Start asking questions about this repository.
            </div>
          )}
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-white/10 font-medium text-white border border-white/15'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <span className="truncate">{session.title || 'Untitled Chat'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-white/10 text-[11px] font-mono text-neutral-500 flex items-center gap-2">
          <Network className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className="truncate">Grounded in Neo4j Graph</span>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messagesLoading && (
            <div className="flex items-center justify-center h-full text-xs font-mono text-neutral-500 gap-2">
              <RotateCw className="h-4 w-4 animate-spin" />
              Loading conversation history...
            </div>
          )}

          {!messagesLoading && messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-montserrat text-base font-medium tracking-tight text-white">
                  Chat with {repositoryName}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Ask architectural questions, trace symbol callers, or inspect endpoints with <span className="highlight">ast knowledge graph grounded reasoning</span>.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 gap-2.5 w-full text-left">
                {SUGGESTED_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(item.prompt);
                        sendMessage(item.prompt);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-colors text-xs group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-neutral-400 text-[11px] truncate">{item.prompt}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render historical messages */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Render active SSE streaming message */}
          {isStreaming && (
            <ChatMessage
              message={{
                id: 'streaming-temp',
                sessionId: activeSessionId || '',
                role: 'assistant',
                content: streamingContent || 'Analyzing code knowledge graph...',
                createdAt: new Date().toISOString(),
              }}
              isStreaming={true}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Box ── */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
          <div className="relative flex items-end gap-2 p-2 rounded-xl border border-white/15 bg-white/[0.03] focus-within:border-white/30 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything about ${repositoryName}... (Shift+Enter for newline)`}
              rows={1}
              className="flex-1 max-h-40 bg-transparent border-0 resize-none text-sm text-white placeholder:text-neutral-500 focus:outline-none px-2 py-1.5 font-sans"
            />

            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="h-8 w-8 p-0 rounded-lg shrink-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                title="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-8 px-3 rounded-md shrink-0 bg-white hover:bg-neutral-200 text-black font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-20"
                title="Send message"
              >
                <span>Send</span>
                <Send className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2 px-1">
            <span>Powered by Hybrid Graph-RAG (Neo4j + Tree-sitter)</span>
            <span>{input.length}/4000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
