"""
News feed serializers for HTTP API.
"""

from typing import Optional
from pydantic import BaseModel

from news.models import UserFeed


class FeedData(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = ''
    url: str = None

    @classmethod
    def from_user_feed(cls, userfeed: UserFeed) -> 'FeedData':
        return cls(id=userfeed.feed_id, title=userfeed.title,
                   url=userfeed.feed.url)