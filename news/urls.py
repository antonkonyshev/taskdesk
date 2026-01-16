"""
News feed related URL routing rules.
"""

from django.urls import re_path

from news.views import NewsWebApp

urlpatterns = [
    re_path(r"^(?P<__>.*)?$", NewsWebApp.as_view(), name="news_webapp"),
]