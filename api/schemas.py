"""
API related serializers.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from tasklib import Task


class TaskData(BaseModel):
    id: Optional[int] = None
    description: Optional[str] = None
    urgency: Optional[float] = None
    project: Optional[str] = None
    tags: Optional[set[str]] = None
    entry: Optional[datetime] = None
    modified: Optional[datetime] = None
    due: Optional[datetime] = None
    depends: Optional[set[str]] = None
    status: Optional[str] = None
    uuid: Optional[str] = None

    @classmethod
    def from_task(cls, task: Task):
        task_dict = task._data.copy()
        task_dict['depends'] = set(
            dep['uuid'] for dep in task_dict.get('depends', []))
        return cls(**task_dict)
