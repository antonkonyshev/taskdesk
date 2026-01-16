"""
Data models related logic shared amoung django applications of the project.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class TaskDeskBaseModel(models.Model):
    """Base models class for most of the project entities."""
    created = models.DateTimeField(_("Created"), auto_now_add=True,
                                   editable=False)
                                
    class Meta:
        abstract = True
