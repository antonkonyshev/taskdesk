"""
A management Django command which provides an entrypoint for execution of
feeds parsing and news filtering tasks from shell.
"""

from django.core.management.base import BaseCommand
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from TaskDesk.tasks import atask
from news.tasks import fetch_all_news


class Command(BaseCommand):
    help = _("Executes feeds fetching, parsing and filtering tasks.")

    def handle(self, *args, **kwargs):
        atask(fetch_all_news)
