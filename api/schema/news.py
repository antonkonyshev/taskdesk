"""
News serializers for HTTP API.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from django.forms.models import model_to_dict
from django.db.models import QuerySet

from news.models import News


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