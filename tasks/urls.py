"""
Tasks management related URL routing rules.
"""

from django.urls import path
from django.contrib.auth.decorators import login_required

from tasks.views import TasksWebApp, TasksExportView

urlpatterns = [
    path("taskdesk_tasks.json", login_required(TasksExportView.as_view()),
         name="tasks_export"),
    path("", TasksWebApp.as_view(), name="tasks_webapp"),
]