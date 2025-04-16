"""
Implementation of interactions with taskwarrior databases.
"""

import aiofiles.os as aos

from tasklib import TaskWarrior


class TaskStorage(TaskWarrior):

    def __init__(self, path: str):
        self.path = path

    async def load(self):
        if not await aos.path.exists(self.path):
            await aos.makedirs(self.path)
        super().__init__(self.path)
        return self
