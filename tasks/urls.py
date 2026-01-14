"""
Tasks management related URL routing rules.
"""

from django.urls import path

from tasks.views import TasksWebApp

urlpatterns = [
    path("", TasksWebApp.as_view(), name="tasks_webapp"),
]