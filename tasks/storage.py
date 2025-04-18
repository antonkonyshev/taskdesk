"""
Implementation of interactions with taskwarrior databases.
"""

import aiofiles.os as aos

from tasklib import TaskWarrior, Task


class TaskStorage(TaskWarrior):

    def __init__(self, path: str):
        self.path = path

    async def load(self):
        if not await aos.path.exists(self.path):
            await aos.makedirs(self.path)
        super().__init__(self.path)
        return self

    def active(self):
        return self.tasks.filter(status__not="completed")\
            .filter(status__not="deleted")

    def create_task(self, *args, **kwargs):
        return Task(self, *args, **kwargs)

    def patch_task(self, **kwargs):
        if not kwargs.get('uuid', None):
            raise Task.DoesNotExist
        task = self.tasks.get(uuid=kwargs.get('uuid', None))
        modified = False
        for field, value in kwargs.items():
            if field == 'uuid':
                continue
            if task[field] != value:
                task[field] = value
                modified = True
        if modified:
            task.save()
