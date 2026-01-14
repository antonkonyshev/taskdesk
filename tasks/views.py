"""
Tasks management related views.
"""

from django.views.generic.base import TemplateView


class TasksWebApp(TemplateView):
    template_name = "tasks/tasks_webapp.html"