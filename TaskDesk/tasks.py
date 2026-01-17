"""
Celery tasks related utils shared amoung project applications.
"""

from celery.app.task import Task


def atask(task, *args, **kwargs):
    """
    Requests a celery task execution by sending a message to a message queue.
    """
    try:
        assert isinstance(task, Task), "Provided task instance is invalid"
        options = kwargs.pop('options', {})
        assert isinstance(options, dict), "Invalid task options provided"
        task.apply_async(args=args, kwargs=kwargs, **options)
    except Exception as err:
        # TODO: Add logging
        print(err)