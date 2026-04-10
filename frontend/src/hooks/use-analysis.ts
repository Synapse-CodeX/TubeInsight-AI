import { useState, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { AnalyzeRequest, AnalyzeResponse, AnalysisHistoryItem, ProgressState, VideoMetadata, ProgressEvent } from '@/api/types';

const HISTORY_STORAGE_KEY = 'tubeinsight_analysis_history';
const SETTINGS_STORAGE_KEY = 'tubeinsight_settings';

export interface UseAnalysisReturn {
  results: AnalyzeResponse | null;
  isLoading: boolean;
  error: string | null;
  progress: ProgressState;
  videoPreview: VideoMetadata | null;
  analyze: (request: AnalyzeRequest) => Promise<void>;
  analyzeWithProgress: (request: AnalyzeRequest) => Promise<void>;
  clearResults: () => void;
}

export interface UserSettings {
  max_comments: number;
}

const initialProgress: ProgressState = {
  stage: 'idle',
  progress: 0,
  message: '',
};

export function useAnalysis(): UseAnalysisReturn {
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [videoPreview, setVideoPreview] = useState<VideoMetadata | null>(null);

  const analyze = useCallback(async (request: AnalyzeRequest) => {
    setIsLoading(true);
    setError(null);
    setProgress(initialProgress);
    setVideoPreview(null);

    try {
      const response = await apiClient.analyze(request);
      setResults(response);
      setProgress({ stage: 'complete', progress: 100, message: 'Analysis complete!' });
      
      // Save to history
      saveToHistory(request, response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setResults(null);
      setProgress({ stage: 'error', progress: 0, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeWithProgress = useCallback(async (request: AnalyzeRequest) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setProgress({ stage: 'initializing', progress: 0, message: 'Starting analysis...' });
    setVideoPreview(null);

    try {
      const response = await apiClient.analyzeWithProgress(
        request,
        (event: ProgressEvent) => {
          // Update progress state
          setProgress({
            stage: event.stage as ProgressState['stage'],
            progress: event.progress,
            message: event.message,
          });
          
          // Update video preview if metadata is available
          if (event.video_metadata) {
            setVideoPreview(event.video_metadata);
          }
        }
      );
      
      setResults(response);
      setProgress({ stage: 'complete', progress: 100, message: 'Analysis complete!' });
      
      // Save to history
      saveToHistory(request, response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setResults(null);
      setProgress({ stage: 'error', progress: 0, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setProgress(initialProgress);
    setVideoPreview(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    progress,
    videoPreview,
    analyze,
    analyzeWithProgress,
    clearResults,
  };
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const addToHistory = useCallback((item: AnalysisHistoryItem) => {
    setHistory((prev) => {
      const newHistory = [item, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.id !== id);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window === 'undefined') return { max_comments: 100 };
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { max_comments: 100 };
  });

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    settings,
    updateSettings,
  };
}

function saveToHistory(request: AnalyzeRequest, response: AnalyzeResponse) {
  const historyItem: AnalysisHistoryItem = {
    id: `${Date.now()}-${response.video_metadata.video_id}`,
    url: request.youtube_url,
    title: response.video_metadata.title,
    thumbnail: response.video_metadata.thumbnail,
    analysis_type: request.analysis_type || 'video',
    date: new Date().toISOString(),
    results: response,
  };

  const existing = localStorage.getItem(HISTORY_STORAGE_KEY);
  const history: AnalysisHistoryItem[] = existing ? JSON.parse(existing) : [];
  const newHistory = [historyItem, ...history].slice(0, 50);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
}
