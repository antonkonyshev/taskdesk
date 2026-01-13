"""
Instantiation of the TaskDesk project celery application.
"""

import os

from celery import Celery


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TaskDesk.settings")

from django.conf import settings

application = Celery("TaskDesk")
application.config_from_object("django.conf:settings", namespace="CELERY")
application.autodiscover_tasks(lambda: settings.INSTALLED_APPS)