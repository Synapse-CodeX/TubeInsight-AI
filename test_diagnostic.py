"""
Quick diagnostic test for the TubeInsight pipeline.
"""
import sys
sys.path.append(".")

import traceback
from backend.core.youtube_client import YouTubeClient

try:
    yt = YouTubeClient()
    print("✓ YouTubeClient initialized successfully")
    
    # Test extract_video_id
    test_url = "https://youtube.com/watch?v=dQw4w9WgXcQ"
    vid = yt.extract_video_id(test_url)
    print(f"✓ Extracted video ID: {vid}")
    
    # Test extract_channel_id
    test_channel = "https://youtube.com/@MrBeast"
    cid = yt.extract_channel_id(test_channel)
    print(f"✓ Extracted channel ID: {cid}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    traceback.print_exc()

print("\n--- Testing Data Pipeline ---")
try:
    from backend.agents.orchestrator import TubeInsightPipeline
    pipeline = TubeInsightPipeline()
    print("✓ TubeInsightPipeline initialized successfully")
except Exception as e:
    print(f"✗ Pipeline Error: {e}")
    traceback.print_exc()
