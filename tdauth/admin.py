"""
.. module:: auth.admin
    :platform: Unix, Windows
    :synopsis: User account app admin preferences

.. moduleauthor:: Anton Konyshev

"""

from django.utils.translation import gettext_lazy as _
from wagtail_modeladmin.options import ModelAdmin

from tdauth.models import User

class UserAdmin(ModelAdmin):
    model = User
    menu_label = _("Users")
    menu_icon = "fa-person"

    list_display = ('email', 'name', 'is_active', 'is_staff', 'created')