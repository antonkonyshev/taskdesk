"""
Serialization and deserialization logic for news feeds.
"""

from typing import Tuple
import time
from datetime import datetime

from django.utils import timezone

from news.models import Feed, News
from feedparser import FeedParserDict


class FeedEntry:
    """Convertion of news feed entries into ORM model instances."""
    def __init__(self, entry: FeedParserDict):
        self.entry = entry

    def _attr_with_fallbacks(self, *args, default='', max_length=1024):
        for field in args:
            value = self.entry.get(field, None)
            if value:
                return value[:max_length] if isinstance(value, str) else value
        return default[:max_length] if isinstance(default, str) else default

    def _altlink(self, max_length=256) -> str | None:
        try:
            return [link.get('href', '') for link in
                    self._attr_with_fallbacks('links', default=[])
                    if 'html' in link.get('type', '') and
                    link.get('href', '')][0][:max_length]
        except IndexError:
            return

    def _enclosure(self) -> Tuple[str, str] | None:
        try:
            return [(link.get('type', ''), link.get('href', ''),)
                    for link in self._attr_with_fallbacks('links', default=[])
                    if link.get('type', '').startswith('image') and
                    link.get('href', None)][0]
        except IndexError:
            return

    def to_news(self, feed: int | Feed | None = None) -> News | None:
        """Creates news instance from a parsed news feed entry."""
        guid = self._attr_with_fallbacks('guid', 'id', 'link', default='')[32:]
        if not guid:
            return
        if feed and News.objects.by_feed_guid(feed, guid).exists():
            return

        news = News({'feed' if isinstance(feed, Feed) else 'feed_id': feed,
                     'guid': guid})
        news.title = self._attr_with_fallbacks(
            'title', 'summary', 'description', max_length=128)
        if not news.title:
            return
        news.description = self._attr_with_fallbacks('description', 'summary',
                                                     max_length=1024)
        news.author = self._attr_with_fallbacks('author', max_length=32)
        news.link = self._attr_with_fallbacks('link', max_length=256)
        if not news.link:
            news.link = self._altlink()
        if not news.link:
            return
        enclosures = self._enclosure()
        if enclosures:
            news.enclosure_url = enclosures[1][:256]
            news.enclosure_type = enclosures[0][:32]
        try:
            news.published = datetime.fromtimestamp(time.mktime(
                self._attr_with_fallbacks('published_parsed', default=None)))
        except Exception:
            try:
                news.published = datetime(
                    *self._attr_with_fallbacks('published_parsed', [])[:6])
            except Exception:
                news.published = timezone.now()
        if not news.published.tzinfo:
            news.published = news.published.replace(
                tzinfo=timezone.now().tzinfo)
        return news