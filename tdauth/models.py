# -*- coding: utf-8 -*-
"""
.. module:: auth.models
    :platform: Unix, Windows
    :synopsis: User account models

.. moduleauthor:: Anton Konyshev

"""

import os
import os.path as op

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError(_("Email is a required field"))
        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None):
        user = self.create_user(email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user account model with project related additions and modifications"""
    email = models.EmailField(_("Email"), unique=True)
    name = models.CharField(_("First name"), max_length=128, blank=True)
    task_db_path = models.FilePathField(_("TaskWarrior database path"),
        path = getattr(settings, 'TASKWARRIOR_STORAGE_PATH', 'taskstorage'),
        allow_files=False, allow_folders=True, blank=True, null=True, recursive=True)

    is_staff = models.BooleanField(_("Staff status"), default=False,
        help_text=_("Designates whether the user can log into this admin site."))
    is_active = models.BooleanField(_("Active"), default=True,
        help_text=_("Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."))

    created = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        db_table = "user"
        ordering = ("-created",)

    def __str__(self):
        return f"User #{self.email}"

    def save(self, *args, **kwargs):
        if not self.task_db_path and self.email:
            self.task_db_path = op.join(
                getattr(settings, 'TASKWARRIOR_STORAGE_PATH', 'taskstorage'),
                self.email.replace('@', '_'))
        result = super().save(*args, **kwargs)
        if self.id and not op.exists(self.task_db_path):
            os.makedirs(self.task_db_path)
        return result
