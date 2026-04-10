"""
backend/agents/report_agent.py
────────────────────────────────
Report Generation Agent.
Synthesizes all analysis results into a polished written report.
"""
print(f"[LOADING] {__file__}")

import json
from typing import Dict, Optional
from loguru import logger

from backend.core.llm_client import LLMClient
from config.prompts import REPORT_SYSTEM, REPORT_USER


class ReportAgent:
    """
    Report generation agent for synthesizing analysis results.

    Takes sentiment analysis and topic clustering results and
    generates a comprehensive, actionable report for creators.

    Falls back to a basic structured report if LLM generation fails.
    """

    def __init__(self) -> None:
        self.llm = LLMClient()

    def run(
        self,
        video_metadata: Dict,
        sentiment: Optional[Dict],
        topics: Optional[Dict],
        total_comments: int,
    ) -> str:
        """
        Generate a polished insight report.

        Args:
            video_metadata: Video info dict with title, url, etc.
            sentiment: Sentiment analysis results (can be None)
            topics: Topic clustering results (can be None)
            total_comments: Total number of comments analyzed

        Returns:
            Markdown-formatted report string
        """
        logger.info(f"ReportAgent: Generating report for '{video_metadata['title']}'")

        # Handle None inputs gracefully
        sentiment = sentiment or {}
        topics = topics or {"topics": []}

        try:
            report = self.llm.complete(
                user_prompt=REPORT_USER.format(
                    video_title=video_metadata["title"],
                    video_url=video_metadata.get("url", ""),
                    total_comments=total_comments,
                    sentiment_data=json.dumps(sentiment, indent=2),
                    topic_data=json.dumps(topics, indent=2),
                ),
                system_prompt=REPORT_SYSTEM,
                max_tokens=10000,  # Large buffer for comprehensive reports
                temperature=0.4,  # Slightly more creative for narrative writing
            )
            logger.success("ReportAgent: Report generated")
            return report
        except Exception as e:
            logger.exception("LLM report generation failed, using fallback")
            return self._generate_fallback_report(video_metadata, sentiment, topics, total_comments)

    def _generate_fallback_report(
        self,
        video_metadata: Dict,
        sentiment: Dict,
        topics: Dict,
        total_comments: int,
    ) -> str:
        """Generate a basic report when LLM is unavailable."""
        overall = sentiment.get("overall_sentiment", "unknown")
        vibe = sentiment.get("vibe_score", "N/A")
        topic_list = topics.get("topics", [])
        topic_names = [t.get("label", f"Theme {i+1}") for i, t in enumerate(topic_list[:5])]

        return f"""# Video Analysis Report: {video_metadata['title']}

## Executive Summary
This video received **{overall}** sentiment with a vibe score of **{vibe}/10**.
Analyzed {total_comments} comments.

## Sentiment Overview
- Overall: {overall.capitalize() if isinstance(overall, str) else overall}
- Vibe Score: {vibe}/10
- Likeness Score: {sentiment.get('likeness_score', 'N/A')}/10
- Comments Analyzed: {sentiment.get('comments_analyzed', total_comments)}

## Key Themes Identified
{chr(10).join(f"- {name}" for name in topic_names) if topic_names else "- No specific themes identified"}

## Notes
*This is a basic automated report. Full AI-generated insights are temporarily unavailable.*
"""
