from django.db import models
from django.shortcuts import redirect

from wagtail.models import Page


class HomePage(Page):
    def serve(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect("tdauth_login")
        return super().serve(request, *args, **kwargs)
