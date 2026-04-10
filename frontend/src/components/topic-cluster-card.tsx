import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopicClusterCardProps {
  label: string;
  description?: string;
  sentiment?: string;
  size?: number;
  representative_comments?: string[];
  index?: number;
}

const sentimentColors: Record<string, { dot: string; border: string; bg: string }> = {
  positive: { dot: 'bg-green-500', border: 'border-green-500/30', bg: 'bg-green-500/5' },
  negative: { dot: 'bg-red-500', border: 'border-red-500/30', bg: 'bg-red-500/5' },
  neutral: { dot: 'bg-yellow-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' },
  mixed: { dot: 'bg-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
};

const topicGradientColors = [
  'from-red-500/20 to-orange-500/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-green-500/20 to-emerald-500/20',
  'from-purple-500/20 to-pink-500/20',
  'from-yellow-500/20 to-amber-500/20',
  'from-indigo-500/20 to-violet-500/20',
];

export function TopicClusterCard({
  label,
  description,
  sentiment = 'neutral',
  size = 0,
  representative_comments = [],
  index = 0,
}: TopicClusterCardProps) {
  const colors = sentimentColors[sentiment.toLowerCase()] || sentimentColors.neutral;
  const gradient = topicGradientColors[index % topicGradientColors.length];
  
  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:scale-[1.02]`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      
      <div className="relative z-10">
        {/* Header with label and sentiment */}
        <div className="flex items-start gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${colors.dot} mt-2 flex-shrink-0`} />
          <h3 className="font-semibold text-white text-sm leading-tight">{label}</h3>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-white/70 text-xs mb-3 line-clamp-3 pl-4">{description}</p>
        )}
        
        {/* Representative comment */}
        {representative_comments.length > 0 && (
          <div className="pl-4 border-l-2 border-white/10 mb-3">
            <p className="text-white/50 text-xs italic line-clamp-2">
              "{representative_comments[0]}"
            </p>
          </div>
        )}
        
        {/* Footer with comment count */}
        <div className="flex items-center justify-between pl-4">
          <Badge variant="outline" className="text-xs text-white/40 border-white/10">
            <MessageCircle className="w-3 h-3 mr-1" />
            {size} comments
          </Badge>
          {sentiment && (
            <span className={`text-xs capitalize ${
              sentiment === 'positive' ? 'text-green-400' :
              sentiment === 'negative' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {sentiment}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
