import React from 'react';
import { X, History, Trash2, Play, Clock, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnalysisHistoryItem } from '@/api/types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ isOpen, onClose, history, onSelect, onClear, onDelete }: HistoryPanelProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[80vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
              <History className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Analysis History</h2>
              <p className="text-sm text-white/50">{history.length} saved analyses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
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

        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/50">No analysis history yet</p>
            <p className="text-sm text-white/30 mt-1">
              Analyze a video or channel to see it here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <div className="w-20 h-14 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Youtube className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40 capitalize px-2 py-0.5 rounded-full bg-white/5">
                        {item.analysis_type}
                      </span>
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                      }}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
