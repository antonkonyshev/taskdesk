"""
API related controllers.
"""

from fastapi import APIRouter, Request, Cookie, HTTPException, Depends

from tasks.storage import TaskStorage
from api.schemas import TaskData
from django.contrib.sessions.models import Session
from tdauth.models import User


async def authenticate(sessionid: str = Cookie("sessionid")) -> User:
    try:
        return await User.objects.aget(id = (await Session.objects.aget(
            session_key=sessionid)).get_decoded().get("_auth_user_id"))
    except Exception as err:
        # TODO: add logging
        raise HTTPException(status_code=401)

async def load_task_storage(user: User = Depends(authenticate)) -> TaskStorage:
    try:
        return await TaskStorage(user.task_db_path).load()
    except Exception as err:
        import ipdb; ipdb.set_trace()
        raise HTTPException(status_code=500)

api_router = APIRouter()

@api_router.get("/task", response_model=list[TaskData])
async def tasks_list(storage: TaskStorage = Depends(load_task_storage)):
    return [TaskData.from_task(task) for task in storage.tasks.all()]
