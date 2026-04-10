"""
backend/core/youtube_client.py
───────────────────────────────
YouTube Data API v3 wrapper.
Handles channel resolution, video listing, and comment fetching
with built-in rate-limit handling and retry logic.
"""
print(f"[LOADING] {__file__}")

import re
import json
from pathlib import Path
from typing import Optional, List, Dict
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from config.settings import get_settings


settings = get_settings()


class ChannelHasNoVideosError(ValueError):
    """Raised when a valid channel has no videos available for analysis."""


class YouTubeClient:
    """
    YouTube Data API v3 wrapper with built-in error handling.

    Features:
    - URL parsing for videos, channels, and handles
    - Automatic retry with exponential backoff
    - Comment caching to disk
    - Graceful handling of disabled comments

    Raises:
        ValueError: If YOUTUBE_API_KEY is not configured
    """

    def __init__(self) -> None:
        # Validate API key early to provide clear error messages
        if not settings.youtube_api_key:
            raise ValueError(
                "YOUTUBE_API_KEY is not configured. "
                "Please set it in your .env file or environment variables."
            )

        # Check for placeholder values
        if settings.youtube_api_key.startswith("your_") or settings.youtube_api_key == "":
            raise ValueError(
                "Please set a valid API key in your .env file."
            )

        self.service = build("youtube", "v3", developerKey=settings.youtube_api_key)
        self.raw_dir = Path(settings.raw_data_dir)
        self.raw_dir.mkdir(parents=True, exist_ok=True)

    # ─── URL Parsing ──────────────────────────────────────────────────────────

    def extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract video ID from any YouTube URL format.

        Supports:
        - youtube.com/watch?v=...
        - youtu.be/...
        - youtube.com/embed/...
        - youtube.com/shorts/...

        Args:
            url: YouTube URL in any supported format

        Returns:
            11-character video ID or None if not found
        """
        patterns = [
            r"(?:v=|youtu\.be/|embed/|v/|shorts/)([a-zA-Z0-9_-]{11})",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def extract_channel_id(self, url: str) -> Optional[str]:
        """
        Resolve channel URL to a channel ID.

        Supports:
        - youtube.com/@handle format
        - youtube.com/channel/UC... format

        Args:
            url: YouTube channel URL

        Returns:
            Channel ID (UC...) or None if not found
        """
        # Handle @handle format
        handle_match = re.search(r"@([\w.-]+)", url)
        if handle_match:
            handle = handle_match.group(1)
            return self._resolve_handle(handle)

        # Handle /channel/UC... format
        channel_match = re.search(r"/channel/(UC[\w-]+)", url)
        if channel_match:
            return channel_match.group(1)

        return None

    def _resolve_handle(self, handle: str) -> Optional[str]:
        """Resolve a @handle to a channel ID via the API."""
        try:
            response = self.service.channels().list(
                part="id", forHandle=handle
            ).execute()
            items = response.get("items", [])
            return items[0]["id"] if items else None
        except HttpError as e:
            logger.error(f"Failed to resolve handle @{handle}: {e}")
            return None

    # ─── Video Fetching ───────────────────────────────────────────────────────

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get_channel_videos(self, channel_id: str, max_results: Optional[int] = None) -> List[Dict]:
        """
        Fetch the latest N videos from a channel.

        Args:
            channel_id: YouTube channel ID (UC...)
            max_results: Maximum videos to fetch (default from settings)

        Returns:
            List of video dicts with keys: video_id, title, published_at,
            thumbnail, channel_id, channel_name

        Raises:
            ValueError: If channel not found
            HttpError: On API errors (after 3 retries)
        """
        max_results = max_results or settings.max_videos_per_channel
        logger.info(f"Fetching latest {max_results} videos for channel {channel_id}")

        try:
            # Get uploads playlist ID
            channel_response = self.service.channels().list(
                part="contentDetails,snippet",
                id=channel_id
            ).execute()

            if not channel_response.get("items"):
                raise ValueError(f"Channel {channel_id} not found")

            channel_data = channel_response["items"][0]
            uploads_playlist = channel_data["contentDetails"]["relatedPlaylists"]["uploads"]
            channel_name = channel_data["snippet"]["title"]

            # Fetch videos from uploads playlist
            videos = []
            next_page_token = None

            while len(videos) < max_results:
                playlist_response = self.service.playlistItems().list(
                    part="snippet,contentDetails",
                    playlistId=uploads_playlist,
                    maxResults=min(50, max_results - len(videos)),
                    pageToken=next_page_token
                ).execute()

                for item in playlist_response.get("items", []):
                    videos.append({
                        "video_id": item["contentDetails"]["videoId"],
                        "title": item["snippet"]["title"],
                        "published_at": item["snippet"]["publishedAt"],
                        "thumbnail": item["snippet"]["thumbnails"].get("high", {}).get("url"),
                        "channel_id": channel_id,
                        "channel_name": channel_name,
                    })

                next_page_token = playlist_response.get("nextPageToken")
                if not next_page_token:
                    break

            if not videos:
                raise ChannelHasNoVideosError(
                    f"Channel '{channel_name}' has no public videos available for analysis."
                )

            logger.success(f"Found {len(videos)} videos for {channel_name}")
            return videos[:max_results]

        except HttpError as e:
            logger.error(f"YouTube API error: {e}")
            raise

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get_video_metadata(self, video_id: str) -> Dict:
        """
        Fetch metadata for a single video.

        Args:
            video_id: YouTube video ID (11 characters)

        Returns:
            Dict with keys: video_id, title, description, channel_id,
            channel_name, published_at, thumbnail, view_count, like_count,
            comment_count, url

        Raises:
            ValueError: If video not found
        """
        response = self.service.videos().list(
            part="snippet,statistics,contentDetails",
            id=video_id
        ).execute()

        if not response.get("items"):
            raise ValueError(f"Video {video_id} not found")

        item = response["items"][0]
        snippet = item["snippet"]
        stats = item.get("statistics", {})

        return {
            "video_id": video_id,
            "title": snippet["title"],
            "description": snippet["description"][:1000],  # Truncate long descriptions
            "channel_id": snippet["channelId"],
            "channel_name": snippet["channelTitle"],
            "published_at": snippet["publishedAt"],
            "thumbnail": snippet["thumbnails"].get("high", {}).get("url"),
            "view_count": int(stats.get("viewCount", 0)),
            "like_count": int(stats.get("likeCount", 0)),
            "comment_count": int(stats.get("commentCount", 0)),
            "url": f"https://youtube.com/watch?v={video_id}",
        }

    def get_channel_details(self, channel_id: str) -> Dict:
        """
        Fetch channel details including subscriber count.

        Args:
            channel_id: YouTube channel ID (UC...)

        Returns:
            Dict with keys: channel_id, channel_name, subscriber_count,
            video_count, view_count
        """
        try:
            response = self.service.channels().list(
                part="snippet,statistics",
                id=channel_id
            ).execute()

            if not response.get("items"):
                return {
                    "channel_id": channel_id,
                    "channel_name": "Unknown",
                    "subscriber_count": 0,
                    "video_count": 0,
                    "view_count": 0,
                }

            item = response["items"][0]
            snippet = item["snippet"]
            stats = item.get("statistics", {})

            return {
                "channel_id": channel_id,
                "channel_name": snippet["title"],
                "subscriber_count": int(stats.get("subscriberCount", 0)),
                "video_count": int(stats.get("videoCount", 0)),
                "view_count": int(stats.get("viewCount", 0)),
            }
        except HttpError as e:
            logger.error(f"Failed to fetch channel details: {e}")
            return {
                "channel_id": channel_id,
                "channel_name": "Unknown",
                "subscriber_count": 0,
                "video_count": 0,
                "view_count": 0,
            }

    # ─── Comment Fetching ─────────────────────────────────────────────────────

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get_video_comments(self, video_id: str, max_comments: Optional[int] = None) -> List[Dict]:
        """
        Fetch top-level comments for a video.

        Args:
            video_id: YouTube video ID
            max_comments: Maximum comments to fetch (default from settings)

        Returns:
            List of comment dicts with keys: comment_id, video_id, text,
            author, like_count, published_at, reply_count.
            Returns empty list if comments are disabled.

        Raises:
            HttpError: On API errors other than 403 (comments disabled)
        """
        max_comments = max_comments or settings.max_comments_per_video
        logger.info(f"Fetching up to {max_comments} comments for video {video_id}")

        comments = []
        next_page_token = None

        try:
            while len(comments) < max_comments:
                response = self.service.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    maxResults=min(100, max_comments - len(comments)),
                    order="relevance",
                    pageToken=next_page_token,
                    textFormat="plainText"
                ).execute()

                for item in response.get("items", []):
                    top = item["snippet"]["topLevelComment"]["snippet"]
                    comments.append({
                        "comment_id": item["id"],
                        "video_id": video_id,
                        "text": top["textDisplay"],
                        "author": top["authorDisplayName"],
                        "like_count": top.get("likeCount", 0),
                        "published_at": top["publishedAt"],
                        "reply_count": item["snippet"].get("totalReplyCount", 0),
                    })

                next_page_token = response.get("nextPageToken")
                if not next_page_token:
                    break

            logger.success(f"Fetched {len(comments)} comments for {video_id}")

            # Cache raw data
            cache_path = self.raw_dir / f"{video_id}_comments.json"
            cache_path.write_text(json.dumps(comments, indent=2))

            return comments

        except HttpError as e:
            if e.resp.status == 403:
                logger.warning(f"Comments disabled for video {video_id}")
                return []
            raise
