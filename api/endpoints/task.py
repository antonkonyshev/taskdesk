"""
Task management HTTP API related controllers.
"""

import logging
from json import JSONDecodeError
from fastapi import (WebSocket, WebSocketDisconnect, HTTPException, Depends,
                     WebSocketException, status)

from tasklib import Task
from tasks.storage import TaskStorage
from tdauth.models import User

from api.schema.task import TaskData, TaskQueryParams
from api.authentication import Authentication
from api.router import TaskDeskAPIRouter


logger = logging.getLogger('api')


class TaskStorageLoader:
    """
    TaskWarrior database loading for an authenticated user.
    """
    def __init__(self, user: User, wsproto = False):
        self.user = user
        self.wsproto = wsproto
    
    async def __call__(self) -> TaskStorage:
        try:
            return await TaskStorage(self.user.task_db_path).load()
        except Exception:
            logger.exception("Error on task storage loading for a user. "
                             f"{str(self.user)}")
            if self.wsproto:
                raise WebSocketException(code = status.WS_1011_INTERNAL_ERROR)
            else:
                raise HTTPException(status_code = 500)


@TaskDeskAPIRouter.websocket("/ws/task/{task_uuid}/")
async def task_updating(
    socket: WebSocket,
    task_uuid: str,
    user: User = Depends(Authentication()),
):
    """
    The endpoint responsible for tasks data editing.
    """
    try:
        storage = await TaskStorageLoader(user=user, wsproto=True)()
        await socket.accept()
        while True:
            try:
                data = await socket.receive_json()
                if data.get('uuid', None) == 'new':
                    task = storage.create_task(**data)
                    await socket.send_text(
                        TaskData.from_task(task).model_dump_json())
                elif data.get('uuid', None) == task_uuid:
                    storage.patch_task(**data)
            except Task.DoesNotExist:
                logger.exception("Error on task data update by request. "
                                 f"User:{str(user)} TUUID:{task_uuid}")
                raise WebSocketException(code = status.WS_1011_INTERNAL_ERROR)
            except JSONDecodeError:
                logger.exception("Error on task data update by request. "
                                 f"User:{str(user)} TUUID:{task_uuid}")
                raise WebSocketException(code = status.WS_1003_UNSUPPORTED_DATA)
    except WebSocketDisconnect:
        pass

@TaskDeskAPIRouter.get("/task/", response_model=list[TaskData])
async def tasks_list(
    user: User = Depends(Authentication()),
    params: TaskQueryParams = Depends(),
):
    """
    The endpoint responds with all user tasks list.

    Note: the pagination isn't used here deliberately, since the tasklib
    loads all tasks at once anyway and the user expects to see all the
    tasks at once, so the pagination would only lead to excess IO operations.
    """
    storage = await TaskStorageLoader(user=user, wsproto=True)()
    tasks = [TaskData.from_task(task) for task in storage.active()]
    tasks.sort(key = lambda elem: getattr(elem, params.ordering, None),
        reverse = params.descending)
    return tasks

@TaskDeskAPIRouter.delete("/task/{task_uuid}/", status_code=status.HTTP_204_NO_CONTENT)
async def task_delete(
    task_uuid: str,
    user: User = Depends(Authentication()),
):
    """
    The endpoint responsible for tasks removing.
    """
    try:
        storage = await TaskStorageLoader(user=user, wsproto=True)()
        task = storage.tasks.filter(uuid = task_uuid)[0]
        task.delete()
        task.save()
    except IndexError:
        raise HTTPException(status_code = status.HTTP_204_NO_CONTENT)
    except Exception as err:
        logger.exception("Error on task delete request processing. "
                         f"User:{str(user)} TUUID:{task_uuid}")
        raise err

@TaskDeskAPIRouter.post("/task/{task_uuid}/", status_code=status.HTTP_200_OK)
async def task_complete(
    task_uuid: str,
    user: User = Depends(Authentication()),
):
    """
    The endpoint responsible for marking tasks as completed.
    """
    try:
        storage = await TaskStorageLoader(user=user, wsproto=True)()
        task = storage.tasks.filter(uuid = task_uuid)[0]
        task.done()
        task.save()
    except IndexError:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND)
    except Exception as err:
        logger.exception("Error on task completion request processing. "
                         f"User:{str(user)} TUUID:{task_uuid}")
        raise err