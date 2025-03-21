"""
Registration and authentication related URL routing rules.
"""

from django.urls import include, path
from django.contrib.auth import views as auth_views

from tdauth.views import logout_view


urlpatterns = [
    path("login/", auth_views.LoginView.as_view(
        template_name="tdauth/login.html",
        redirect_authenticated_user=True,
    ), name="tdauth_login"),

    path("logout/", logout_view, name="tdauth_logout"),
]