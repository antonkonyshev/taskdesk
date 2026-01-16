"""
News filter serializers for HTTP API.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel

from news.models import Filter


class WordPartData(str, Enum):
    start = "start"
    end = "end"
    full = "full"
    part = "part"


class FilterData(BaseModel):
    id: Optional[int] = None
    entry: str = None
    part: WordPartData = "start"
    feed_id: Optional[int] = None
    
    @classmethod
    def from_filter(cls, filter: Filter) -> 'FilterData':
        return cls(id=filter.id, entry=filter.entry, part=filter.part,
                   feed_id=filter.feed_id)