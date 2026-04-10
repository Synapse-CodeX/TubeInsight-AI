"""
Test the sentiment and topic agents without YouTube API.
"""
import sys
sys.path.append(".")

import traceback

# Test SentimentAgent
print("--- Testing SentimentAgent ---")
try:
    from backend.agents.sentiment_agent import SentimentAgent
    agent = SentimentAgent()
    print("✓ SentimentAgent initialized")
    
    # Test with sample comments
    sample_comments = [
        {"text": "This video was amazing! I loved the content.", "like_count": 10},
        {"text": "Great work, really helpful tutorial.", "like_count": 5},
        {"text": "Not bad, but could be better.", "like_count": 2},
    ]
    
    # This will fail because no valid API key
    result = agent.run(sample_comments, "Test Video")
    print(f"✓ Sentiment result: {result}")
except Exception as e:
    print(f"✗ SentimentAgent Error: {e}")
    traceback.print_exc()

print("\n--- Testing TopicAgent ---")
try:
    from backend.agents.topic_agent import TopicAgent
    agent = TopicAgent()
    print("✓ TopicAgent initialized")
except Exception as e:
    print(f"✗ TopicAgent Error: {e}")
    traceback.print_exc()

print("\n--- Testing ReportAgent ---")
try:
    from backend.agents.report_agent import ReportAgent
    agent = ReportAgent()
    print("✓ ReportAgent initialized")
except Exception as e:
    print(f"✗ ReportAgent Error: {e}")
    traceback.print_exc()

print("\n--- Testing LLMClient ---")
try:
    from backend.core.llm_client import LLMClient
    llm = LLMClient()
    print("✓ LLMClient initialized")
except Exception as e:
    print(f"✗ LLMClient Error: {e}")
    traceback.print_exc()
