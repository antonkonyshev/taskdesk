from django.utils import timezone

from TaskDesk.basetestcase import BaseTestCase

from tdauth.models import User
from news.models import News, Feed, UserFeed, Filter, Mark


class NewsModelsTestCase(BaseTestCase):
    def setUp(self):
        self.feed = Feed(url="http://LocalHost:8000/Rss1")
        self.feed.save()

        result = super().setUp()
        self.auser = User.objects.create_user(
            email="another@example.com", password="123456")
        self.auser.is_active = False
        self.auser.save()

        self.userfeed = UserFeed(user=self.user, feed=self.feed, title="First")
        self.userfeed.save()
        self.auserfeed = UserFeed(user=self.auser, feed=self.feed, title="Second")
        self.auserfeed.save()

        self.filter = Filter(user=self.user, feed=self.userfeed, entry="First",
                             part="full")
        self.filter.save()
        self.afilter = Filter(user=self.user, entry="Second",
                             part="start")
        self.afilter.save()
        self.aafilter = Filter(user=self.user, entry="Somethingelse",
                               part="part")
        self.aafilter.save()

        self.aanews = News(
            feed=self.feed, title="Third news in feed", description="Third description",
            guid="thirdguid", link="http://localhost:8000/news3",
            author="Third Author", published=timezone.now())
        self.aanews.save()
        self.anews = News(
            feed=self.feed, title="Second news in feed",
            description="Second description", guid="secondguid",
            link="http://localhost:8000/news2", author="Second Author",
            enclosure_url="http://localhost:8000/img/second.jpg",
            enclosure_type="image/jpeg", published=timezone.now())
        self.anews.save()
        self.news = News(
            feed=self.feed, title="First news in feed", description="First description",
            guid="firstgui", link="http://localhost:8000/news1",
            author="First Author",
            enclosure_url="http://localhost:8000/img/first.png",
            enclosure_type="image/png", published=timezone.now())
        self.news.save()
        return result

    def test_feed_url(self):
        self.assertEqual(self.feed.url, "http://localhost:8000/rss1")

    def test_filter_entry(self):
        self.assertEqual(self.filter.entry, "first")
        self.assertEqual(self.afilter.entry, "second")

    def test_userfeed_queryset(self):
        userfeeds = UserFeed.objects.for_active_users()
        self.assertEqual(userfeeds.count(), 1)
        self.assertEqual(userfeeds.first().id, self.userfeed.id)

        userfeeds = UserFeed.objects.active_for_feed(self.feed)
        self.assertEqual(userfeeds.count(), 1)
        self.assertEqual(userfeeds.first().id, self.userfeed.id)

    def test_news_keywords(self):
        words = list(News.keywords(self.news))
        self.assertEqual(len(words), 3)
        self.assertEqual(words, ['first', 'news', 'feed'])
        words = list(News.keywords(self.anews.title))
        self.assertEqual(len(words), 3)
        self.assertEqual(words, ['second', 'news', 'feed'])

    def test_news_search_by_guid(self):
        news = News.objects.by_feed_guid(self.feed.id, "secondguid")
        self.assertEqual(news.count(), 1)
        self.assertEqual(news.first().title, "Second news in feed")

    def test_news_filtering_for_user(self):
        news = News.objects.unfiltered_for_user_feed(self.user.id, self.feed)
        self.assertEqual(news.count(), 3)
        self.assertEqual(list(news.values_list('author', flat=True)), [
            'First Author', 'Second Author', 'Third Author'])

        mark = Mark(user=self.user, news=self.aanews,
                    category=Mark.Category.HIDDEN)
        mark.save()

        news = News.objects.unfiltered_for_user_feed(self.user.id, self.feed)
        self.assertEqual(news.count(), 2)
        self.assertEqual(list(news.values_list('author', flat=True)), [
            'First Author', 'Second Author'])

        mark = Mark(user=self.user, news=self.anews,
                    category=Mark.Category.BOOKMARK)
        mark.save()

        news = News.objects.unfiltered_for_user_feed(self.user.id, self.feed)
        self.assertEqual(news.count(), 1)
        self.assertEqual(list(news.values_list('author', flat=True)),
                         ['First Author'])

    def test_filter_application_to_news(self):
        self.assertTrue(self.filter.apply_filter(News.keywords(self.news)))
        self.assertFalse(self.filter.apply_filter(
            News.keywords(self.anews.title)))
        self.assertFalse(self.filter.apply_filter(News.keywords(self.aanews)))

        self.assertFalse(self.afilter.apply_filter(News.keywords(self.news)))
        self.assertTrue(self.afilter.apply_filter(
            News.keywords(self.anews.title)))
        self.assertFalse(self.afilter.apply_filter(News.keywords(self.aanews)))

        self.assertFalse(self.aafilter.apply_filter(
            News.keywords(self.news.title)))
        self.assertFalse(self.aafilter.apply_filter(
            News.keywords(self.anews.title)))
        self.assertFalse(self.aafilter.apply_filter(
            News.keywords(self.aanews)))