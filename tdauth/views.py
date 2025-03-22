"""
Registration and authentication related controllers.
"""

from django.contrib.auth import logout
from django.shortcuts import redirect
from django.urls import reverse

from django_utils import cache


def logout_view(request):
    logout(request)
    return redirect(cache.cacheget(['tdauthloginpageurl'], cls=str,
        default=lambda: reverse("tdauth_login")))