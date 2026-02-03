import shutil

from asgiref.sync import async_to_sync
from django.urls import reverse

from TaskDesk.basetestcase import BaseTestCase
from tasks.storage import TaskStorage


class TasksViewsTestCase(BaseTestCase):
    def setUp(self):
        result = super().setUp()
        shutil.rmtree(self.user.task_db_path, ignore_errors=True)
        self.storage = async_to_sync(TaskStorage(self.user.task_db_path).load)()
        return result
    
    def test_tasks_export_not_authenticated(self):
        self.client.logout()
        rsp = self.client.get(reverse('tasks_export'))
        self.assertEqual(rsp.status_code, 302)

    def test_tasks_export_to_json(self):
        self.client.login(username=self.username, password=self.password)
        task = self.storage.create_task(description = "testing task")
        task.save()
        rsp = self.client.get(reverse('tasks_export'))
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp['Content-Type'], 'application/json')
        content = b''.join(rsp.streaming_content).decode('utf-8')
        self.assertIn("testing task", content)
        self.assertIn(task._data.get('uuid'), content)
        self.client.logout()

    def test_tasks_export_to_plain_text(self):
        self.client.login(username=self.username, password=self.password)
        task = self.storage.create_task(description = "testing task")
        task.save()
        rsp = self.client.get(reverse('tasks_export'), query_params={'plain': 'true'})
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp['Content-Type'], 'text/plain')
        self.assertIn("testing task",
                      b''.join(rsp.streaming_content).decode('utf-8'))
        self.client.logout()