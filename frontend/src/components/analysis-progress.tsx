import React from "react";
import { ProgressState, VideoMetadata } from "@/api/types";
import { 
  Database, 
  Brain, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from "lucide-react";

interface AnalysisProgressProps {
  progress: ProgressState;
  videoPreview: VideoMetadata | null;
}

const stages = [
  { key: 'fetching_data', label: 'Fetching Data', icon: Database, range: [15, 35] },
  { key: 'analyzing_sentiment', label: 'Analyzing Sentiment', icon: Brain, range: [35, 60] },
  { key: 'clustering_topics', label: 'Discovering Topics', icon: Layers, range: [60, 80] },
  { key: 'generating_report', label: 'Generating Report', icon: FileText, range: [80, 100] },
];

function getStageStatus(currentStage: string, currentProgress: number, stageKey: string, stageRange: number[]) {
  const stageIndex = stages.findIndex(s => s.key === stageKey);
  const currentIndex = stages.findIndex(s => s.key === currentStage);
  
  if (currentStage === 'complete') return 'complete';
  if (currentStage === 'error') return currentIndex >= stageIndex ? 'error' : 'pending';
  if (currentIndex > stageIndex) return 'complete';
  if (currentIndex === stageIndex) return 'active';
  return 'pending';
}

export function AnalysisProgress({ progress, videoPreview }: AnalysisProgressProps) {
  const isError = progress.stage === 'error';
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Video Preview Card */}
      {videoPreview && (
        <div className="mb-8 bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            {videoPreview.thumbnail && (
              <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                <img 
                  src={videoPreview.thumbnail} 
                  alt={videoPreview.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            
            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-lg truncate">
                {videoPreview.title}
              </h3>
              <p className="text-white/50 text-sm mt-1">
                {videoPreview.channel_name}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                {videoPreview.views > 0 && (
                  <span>{formatNumber(videoPreview.views)} views</span>
                )}
                {videoPreview.likes > 0 && (
                  <span>{formatNumber(videoPreview.likes)} likes</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isError ? 'bg-red-500' : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-white/50">{progress.message}</span>
            <span className="text-sm font-medium text-white/70">{progress.progress}%</span>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="grid grid-cols-4 gap-3">
          {stages.map((stage) => {
            const status = getStageStatus(progress.stage, progress.progress, stage.key, stage.range);
            const Icon = stage.icon;
            
            return (
              <div 
                key={stage.key}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                  status === 'active' 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : status === 'complete'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : status === 'error'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-zinc-900/40 border border-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'active' 
                    ? 'bg-red-500/20 text-red-400'
                    : status === 'complete'
                    ? 'bg-green-500/20 text-green-400'
                    : status === 'error'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-zinc-800 text-white/30'
                }`}>
                  {status === 'active' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs text-center ${
                  status === 'active' ? 'text-red-300' 
                  : status === 'complete' ? 'text-green-300'
                  : status === 'error' ? 'text-red-300'
                  : 'text-white/40'
                }`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {isError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{progress.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
