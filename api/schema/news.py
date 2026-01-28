"""
News serializers for HTTP API.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from enum import Enum


class NewsData(BaseModel):
    id: int
    feed: int
    guid: str
    title: str
    description: Optional[str] = None
    link: str
    author: Optional[str] = None
    enclosure_url: Optional[str] = None
    enclosure_type: Optional[str] = None
    published: datetime

    model_config = ConfigDict(from_attributes=True)


class NewsRequest(str, Enum):
    unread = "unread"
    hide = "hide"
    bookmark = "bookmark"
    reading = "reading"
    hidden = "hidden"
    fetch = "fetch"
    feed = "feed"


class NewsQuery(BaseModel):
    request: NewsRequest
    id: Optional[int] = None


class NewsMeta(BaseModel):
    id: str = "meta"
    unread: int = 0
    reading: int = 0