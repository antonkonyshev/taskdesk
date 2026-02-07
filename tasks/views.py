"""
Tasks management related views.
"""

from django.views.generic.base import TemplateView, View
from django.http import FileResponse

from tasks.storage import TaskStorage


class TasksWebApp(TemplateView):
    template_name = "tasks/tasks_webapp.html"
    extra_context = { 'navigation_section': 'tasks' }


class TasksExportView(View):
    """Exports user tasks in JSON format."""
    
    async def get(self, request, *args, **kwargs):
        storage = await TaskStorage((await request.auser()).task_db_path).load()
        return FileResponse('\n'.join([
            task._data.get('description', '') for task in storage.active() \
                if task._data.get('description', '')
            ]), as_attachment=True, filename='taskdesk_tasks.txt',
            content_type='text/plain') \
        if request.GET.get('plain', '') else \
        FileResponse(''.join([
            '[', ','.join([task.export_data() for task in storage.active()]), ']'
        ]), as_attachment=True, filename='taskdeks_tasks.json',
        content_type="application/json")