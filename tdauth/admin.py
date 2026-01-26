"""
.. module:: auth.admin
    :platform: Unix, Windows
    :synopsis: User account app admin preferences

.. moduleauthor:: Anton Konyshev

"""

from django.utils.translation import gettext_lazy as _
from wagtail.snippets.views.snippets import SnippetViewSet

from tdauth.models import User

class UserAdmin(SnippetViewSet):
    model = User
    menu_label = _("Users")
    icon = "fa-person"
    exclude_form_fields = ('password', 'last_login', 'created',)

    list_display = ('email', 'name', 'is_active', 'is_staff', 'created')