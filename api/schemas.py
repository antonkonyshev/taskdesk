"""
API related serializers.
"""

from typing import Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from tasklib import Task


class AnnotationData(BaseModel):
    entry: Optional[datetime] = None
    description: Optional[str] = None

class TaskData(BaseModel):
    id: Optional[int] = None
    description: Optional[str] = None
    urgency: Optional[float] = None
    project: Optional[str] = None
    tags: Optional[set[str]] = None
    entry: Optional[datetime] = None
    modified: Optional[datetime] = None
    due: Optional[datetime] = None
    wait: Optional[datetime] = None
    depends: Optional[set[str]] = None
    status: Optional[str] = None
    uuid: Optional[str] = None
    annotations: Optional[list[AnnotationData]] = None

    @classmethod
    def from_task(cls, task: Task):
        task_dict = task._data.copy()
        task_dict['depends'] = set(
            dep['uuid'] for dep in task_dict.get('depends', []))
        task_dict['annotations'] = [
            annotation._data for annotation in task_dict.get('annotations', [])]
        task_dict['annotations'].sort(
            key = lambda anno: anno.get('entry', None), reverse = True)
        return cls(**task_dict)


class TaskOrdering(str, Enum):
    urgency = "urgency"
    entry = "entry"
    project = "project"
    id = "id"
    description = "description"


class TaskQueryParams(BaseModel):
    ordering: TaskOrdering = TaskOrdering.urgency
    descending: bool = True