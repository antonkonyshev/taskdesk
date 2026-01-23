import shutil
from asgiref.sync import async_to_sync

from fastapi import WebSocketDisconnect

from tasks.storage import TaskStorage
from api.endpoints.task import tasks_list, task_delete, task_complete
from api.schema.task import TaskQueryParams, TaskData

from .api_testcase import APITestCase


class TaskEndpointsTestCase(APITestCase):
    def setUp(self):
        result = super().setUp()
        shutil.rmtree(self.user.task_db_path, ignore_errors=True)
        self.storage = async_to_sync(TaskStorage(self.user.task_db_path).load)()
        self.task = self.storage.create_task(description = "testing task", priority="H")
        self.task.save()
        self.atask = self.storage.create_task(description = "another testing task")
        self.atask.save()
        return result

    def test_not_authenticated(self):
        rsp = self.client.get("/api/v1/task/")
        self.assertEqual(rsp.status_code, 401)
        rsp = self.client.delete(f"/api/v1/task/{self.task['uuid']}/")
        self.assertEqual(rsp.status_code, 401)
        rsp = self.client.post(f"/api/v1/task/{self.task['uuid']}/")
        self.assertEqual(rsp.status_code, 401)
        session = self.client.websocket_connect(f"/api/v1/ws/task/{self.task['uuid']}/")
        self.assertRaises(WebSocketDisconnect, session.__enter__)

    def test_tasks_list(self):
        tasks = async_to_sync(tasks_list)(
            user = self.user,
            params = TaskQueryParams()
        )
        self.assertEqual(len(tasks), 2)
        self.assertIsInstance(tasks[0], TaskData)
        self.assertEqual(tasks[0].description, "testing task")
        self.assertEqual(tasks[1].description, "another testing task")

    def test_task_completion(self):
        async_to_sync(task_complete)(
            task_uuid = self.atask['uuid'], user = self.user)
        self.assertEqual(len(self.storage.active()), 1)
        self.assertEqual(len(self.storage.tasks.completed()), 1)
        self.assertEqual(len(self.storage.tasks.deleted()), 0)

    def test_task_removing(self):
        async_to_sync(task_delete)(
            task_uuid = self.atask['uuid'], user = self.user)
        self.assertEqual(len(self.storage.active()), 1)
        self.assertEqual(len(self.storage.tasks.completed()), 0)
        self.assertEqual(len(self.storage.tasks.deleted()), 1)