import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/hooks/use-chat';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  videoTitle?: string;
}

export function AIChatPanel({ isOpen, onClose, onOpen, videoTitle }: AIChatPanelProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onOpen}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 z-40 p-0"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl h-[80vh] bg-zinc-950 border-white/10 flex flex-col shadow-2xl">
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">AI Assistant</CardTitle>
                {videoTitle && (
                  <p className="text-xs text-white/50 truncate max-w-[250px]">
                    Ask about: {videoTitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Ask me anything about this video</h3>
                  <p className="text-white/50 text-sm max-w-sm">
                    I have analyzed the comments and can answer questions about sentiment, topics, and viewer feedback.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['What are viewers saying?', 'Summarize the feedback', 'What are the main complaints?', 'What do people love most?'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(suggestion)}
                      className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-white text-black' 
                        : 'bg-red-600/20 text-red-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="bg-white/10 rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the video..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-red-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
