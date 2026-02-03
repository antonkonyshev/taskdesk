"""
Tasks management related views.
"""

from django.views.generic.base import TemplateView, View
from django.http import HttpResponse

from tasks.storage import TaskStorage


class TasksWebApp(TemplateView):
    template_name = "tasks/tasks_webapp.html"


class TasksExportView(View):
    """Exports user tasks in JSON format."""
    
    async def get(self, request, *args, **kwargs):
        storage = await TaskStorage((await request.auser()).task_db_path).load()
        content = '\n'.join([
            task._data.get('description', '') for task in \
                storage.active() if task._data.get('description', '')]) \
        if request.GET.get('plain', '') else \
            ''.join(['[', 
                ','.join([task.export_data() for task in storage.active()]),
            ']'])
        return HttpResponse(content=content, content_type="application/json")