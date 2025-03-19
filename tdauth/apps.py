# -*- coding: utf-8 -*-

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TDAuthConfig(AppConfig):
    name = 'tdauth'
    verbose_name = _('User registration and authentication functionality')
