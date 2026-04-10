import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageCircle, 
  Eye, 
  TrendingUp, 
  Users, 
  Smile,
  Hash,
  FileText,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AnalyzeResponse } from '@/api/types';
import { TopicClusterCard } from './topic-cluster-card';
import { SentimentTab } from './sentiment-tab';
import { ActionableInsights } from './actionable-insights';
import { ViewAllComments } from './view-all-comments';
import { PDFExport } from './pdf-export';

interface AnalysisResultsProps {
  results: AnalyzeResponse;
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  const { sentiment, top_comments, all_comments, channel_insights, agent_summaries, video_metadata, topics, report } = results;
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});

  const sentimentPercentage = Math.max(0, Math.min(100, ((sentiment.score + 1) / 2) * 100));

  const toggleAgentExpand = (agent: string) => {
    setExpandedAgents(prev => ({ ...prev, [agent]: !prev[agent] }));
  };

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto pb-24">
      {/* Section 1: Video Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <Card className="bg-zinc-900/60 border-white/10 overflow-hidden">
            <div className="aspect-video relative">
              {video_metadata.thumbnail ? (
                <img src={video_metadata.thumbnail} alt={video_metadata.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-white/30">No thumbnail</span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-white line-clamp-2 mb-2">{video_metadata.title}</h2>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2"><Eye className="w-4 h-4" /><span>{formatNumber(video_metadata.views)} views</span></div>
                <div className="flex items-center gap-2"><ThumbsUp className="w-4 h-4" /><span>{formatNumber(video_metadata.likes)} likes</span></div>
                <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /><span>{formatNumber(video_metadata.comment_count)} comments</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10"><PDFExport results={results} /></div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Card className="bg-zinc-900/60 border-white/10 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2"><Smile className="w-5 h-5 text-red-500" />Sentiment Overview</CardTitle>
              <CardDescription className="text-white/50">Overall audience reaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Overall Sentiment</span>
                  <Badge variant="outline" className={`capitalize ${getSentimentColor(sentiment.label)}`}>{sentiment.label}</Badge>
                </div>
                <Progress value={sentimentPercentage} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{sentiment.vibe_score}/10</div>
                  <div className="text-xs text-white/50 mt-1">Vibe</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{sentiment.likeness_score}/10</div>
                  <div className="text-xs text-white/50 mt-1">Likeness</div>
                </div>
                <div className={`bg-white/5 rounded-lg p-4 text-2xl font-bold capitalize text-center ${getToxicityColor(sentiment.toxicity_level)}`}>
                  <div>{sentiment.toxicity_level}</div>
                  <div className="text-xs text-white/50 font-normal mt-1">Toxicity</div>
                </div>
              </div>
              {/* Sentiment Distribution Below */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {sentiment.sentiment_distribution?.positive || 0}%
                  </div>
                  <div className="text-xs text-white/50 mt-1">Positive</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {sentiment.sentiment_distribution?.negative || 0}%
                  </div>
                  <div className="text-xs text-white/50 mt-1">Negative</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {sentiment.sentiment_distribution?.neutral || 0}%
                  </div>
                  <div className="text-xs text-white/50 mt-1">Neutral</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Channel Insights */}
      <Card className="bg-zinc-900/60 border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Users className="w-5 h-5 text-red-500" />Channel Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white/5 rounded-lg p-4"><div className="text-sm text-white/50 mb-1">Channel</div><div className="text-lg font-semibold text-white truncate">{channel_insights.channel_name}</div></div>
            <div className="bg-white/5 rounded-lg p-4"><div className="text-sm text-white/50 mb-1">Subscribers</div><div className="text-lg font-semibold text-white">{channel_insights.subscriber_count > 0 ? formatNumber(channel_insights.subscriber_count) : 'N/A'}</div></div>
            <div className="bg-white/5 rounded-lg p-4"><div className="text-sm text-white/50 mb-1">Videos</div><div className="text-lg font-semibold text-white">{channel_insights.total_videos && channel_insights.total_videos > 0 ? formatNumber(channel_insights.total_videos) : 'N/A'}</div></div>
            <div className="bg-white/5 rounded-lg p-4"><div className="text-sm text-white/50 mb-1">Views</div><div className="text-lg font-semibold text-white">{formatNumber(video_metadata.views)}</div></div>
            <div className="bg-white/5 rounded-lg p-4"><div className="text-sm text-white/50 mb-1">Engagement</div><div className="text-lg font-semibold text-white">{channel_insights.engagement_rate > 0 ? `${channel_insights.engagement_rate.toFixed(2)}%` : 'N/A'}</div></div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Sentiment Charts */}
      <div className="mb-12">
        <SentimentTab sentiment={sentiment} />
      </div>

      {/* Section 4: Actionable Insights */}
      <div className="mb-8">
        <ActionableInsights
          topPraises={sentiment.top_praises}
          topCriticisms={sentiment.top_criticisms}
          topQuestions={sentiment.top_questions}
          vibeScore={sentiment.vibe_score}
        />
      </div>

      {/* Section 5: Topic Clusters */}
      <Card className="bg-zinc-900/60 border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Hash className="w-5 h-5 text-red-500" />Topic Clusters ({topics.length})</CardTitle>
          <CardDescription className="text-white/50">Key themes identified in viewer discussions</CardDescription>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? <p className="text-white/50 text-center py-8">No topics identified</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic, index) => (
                <TopicClusterCard
                  key={index}
                  label={topic.label || topic.name || `Theme ${index + 1}`}
                  description={topic.description}
                  sentiment={topic.sentiment}
                  size={topic.size || topic.comment_count}
                  representative_comments={topic.representative_comments}
                  index={index}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 6: Top Comments */}
      <Card className="bg-zinc-900/60 border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><MessageCircle className="w-5 h-5 text-red-500" />Top Comments</CardTitle>
          <CardDescription className="text-white/50">Most engaged comments from viewers</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {top_comments.length === 0 ? <p className="text-white/50 text-center py-8">No comments</p> : top_comments.map((comment, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0"><span className="text-xs font-medium text-red-500">{index + 1}</span></div>
                    <p className="text-white/80 text-sm leading-relaxed">{comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Section 7: All Comments */}
      {all_comments && all_comments.length > 0 && <ViewAllComments comments={all_comments} />}

      {/* Section 8: AI Agent Insights */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Bot className="w-5 h-5 text-red-500" />AI Agent Insights</CardTitle>
          <CardDescription className="text-white/50">Analysis from each AI agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AgentSummaryItem icon={<TrendingUp className="w-4 h-4" />} title="Data Agent" content={agent_summaries.data_agent} />
          <AgentSummaryItem icon={<Smile className="w-4 h-4" />} title="Sentiment Agent" content={agent_summaries.sentiment_agent} isExpandable expanded={expandedAgents['sentiment']} onToggle={() => toggleAgentExpand('sentiment')} />
          <AgentSummaryItem icon={<Hash className="w-4 h-4" />} title="Topic Agent" content={agent_summaries.topic_agent} />
          <AgentSummaryItem icon={<FileText className="w-4 h-4" />} title="Report Agent" content={agent_summaries.report_agent} isExpandable expanded={expandedAgents['report']} onToggle={() => toggleAgentExpand('report')} />
        </CardContent>
      </Card>

      {/* Section 9: Full Report */}
      {report && (
        <Card className="bg-zinc-900/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><FileText className="w-5 h-5 text-red-500" />Full Analysis Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/5 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">{report}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface AgentSummaryItemProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  isExpandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

function AgentSummaryItem({ icon, title, content, isExpandable, expanded, onToggle }: AgentSummaryItemProps) {
  const shouldTruncate = content.length > 200;
  const displayContent = expanded || !shouldTruncate ? content : content.slice(0, 200) + '...';

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-red-500">{icon}<span className="text-sm font-medium">{title}</span></div>
        {isExpandable && shouldTruncate && (
          <Button variant="ghost" size="sm" onClick={onToggle} className="text-white/50 hover:text-white hover:bg-white/5 h-6 px-2">
            {expanded ? <><ChevronUp className="w-4 h-4 mr-1" />Show Less</> : <><ChevronDown className="w-4 h-4 mr-1" />Read More</>}
          </Button>
        )}
      </div>
      <p className="text-sm text-white/70 whitespace-pre-wrap">{displayContent}</p>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function getSentimentColor(label: string): string {
  switch (label.toLowerCase()) {
    case 'positive': return 'border-green-500 text-green-500';
    case 'negative': return 'border-red-500 text-red-500';
    default: return 'border-yellow-500 text-yellow-500';
  }
}

function getToxicityColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'none': case 'low': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'high': case 'very high': return 'text-red-500';
    default: return 'text-white/50';
  }
}
