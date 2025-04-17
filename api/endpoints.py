"""
API related controllers.
"""

from json import JSONDecodeError
from fastapi import (
    APIRouter, WebSocket, WebSocketDisconnect, Cookie, HTTPException, Depends
)

from tasks.storage import TaskStorage
from api.schemas import TaskData, TaskQueryParams
from django.contrib.sessions.models import Session
from django.utils import timezone
from tdauth.models import User


async def authenticate(sessionid: str = Cookie("sessionid")) -> User:
    try:
        session = await Session.objects.aget(session_key=sessionid)
        if timezone.now() <= session.expire_date:
            return await User.objects.aget(
                id = session.get_decoded().get("_auth_user_id"))
    except Exception as err:
        # TODO: add logging
        pass
    raise HTTPException(status_code=401)

async def load_task_storage(user: User = Depends(authenticate)) -> TaskStorage:
    try:
        return await TaskStorage(user.task_db_path).load()
    except Exception as err:
        raise HTTPException(status_code=500)

api_router = APIRouter(redirect_slashes=True)

@api_router.get("/task/", response_model=list[TaskData])
async def tasks_list(
    storage: TaskStorage = Depends(load_task_storage),
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

@api_router.websocket("/task/{task_uuid}/")
async def task_updating(
    socket: WebSocket,
    task_uuid: str,
    storage: TaskStorage = Depends(load_task_storage),
):
    try:
        await socket.accept()
        while True:
            try:
                data = await socket.receive_json()
                if data.get('uuid', None) == task_uuid:
                    task = storage.tasks.get(uuid=data.get('uuid', None))
                    modified = False
                    for field, value in data.items():
                        if field == 'uuid':
                            continue
                        if field == 'done' and value and not task.completed:
                            task.done()
                            modified = True
                        if field == 'remove' and value and not task.deleted:
                            task.delete()
                            modified = True
                        if task[field] != value:
                            task[field] = value
                            modified = True
                    if modified:
                        task.save()
            except JSONDecodeError:
                pass  # TODO: add logging
    except WebSocketDisconnect:
        pass