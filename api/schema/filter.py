"""
News filter serializers for HTTP API.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel


class WordPartData(str, Enum):
    start = "start"
    end = "end"
    full = "full"
    part = "part"


class FilterData(BaseModel):
    id: Optional[int] = None
    entry: Optional[str] = None
    part: Optional[WordPartData] = "start"
    feed: Optional[int] = None
    