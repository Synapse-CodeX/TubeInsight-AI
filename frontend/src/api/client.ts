import { AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse, HealthResponse, ChannelVideosRequest, ChannelVideosResponse, ProgressEvent } from './types';

const API_BASE_URL = 'http://localhost:8000';

export class APIError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

export type ProgressCallback = (event: ProgressEvent) => void;

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail;
        if (typeof detail === 'string') {
          throw new APIError(detail, response.status);
        }

        if (detail && typeof detail === 'object') {
          const message = detail.message || `HTTP ${response.status}: ${response.statusText}`;
          const code = detail.code;
          throw new APIError(message, response.status, code);
        }

        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/health');
  }

  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    return this.fetch<AnalyzeResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Analyze with progress streaming via SSE.
   * Calls onProgress for each progress update, returns final results.
   */
  async analyzeWithProgress(
    request: AnalyzeRequest,
    onProgress: ProgressCallback,
  ): Promise<AnalyzeResponse> {
    const url = `${this.baseUrl}/analyze/stream`;
    
    return new Promise((resolve, reject) => {
      // Use fetch with streaming for SSE
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            reject(new APIError(errorData.detail || 'Stream failed', response.status));
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            reject(new Error('No response body'));
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          const processLine = (line: string) => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6)) as ProgressEvent;
                onProgress(data);
                
                // If complete, resolve with results
                if (data.stage === 'complete' && data.partial_results) {
                  resolve(data.partial_results);
                } else if (data.stage === 'error') {
                  reject(new APIError(data.message || 'Analysis failed'));
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          };

          // Read the stream
          const pump = async (): Promise<void> => {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining buffer
              if (buffer.trim()) {
                buffer.split('\n').forEach(processLine);
              }
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            lines.forEach(processLine);
            
            return pump();
          };

          pump().catch(reject);
        })
        .catch(reject);
    });
  }

  async getChannelVideos(request: ChannelVideosRequest): Promise<ChannelVideosResponse> {
    return this.fetch<ChannelVideosResponse>('/channel/videos', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.fetch<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiClient = new APIClient();
export default APIClient;
