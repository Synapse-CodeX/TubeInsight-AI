// API Types for TubeInsight AI Backend

export interface AnalyzeRequest {
  youtube_url?: string;
  youtube_urls?: string[];
  max_comments?: number;
  analysis_type?: 'video' | 'channel';
}

export interface EmotionBreakdown {
  joy: number;
  anger: number;
  love: number;
  surprise: number;
  sadness: number;
}

export interface SentimentData {
  label: string;
  score: number;
  vibe_score: number;
  likeness_score: number;
  toxicity_level: string;
  sentiment_distribution?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  emotion_breakdown?: EmotionBreakdown;
  top_praises?: string[];
  top_criticisms?: string[];
  top_questions?: string[];
  summary?: string;
}

export interface ChannelInsights {
  subscriber_count: number;
  avg_views: number;
  engagement_rate: number;
  channel_name: string;
  channel_id: string;
  total_videos?: number;
}

export interface AgentSummaries {
  data_agent: string;
  sentiment_agent: string;
  topic_agent: string;
  report_agent: string;
}

export interface VideoMetadata {
  title: string;
  views: number;
  likes: number;
  duration: string;
  thumbnail: string;
  published_at: string;
  video_id: string;
  url: string;
  comment_count: number;
  channel_name?: string;
  channel_id?: string;
}

export interface Topic {
  id?: number;
  name?: string;
  label?: string;
  keywords?: string[];
  comment_count?: number;
  summary?: string;
  description?: string;
  sentiment?: string;
  size?: number;
  representative_comments?: string[];
}

export interface Comment {
  text: string;
  author?: string;
  like_count: number;
  published_at?: string;
}

export interface AnalyzeResponse {
  sentiment: SentimentData;
  top_comments: string[];
  all_comments?: Comment[];
  channel_insights: ChannelInsights;
  agent_summaries: AgentSummaries;
  video_metadata: VideoMetadata;
  topics: Topic[];
  report?: string;
}

export interface ChatRequest {
  query: string;
}

export interface ChatResponse {
  response: string;
}

export interface ChannelVideosRequest {
  channel_url: string;
  max_results?: number;
}

export interface ChannelVideo {
  video_id: string;
  title: string;
  published_at: string;
  thumbnail?: string;
  channel_id: string;
  channel_name: string;
}

export interface ChannelVideosResponse {
  videos: ChannelVideo[];
  channel_name: string;
  channel_id: string;
}

export interface HealthResponse {
  status: string;
}

// Progress tracking types
export interface ProgressState {
  stage: 'idle' | 'initializing' | 'fetching_data' | 'analyzing_sentiment' | 'clustering_topics' | 'generating_report' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface ProgressEvent {
  stage: string;
  progress: number;
  message: string;
  video_metadata?: VideoMetadata;
  partial_results?: AnalyzeResponse;
}

export interface AnalysisHistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  analysis_type: 'video' | 'channel';
  date: string;
  results: AnalyzeResponse;
}

export interface UserSettings {
  max_comments: number;
  theme: 'dark' | 'light';
}
