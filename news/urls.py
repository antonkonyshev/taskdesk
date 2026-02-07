"""
News feed related URL routing rules.
"""

from django.urls import re_path
from django.contrib.auth.decorators import login_required

from news.views import NewsWebApp

urlpatterns = [
    re_path(r"^(?P<__>.*)?$", login_required(NewsWebApp.as_view()),
            name="news_webapp"),
]