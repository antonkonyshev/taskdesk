"""
API related controllers.
"""

from json import JSONDecodeError
from fastapi import (
    APIRouter, WebSocket, WebSocketDisconnect, Cookie, HTTPException, Depends,
    WebSocketException, status
)

from tasks.storage import TaskStorage
from api.schemas import TaskData, TaskQueryParams
from django.contrib.sessions.models import Session
from django.utils import timezone
from tdauth.models import User


class TaskStorageLoader:
    """
    Authentication based on django sessions and taskwarrior database loading
    for an authenticated user.
    """

    def __init__(self, wsproto = False):
        self.wsproto = wsproto

    async def authentificate(self, sessionid: str) -> User:
        try:
            session = await Session.objects.aget(session_key=sessionid)
            if timezone.now() <= session.expire_date:
                return await User.objects.aget(
                    id = session.get_decoded().get("_auth_user_id"))
        except Exception as err:
            # TODO: add logging
            pass
        if self.wsproto:
            raise WebSocketException(code = status.WS_1008_POLICY_VIOLATION)
        else:
            raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED)
    
    async def __call__(self, sessionid: str = Cookie("sessionid")) -> TaskStorage:
        user = await self.authentificate(sessionid)
        try:
            return await TaskStorage(user.task_db_path).load()
        except Exception as err:
            if self.wsproto:
                raise WebSocketException(code = status.WS_1011_INTERNAL_ERROR)
            else:
                raise HTTPException(status_code = 500)

api_router = APIRouter(redirect_slashes=True)

@api_router.websocket("/task/{task_uuid}/")
async def task_updating(
    socket: WebSocket,
    task_uuid: str,
    storage: TaskStorage = Depends(TaskStorageLoader(wsproto=True)),
):
    """
    The endpoint responsible for tasks data editing.
    """
    try:
        await socket.accept()
        while True:
            try:
                data = await socket.receive_json()
                if data.get('uuid', None) == task_uuid:
                    task = storage.tasks.filter(uuid=data.get('uuid', None))[0]
                    modified = False
                    for field, value in data.items():
                        if field == 'uuid':
                            continue
                        if task[field] != value:
                            task[field] = value
                            modified = True
                    if modified:
                        task.save()
            except IndexError:
                raise WebSocketException(code = status.WS_1011_INTERNAL_ERROR)
            except JSONDecodeError:
                # TODO: add logging
                raise WebSocketException(code = status.WS_1003_UNSUPPORTED_DATA)
    except WebSocketDisconnect:
        pass

@api_router.get("/task/", response_model=list[TaskData])
async def tasks_list(
    storage: TaskStorage = Depends(TaskStorageLoader()),
    params: TaskQueryParams = Depends(),
):
    """
    The endpoint responds with all user tasks list.

    Note: the pagination isn't used here deliberately, since the tasklib
    loads all tasks at once anyway and the user expects to see all the
    tasks at once, so the pagination would only lead to excess IO operations.
    """
    tasks = [TaskData.from_task(task) for task in storage.active()]
    tasks.sort(key = lambda elem: getattr(elem, params.ordering, None),
        reverse = params.descending)
    return tasks

@api_router.delete("/task/{task_uuid}/", status_code=status.HTTP_204_NO_CONTENT)
async def task_delete(
    task_uuid: str, storage: TaskStorage = Depends(TaskStorageLoader())
):
    """
    The endpoint responsible for tasks removing.
    """
    try:
        task = storage.tasks.filter(uuid = task_uuid)[0]
        task.delete()
        task.save()
    except IndexError:
        raise HTTPException(status_code = status.HTTP_204_NO_CONTENT)
    except Exception as err:
        # TODO: logging
        raise HTTPException(status_code = status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_router.post("/task/{task_uuid}/", status_code=status.HTTP_200_OK)
async def task_patch(
    task_uuid: str, storage: TaskStorage = Depends(TaskStorageLoader())
):
    """
    The endpoint responsible for marking tasks as completed.
    """
    try:
        task = storage.tasks.filter(uuid = task_uuid)[0]
        task.done()
        task.save()
    except IndexError:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND)
    except Exception as err:
        # TODO: logging
        raise HTTPException(status_code = status.HTTP_500_INTERNAL_SERVER_ERROR)