import React, { useState } from 'react';
import { Check, Loader2, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChannelVideo } from '@/api/types';

interface VideoSelectionPanelProps {
  videos: ChannelVideo[];
  channelName: string;
  onAnalyze: (selectedVideoIds: string[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const MAX_SELECTION = 10;

export function VideoSelectionPanel({
  videos,
  channelName,
  onAnalyze,
  onCancel,
  isLoading,
}: VideoSelectionPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (videoId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else if (newSet.size < MAX_SELECTION) {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleAnalyze = () => {
    if (selectedIds.size === 0) return;
    onAnalyze(Array.from(selectedIds));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[85vh] bg-zinc-950 border-white/10 flex flex-col shadow-2xl">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-red-500" />
            Select Videos to Analyze
          </CardTitle>
          <CardDescription className="text-white/60">
            Channel: <span className="text-white font-medium">{channelName}</span>
            <span className="mx-2">|</span>
            Found {videos.length} videos
            <span className="mx-2">|</span>
            Select up to {MAX_SELECTION} videos
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-4">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/50">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p>No videos found for this channel</p>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map((video, index) => {
                const isSelected = selectedIds.has(video.video_id);
                const isDisabled = !isSelected && selectedIds.size >= MAX_SELECTION;

                return (
                  <div
                    key={video.video_id}
                    onClick={() => !isDisabled && toggleSelection(video.video_id)}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-500/10 border-red-500/30'
                        : isDisabled
                        ? 'bg-zinc-900/30 border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-zinc-900/60 border-white/10 hover:bg-zinc-800/60 hover:border-white/20'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="border-white/30 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />

                    {/* Thumbnail */}
                    <div className="w-24 h-16 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <Play className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {index + 1}. {video.title}
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        {formatDate(video.published_at)}
                      </p>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 flex items-center justify-between">
          <div className="text-sm text-white/60">
            Selected: <span className="text-white font-medium">{selectedIds.size}</span> / {MAX_SELECTION}
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={selectedIds.size === 0 || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Analyze {selectedIds.size} Video{selectedIds.size !== 1 ? 's' : ''}</>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
