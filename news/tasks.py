"""
News processing celery tasks. Loading from rss feeds and filtration.
"""

from celery import shared_task
from django.db.models import Q
import feedparser

from TaskDesk.tasks import atask
from news.models import Feed, UserFeed, News, Mark, Filter
from news.serializers import FeedEntry


@shared_task(rate_limit='1/m', max_retries=3, soft_time_limit=900,
             time_limit=1800, trail=False, ignore_result=True, expires=3600)
def fetch_all_news():
    """
    Initializes the news fetching procedure for all news feeds which have
    at least one subscriber.
    """
    for feed_id in UserFeed.objects.values_list(
        'feed_id', flat=True
    ).for_active_users().distinct():
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
            news = FeedEntry(entry).to_news()
            if news:
                news.save()
        except Exception as err:
            # TODO: add logging
            print(err)
    for user_id in UserFeed.objects.values_list(
        'user_id', flat=True
    ).active_for_feed(feed).distinct():
        atask(filter_news_for_user_feed, feed.id, user_id)
    

@shared_task(rate_limit='1/s', max_retries=3, soft_time_limit=900,
             time_limit=1800, trail=False, ignore_result=True, expires=3600)
def filter_news_for_user_feed(feed_id: int, user_id: int):
    """
    Applies user filters to the news received since mark.
    """
    filters = Filter.objects.applicable_to_user_feed(user=user_id, feed=feed_id)
    if not filters.exists():
        return
    for news_id, news_title in News.objects.unfiltered_for_user_feed(
        user_id, feed_id
    ).order_by('published'):
        try:
            keywords = News.keywords(news_title)
            for filter in filters:
                if filter.apply_filter(keywords):
                    mark = Mark(user_id=user_id, news_id=news_id,
                                category=Mark.Category.HIDDEN)
                    mark.save()
                    break
        except Exception as err:
            # TODO: add logging
            print(err)