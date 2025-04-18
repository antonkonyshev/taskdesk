import os.path as op
import shutil

from asgiref.sync import async_to_sync
from django.utils import timezone

from tasklib import Task

from TaskDesk.basetestcase import BaseTestCase
from tdauth.models import User
from tasks.storage import TaskStorage


class TaskStorageTestCase(BaseTestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="123456")
        self.user.is_active = True
        self.user.save()
        shutil.rmtree(self.user.task_db_path, ignore_errors=True)
        self.storage = async_to_sync(TaskStorage(self.user.task_db_path).load)()
        return super().setUp()

    def test_task_creation(self):
        task = self.storage.create_task(description = "testing task")
        task.save()
        tasks = self.storage.tasks.pending()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]['description'], "testing task")
        self.assertEqual(tasks[0]['entry'].date(), timezone.now().date())

    def test_task_modification(self):
        task = self.storage.create_task(description = "testing task")
        task.save()
        task = self.storage.tasks.get(uuid=task['uuid'])
        task['description'] = "another testing task"
        task.save()
        tasks = self.storage.tasks.pending()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]['description'], "another testing task")
        self.assertEqual(tasks[0]['entry'].date(), timezone.now().date())
        self.assertEqual(tasks[0]['modified'].date(), timezone.now().date())

    def test_task_removing(self):
        task = self.storage.create_task(description = "testing task")
        task.save()
        task = self.storage.tasks.get(uuid=task['uuid'])
        task.delete()
        self.assertEqual(len(self.storage.tasks.pending()), 0)
        tasks = self.storage.tasks.deleted()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]['modified'].date(), timezone.now().date())
        self.assertEqual(tasks[0]['end'].date(), timezone.now().date())
        self.assertEqual(tasks[0]['status'], 'deleted')

    def test_task_completion(self):
        task = self.storage.create_task(description = "testing task")
        task.save()
        task = self.storage.tasks.get(uuid=task['uuid'])
        task.done()
        self.assertEqual(len(self.storage.tasks.pending()), 0)
        tasks = self.storage.tasks.completed()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]['status'], 'completed')
        self.assertEqual(tasks[0]['end'].date(), timezone.now().date())
        self.assertEqual(tasks[0]['modified'].date(), timezone.now().date())

    def test_task_patch(self):
        task = self.storage.create_task(description = "testing task")
        task.save()
        task = self.storage.patch_task(uuid=task['uuid'], description="modified testing task")
        tasks = self.storage.tasks.pending()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]['description'], "modified testing task")
        self.assertEqual(tasks[0]['entry'].date(), timezone.now().date())
        self.assertEqual(tasks[0]['modified'].date(), timezone.now().date())