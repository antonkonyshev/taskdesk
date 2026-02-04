"""
Tasks management related URL routing rules.
"""

from django.urls import path, re_path
from django.contrib.auth.decorators import login_required

from tasks.views import TasksWebApp, TasksExportView

urlpatterns = [
    path("export/", login_required(TasksExportView.as_view()),
         name="tasks_export"),
    re_path(r"^(?P<__>.*)?$", TasksWebApp.as_view(), name="tasks_webapp"),
]