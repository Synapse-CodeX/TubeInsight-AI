import React, { useState } from "react";
import { 
  Search, 
  Paperclip, 
  Globe, 
  ArrowUp, 
  Tv, 
  User as UserIcon, 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut,
  Loader2,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysis, useAnalysisHistory, useSettings } from "@/hooks/use-analysis";
import { SettingsPanel } from "@/components/settings-panel";
import { HistoryPanel } from "@/components/history-panel";
import { AnalysisResults } from "@/components/analysis-results";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { VideoSelectionPanel } from "@/components/video-selection-panel";
import { AnalysisProgress } from "@/components/analysis-progress";
import { APIError, apiClient } from "@/api/client";
import { AnalysisHistoryItem, ChannelVideo } from "@/api/types";

const Dashboard = () => {
  const [activeMode, setActiveMode] = useState<"channel" | "video">("video");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [view, setView] = useState<"input" | "results">("input");
  
  const { user, signOut } = useAuth();
  const { settings } = useSettings();
  const { results, isLoading, error, progress, videoPreview, analyze, analyzeWithProgress, clearResults } = useAnalysis();
  const { history, removeFromHistory, clearHistory } = useAnalysisHistory();

  const [showVideoSelection, setShowVideoSelection] = useState(false);
  const [channelVideos, setChannelVideos] = useState<ChannelVideo[]>([]);
  const [channelName, setChannelName] = useState("");
  const [fetchingVideos, setFetchingVideos] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);
  const [channelErrorCode, setChannelErrorCode] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading || fetchingVideos) return;

    if (activeMode === "channel") {
      // For channel mode, fetch videos first
      setFetchingVideos(true);
      setChannelError(null);
      setChannelErrorCode(null);
      
      try {
        const response = await apiClient.getChannelVideos({
          channel_url: searchQuery,
          max_results: 20,
        });
        
        setChannelVideos(response.videos);
        setChannelName(response.channel_name);
        setShowVideoSelection(true);
      } catch (err) {
        if (err instanceof APIError && err.code === "CHANNEL_NO_VIDEOS") {
          setChannelErrorCode(err.code);
          setChannelError("This channel has no public videos available to analyze.");
        } else {
          if (err instanceof APIError && err.code) {
            setChannelErrorCode(err.code);
          }
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch channel videos";
          setChannelError(errorMessage);
        }
      } finally {
        setFetchingVideos(false);
      }
    } else {
      // For video mode, use streaming analysis with progress
      setView("results");
      
      await analyzeWithProgress({
        youtube_url: searchQuery,
        max_comments: settings.max_comments,
        analysis_type: activeMode,
      });
    }
  };

  const handleVideoSelectionAnalyze = async (selectedVideoIds: string[]) => {
    // Find the selected videos
    const selectedVideos = channelVideos.filter(v => selectedVideoIds.includes(v.video_id));
    
    if (selectedVideos.length === 0) return;

    setShowVideoSelection(false);

    try {
      // Build URLs for all selected videos
      const videoUrls = selectedVideos.map(v => `https://youtube.com/watch?v=${v.video_id}`);
      
      await analyze({
        youtube_urls: videoUrls,
        max_comments: 100, // Max 100 comments per video for channel analysis
        analysis_type: "channel",
      });

      setView("results");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed";
      console.error(errorMessage);
    }
  };

  const handleCancelVideoSelection = () => {
    setShowVideoSelection(false);
    setChannelVideos([]);
    setChannelName("");
  };

  const handleResetChannelInput = () => {
    setChannelError(null);
    setChannelErrorCode(null);
    setSearchQuery("");
  };

  const handleHistorySelect = (item: AnalysisHistoryItem) => {
    setSearchQuery(item.url);
    setActiveMode(item.analysis_type);
    setShowHistory(false);
    
    analyze({
      youtube_url: item.url,
      max_comments: settings.max_comments,
      analysis_type: item.analysis_type,
    }).then(() => {
      setView("results");
    });
  };

  const handleBackToInput = () => {
    setView("input");
    clearResults();
    setSearchQuery("");
  };

  const tags = activeMode === "channel" 
    ? ["Growth", "Engagement", "Demographics", "Top Videos"]
    : ["Retention", "SEO", "Click-Through", "Comments"];

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-red-500/30">
      {/* Sidebar (Desktop) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl hidden lg:flex flex-col p-6 z-30">
        <div className="mb-10">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-red-500 transition-colors">
            TUBEINSIGHT
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <Button 
            className={`w-full justify-start gap-3 !bg-transparent ${view === "input" ? "!bg-white/5 text-white hover:!bg-white/10" : "text-white/50 hover:text-white hover:!bg-white/5"}`}
            onClick={() => setView("input")}
          >
            <LayoutDashboard size={18} />
            Overview
          </Button>
          <Button 
            className="w-full justify-start gap-3 !bg-transparent text-white/50 hover:text-white hover:!bg-white/5"
            onClick={() => setShowHistory(true)}
          >
            <History size={18} />
            History
          </Button>
          <Button 
            className="w-full justify-start gap-3 !bg-transparent text-white/50 hover:text-white hover:!bg-white/5"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
            Settings
          </Button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate">{user?.email || "User Account"}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Early Access</span>
            </div>
          </div>
            <Button onClick={signOut} className="w-full justify-start gap-3 bg-transparent text-red-500/70 hover:text-red-500 hover:bg-red-500/10">
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 flex flex-col min-h-screen px-4 md:px-8 py-10 relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {view === "input" ? (
          /* Input View */
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-3xl flex flex-col items-center gap-12">
              {/* Header & Modes */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex bg-zinc-900/80 p-1 rounded-full border border-white/5 backdrop-blur-md">
                  <button
                    onClick={() => setActiveMode("channel")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeMode === "channel" 
                        ? "bg-white text-black shadow-lg" 
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <UserIcon size={16} />
                    Channel
                  </button>
                  <button
                    onClick={() => setActiveMode("video")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeMode === "video" 
                        ? "bg-white text-black shadow-lg" 
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Tv size={16} />
                    Video
                  </button>
                </div>
                <h1 className="text-3xl md:text-5xl font-normal text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  {activeMode === "channel" 
                    ? "Analyze any YouTube Channel" 
                    : "Deep dive into any Video"}
                </h1>
              </div>

              {/* Search Bar */}
              <div className="w-full relative group">
                <form 
                  onSubmit={handleSearch}
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-[32px] p-2 pr-4 shadow-2xl focus-within:border-white/20 transition-all duration-300 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-2 p-4">
                    <textarea
                      placeholder={activeMode === "channel" ? "Paste Channel URL or handle..." : "Paste Video URL..."}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 focus-visible:ring-0 text-lg resize-none min-h-[60px] max-h-[200px] placeholder:text-white/20 scrollbar-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      rows={1}
                      disabled={isLoading}
                    />
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Button type="button" className="h-9 rounded-full px-3 bg-transparent gap-2 text-white/50 hover:text-white hover:bg-white/5">
                          <Paperclip size={16} />
                          Attach
                        </Button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-xs">
                          <Globe size={14} />
                          <span>Max: {settings.max_comments} comments</span>
                        </div>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!searchQuery.trim() || isLoading || fetchingVideos}
                      >
                        {isLoading || fetchingVideos ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <ArrowUp size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Error Display */}
              {error && (
                <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Channel Error Display */}
              {channelError && (
                <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="text-red-300 text-sm font-semibold">
                        {channelErrorCode === "CHANNEL_NO_VIDEOS" ? "No videos available for this channel" : "Could not fetch channel videos"}
                      </h3>
                      <p className="text-red-200/90 text-sm">{channelError}</p>
                      {channelErrorCode === "CHANNEL_NO_VIDEOS" && (
                        <p className="text-red-100/80 text-xs">
                          Try a different channel URL, or switch to Video mode and analyze a specific video URL directly.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={handleResetChannelInput}
                      className="h-8 px-3 bg-transparent text-xs text-red-100 hover:text-white hover:bg-red-500/20 border border-red-500/30"
                    >
                      Try another channel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setActiveMode("video");
                        setChannelError(null);
                        setChannelErrorCode(null);
                      }}
                      className="h-8 px-3 bg-transparent text-xs text-red-100 hover:text-white hover:bg-red-500/20 border border-red-500/30"
                    >
                      Switch to Video mode
                    </Button>
                  </div>
                </div>
              )}

              {/* Suggested Tags */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {tags.map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery("")}
                    className="px-5 py-2.5 rounded-full border border-white/5 bg-zinc-900/40 text-white/70 text-sm hover:border-white/20 hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Search size={14} className="opacity-40" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="w-full max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                onClick={handleBackToInput}
                className="bg-transparent text-white/50 hover:text-white hover:bg-white/5 -ml-4"
                disabled={isLoading && progress.stage !== 'error'}
              >
                <ChevronLeft size={18} className="mr-1" />
                Back to Search
              </Button>
            </div>

            {/* Show Progress when loading */}
            {isLoading && progress.stage !== 'idle' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AnalysisProgress progress={progress} videoPreview={videoPreview} />
              </div>
            )}

            {/* Show error state with retry option */}
            {!isLoading && progress.stage === 'error' && !results && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AnalysisProgress progress={progress} videoPreview={videoPreview} />
                <Button
                  onClick={() => setView("input")}
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Analysis Results */}
            {!isLoading && results && <AnalysisResults results={results} />}

            {/* AI Chat */}
            {!isLoading && results && (
              <AIChatPanel
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                onOpen={() => setShowChat(true)}
                videoTitle={results.video_metadata.title}
              />
            )}
          </div>
        )}
      </main>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* History Panel */}
      <HistoryPanel 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
        onDelete={removeFromHistory}
      />

      {/* Video Selection Panel */}
      {showVideoSelection && (
        <VideoSelectionPanel
          videos={channelVideos}
          channelName={channelName}
          onAnalyze={handleVideoSelectionAnalyze}
          onCancel={handleCancelVideoSelection}
          isLoading={isLoading}
        />
      )}
      <div className="fixed inset-0 pointer-events-none -z-20 opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`}}></div>
    </div>
  );
};

export default Dashboard;
