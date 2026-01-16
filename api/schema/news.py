"""
News serializers for HTTP API.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel


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