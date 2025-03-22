from django.db import models
from django.shortcuts import redirect
from django.urls import reverse

from wagtail.models import Page

from django_utils import cache


class HomePage(Page):
    def serve(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(cache.cacheget(['tdauthloginpageurl'], cls=str,
                default=lambda: reverse("tdauth_login")))
        return super().serve(request, *args, **kwargs)
