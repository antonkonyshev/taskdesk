"""
News processing celery tasks. Loading from rss feeds and filtration.
"""

import time
from datetime import datetime

from celery import shared_task
from django.utils import timezone
from django.db.models import Q
import feedparser

from TaskDesk.tasks import atask
from news.models import Feed, UserFeed, News, Mark, Filter


@shared_task(rate_limit='1/m', max_retries=3, soft_time_limit=900,
             time_limit=1800, trail=False, ignore_result=True, expires=3600)
def fetch_all_news():
    """
    Initializes the news fetching procedure for all news feeds which have
    at least one subscriber.
    """
    for feed_id in UserFeed.objects.values_list('feed_id', flat=True).filter(
        user__is_active=True
    ).distinct():
        atask(fetch_news_from_rss_feed, feed_id)


@shared_task(rate_limit='4/m', max_retries=3, soft_time_limit=900,
             time_limit=1800, trail=False, ignore_result=True, expires=3600)
def fetch_news_from_rss_feed(feed_id: int):
    """
    Downloading of RSS feed from a remote server, parsing news from the feed
    and saving them in the main database.
    """
    feed = Feed.objects.get(id=feed_id)
    rss = feedparser.parse(feed.url)
    for entry in rss.get('entries', []):
        try:
            # TODO: move the logic into a separate module or a class method
            guid = entry.get('guid', entry.get('id', entry.get('link', '')))[32:]
            if not guid:
                continue
            if feed.news.filter(guid=guid).exists():
                continue

            news = News(feed=feed, guid=guid)
            news.title = entry.get(
                'title', entry.get('summary', entry.get('description', '')))[:128]
            if not news.title:
                continue
            news.description = entry.get(
                'description', entry.get('summary', ''))[:1024]
            links = entry.get('links', [])
            news.link = entry.get('link', '')[:256]
            if not news.link:
                altlinks = [link.get('href', None) for link in links
                            if link.get('type', '') == 'text/html' and
                            link.get('href', None)]
                if not altlinks:
                    continue
                news.link = altlinks[0][:256]
            news.author = entry.get('author', '')
            enclosures = [(link.get('type', ''), link.get('href', ''),)
                        for link in links
                        if link.get('type', '').startswith('image') and
                        link.get('href', None)]
            if len(enclosures):
                news.enclosure_url = enclosures[0][1][:256]
                news.enclosure_type = enclosures[0][0][:32]
            try:
                news.published = datetime.fromtimestamp(time.mktime(
                    entry.get('published_parsed', None)))
            except Exception:
                try:
                    news.published = datetime(
                        *entry.get('published_parsed', [])[:6])
                except Exception:
                    news.published = timezone.now()
            if not news.published.tzinfo:
                news.published = news.published.replace(
                    tzinfo=timezone.now().tzinfo)
            news.save()
        except Exception as err:
            # TODO: add logging
            print(err)
    for user_id in feed.userfeeds.values_list('user_id', flat=True).filter(
        user__is_active=True
    ).distinct():
        atask(filter_news_for_user_feed, feed.id, user_id)
    

@shared_task(rate_limit='1/s', max_retries=3, soft_time_limit=900,
             time_limit=1800, trail=False, ignore_result=True, expires=3600)
def filter_news_for_user_feed(feed_id: int, user_id: int):
    """
    Applies user filters to the news received since mark.
    """
    filters = Filter.objects.filter(
        Q(feed_id=feed_id) | Q(feed_id__isnull=True), user_id=user_id
    )
    if not filters.count():
        return
    last_mark = Mark.objects.values_list('created', flat=True).filter(
        user_id=user_id
    ).order_by('-created').first()
    news_queryset = News.objects.values_list('id', 'title').filter(
        feed_id=feed_id)
    if last_mark:
        news_queryset.filter(created__gt=last_mark)
    for news_id, news_title in news_queryset:
        try:
            # TODO: move the filtering logic into a separate module or class method
            mark_hidden = False
            words = [word for word in news_title.lower().strip().split()
                    if len(word) > 2]
            for filter in filters:
                if filter.part == Filter.Part.START:
                    if len([word for word in words
                            if word.startswith(filter.entry)]):
                        mark_hidden = True
                        break
                elif filter.part == Filter.Part.FULL:
                    if len([word for word in words if word == filter.entry]):
                        mark_hidden = True
                        break
                elif filter.part == Filter.Part.PART:
                    if len([word for word in words if filter.entry in word]):
                        mark_hidden = True
                        break
                elif filter.part == Filter.Part.END:
                    if len([word for word in words if word.endswith(filter.entry)]):
                        mark_hidden = True
                        break
            if mark_hidden:
                mark = Mark(user_id=user_id, news_id=news_id,
                            category=Mark.Category.HIDDEN)
                mark.save()
        except Exception as err:
            # TODO: add logging
            print(err)