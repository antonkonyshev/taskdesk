"""
News feed related views.
"""

from django.views.generic.base import TemplateView


class NewsWebApp(TemplateView):
    template_name = "news/news_webapp.html"