"""
Celery tasks related utils shared amoung project applications.
"""

import logging
import asyncio
from asgiref.sync import sync_to_async

from django.conf import settings
from celery.app.task import Task


logger = logging.getLogger("task")


def atask(task, *args, **kwargs):
    """
    Requests a celery task execution by sending a message to a message queue.
    """
    try:
        if getattr(settings, "EAGER_ATASKS", False):
            # In the minimal production deployment we don't have a celery
            # workers pool and message queue, so we need to run the
            # tasks within the application process context. In the asynchronous
            # context we add the task to the event loop, in the synchronous -
            # we just execute the task as a usual function.
            try:
                loop = asyncio.get_running_loop()
                if loop:
                    loop.create_task(sync_to_async(task)(*args, **kwargs))
                    return
            except RuntimeError as err:
                if "no running event loop" in str(err):
                    task(*args,**kwargs)
                else:
                    raise err
            return
        assert isinstance(task, Task), "Provided task instance is invalid"
        options = kwargs.pop('options', {})
        assert isinstance(options, dict), "Invalid task options provided"
        task.apply_async(args=args, kwargs=kwargs, **options)
    except Exception:
        logger.exception(f"Error on celery task request. Task:{task.__name__} "
                         f"args:{str(args)} kwargs:{str(kwargs)}")