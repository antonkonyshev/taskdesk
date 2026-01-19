import os.path as op
from datetime import datetime

from django.conf import settings
from django.utils import timezone

from TaskDesk.basetestcase import BaseTestCase
from tdauth.models import User

from news.models import News, Feed, UserFeed, Filter, Mark
from news.tasks import fetch_news_from_rss_feed, filter_news_for_user_feed


class NewsTasksTestCase(BaseTestCase):
    def setUp(self):
        result = super().setUp()
        self.feed1, self.feed2, self.feed3, self.feed4 = Feed.objects\
        .bulk_create([
            Feed(url=op.join(op.dirname(__file__), 'data', 'vc_rss')),
            Feed(url=op.join(op.dirname(__file__), 'data', 'python_rss')),
            Feed(url=op.join(op.dirname(__file__), 'data', 'django_rss')),
            Feed(url=op.join(op.dirname(__file__), 'data', 'lenta_rss')),
        ])
        return result

    def test_fetching_the_same_news(self):
        fetch_news_from_rss_feed(self.feed1.id)
        self.assertEqual(News.objects.count(), 12)
        fetch_news_from_rss_feed(self.feed1.id)
        self.assertEqual(News.objects.count(), 12)
        fetch_news_from_rss_feed(self.feed1.id)
        fetch_news_from_rss_feed(self.feed2.id)
        self.assertEqual(News.objects.count(), 37)
        fetch_news_from_rss_feed(self.feed2.id)
        self.assertEqual(News.objects.count(), 37)
        fetch_news_from_rss_feed(self.feed2.id)
        fetch_news_from_rss_feed(self.feed3.id)
        self.assertEqual(News.objects.count(), 47)
        fetch_news_from_rss_feed(self.feed3.id)
        self.assertEqual(News.objects.count(), 47)
        fetch_news_from_rss_feed(self.feed3.id)
        fetch_news_from_rss_feed(self.feed4.id)
        self.assertEqual(News.objects.count(), 247)
        fetch_news_from_rss_feed(self.feed4.id)
        self.assertEqual(News.objects.count(), 247)

    def test_parsing_news_correctly_first_example(self):
        fetch_news_from_rss_feed(self.feed1.id)
        news = self.feed1.news.exclude(enclosure_url='').order_by('-published')\
            .first()
        self.assertIn('цены на новые легковые автомобили', news.title)
        self.assertEqual(news.guid, '2688634')
        self.assertIn('события и мнения о рынках', news.description)
        self.assertEqual([getattr(news.published.date(), field, '') for field
                          in ('year', 'month', 'day')], [2026, 1, 14])
        self.assertEqual(news.feed_id, self.feed1.id)
        self.assertIn('https://vc.ru/money', news.link)
        self.assertIn('tseny-na-novye-legkovye', news.link)
        self.assertEqual(news.author, 'Артур Томилко')
        self.assertIn('https://leonardo.osnova.io/', news.enclosure_url)
        self.assertIn('982bdb339021', news.enclosure_url)
        self.assertEqual(news.enclosure_type, 'image/jpeg')

    def test_parsing_news_correctly_second_example(self):
        fetch_news_from_rss_feed(self.feed2.id)
        news = self.feed2.news.order_by('-published').first()
        self.assertIn('Python 3.15.0 alpha 4', news.title)
        self.assertIn('635039112097', news.guid)
        self.assertIn('added up until the start of', news.description)
        self.assertEqual([getattr(news.published.date(), field, '') for field
                          in ('year', 'month', 'day')], [2026, 1, 13])
        self.assertEqual(news.feed_id, self.feed2.id)
        self.assertIn('https://pythoninsider.blogspot.com/', news.link)
        self.assertIn('python-3150-alpha-4.html', news.link)
        self.assertEqual(news.author, 'noreply@blogger.com (Hugo)')
        self.assertFalse(news.enclosure_url)

    def test_parsing_news_correctly_third_example(self):
        fetch_news_from_rss_feed(self.feed3.id)
        news = self.feed3.news.order_by('-published').first()
        self.assertIn('Django bugfix releases issued: 5.2.10', news.title)
        self.assertIn('jan/06/bugfix-releases/', news.guid)
        self.assertIn('The release packages and checksums are', news.description)
        self.assertEqual([getattr(news.published.date(), field, '') for field
                          in ('year', 'month', 'day')], [2026, 1, 6])
        self.assertEqual(news.feed_id, self.feed3.id)
        self.assertIn('https://www.djangoproject.com/weblog/', news.link)
        self.assertIn('jan/06/bugfix-releases/', news.link)
        self.assertEqual(news.author, 'Jacob Walls')
        self.assertFalse(news.enclosure_url)

    def test_parsing_news_correctly_fourth_example(self):
        fetch_news_from_rss_feed(self.feed4.id)
        news = self.feed4.news.order_by('-published').first()
        self.assertIn('Сотни тысяч россиян остались без электро', news.title)
        self.assertIn('trosnabzheniya-posle', news.guid)
        self.assertFalse(news.description)
        self.assertEqual([getattr(news.published.date(), field, '') for field
                          in ('year', 'month', 'day')], [2026, 1, 18])
        self.assertEqual(news.feed_id, self.feed4.id)
        self.assertIn('https://lenta.ru/news', news.link)
        self.assertIn('tysyach-rossiyan-ostalis-bez', news.link)
        self.assertEqual(news.author, 'Анастасия Волова')
        self.assertIn('https://icdn.lenta.ru/assets', news.enclosure_url)
        self.assertIn('8735b949.png', news.enclosure_url)
        self.assertEqual(news.enclosure_type, 'image/png')

    def test_filtering_news_with_user_filters(self):
        userfeed1 = UserFeed(user=self.user, feed=self.feed1)
        userfeed1.save()
        userfeed2 = UserFeed(user=self.user, feed=self.feed2)
        userfeed2.save()
        userfeed3 = UserFeed(user=self.user, feed=self.feed3)
        userfeed3.save()
        userfeed4 = UserFeed(user=self.user, feed=self.feed4)
        userfeed4.save()
        filter1 = Filter(user=self.user, feed=userfeed1, entry='автомоби',
               part=Filter.Part.START)
        filter1.save()
        filter2 = Filter(user=self.user, feed=userfeed2, entry='3.15.0',
               part=Filter.Part.FULL)
        filter2.save()
        filter3 = Filter(user=self.user, feed=userfeed3, entry='ugfix',
               part=Filter.Part.PART)
        filter3.save()
        filter4 = Filter(user=self.user, feed=userfeed4, entry='ссиян',
               part=Filter.Part.END)
        filter4.save()
        fetch_news_from_rss_feed(self.feed1.id)
        fetch_news_from_rss_feed(self.feed2.id)
        fetch_news_from_rss_feed(self.feed3.id)
        fetch_news_from_rss_feed(self.feed4.id)

        self.assertEqual(News.objects.unread_for_user(self.user).count(), 247)
        filter_news_for_user_feed(self.user.id, userfeed1.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 245)
        filter_news_for_user_feed(self.user.id, userfeed1.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 245)

        filter_news_for_user_feed(self.user.id, userfeed2.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 241)
        filter_news_for_user_feed(self.user.id, userfeed2.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 241)

        filter_news_for_user_feed(self.user.id, userfeed3.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 240)
        filter_news_for_user_feed(self.user.id, userfeed3.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 240)

        filter_news_for_user_feed(self.user.id, userfeed4.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 237)
        filter_news_for_user_feed(self.user.id, userfeed4.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 237)

        Mark.objects.all().update(created=datetime(year=2025, month=1, day=1,
                                                   tzinfo=timezone.now().tzinfo))
        filter5 = Filter(user=self.user, entry='PyTHoN', part=Filter.Part.START)
        filter5.save()
        filter_news_for_user_feed(self.user.id, userfeed1.id)
        filter_news_for_user_feed(self.user.id, userfeed2.id)
        filter_news_for_user_feed(self.user.id, userfeed3.id)
        filter_news_for_user_feed(self.user.id, userfeed4.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 216) 

        Mark.objects.all().update(created=datetime(year=2025, month=1, day=1,
                                                   tzinfo=timezone.now().tzinfo))
        filter6 = Filter(user=self.user, entry='Django', part=Filter.Part.FULL)
        filter6.save()
        filter_news_for_user_feed(self.user.id, userfeed1.id)
        filter_news_for_user_feed(self.user.id, userfeed2.id)
        filter_news_for_user_feed(self.user.id, userfeed3.id)
        filter_news_for_user_feed(self.user.id, userfeed4.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 212)

        Mark.objects.all().update(created=datetime(year=2025, month=1, day=1,
                                                   tzinfo=timezone.now().tzinfo))
        filter7 = Filter(user=self.user, entry='рос', part=Filter.Part.PART)
        filter7.save()
        filter_news_for_user_feed(self.user.id, userfeed1.id)
        filter_news_for_user_feed(self.user.id, userfeed2.id)
        filter_news_for_user_feed(self.user.id, userfeed3.id)
        filter_news_for_user_feed(self.user.id, userfeed4.id)
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 145)

        mark1 = Mark(news=News.objects.filter(marks__isnull=True)\
                     .order_by('-published').first(),
            user=self.user, category=Mark.Category.HIDDEN)
        mark1.save()
        mark2 = Mark(news=News.objects.filter(marks__isnull=True)\
                     .order_by('published').first(),
            user=self.user, category=Mark.Category.BOOKMARK)
        mark2.save()

        filter7.delete()
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 210)
        filter1.delete()
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 212)
        filter6.delete()
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 216)
        filter3.delete()
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 217)
        filter2.delete()
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 221)
        filter4.delete()
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 224)
        filter5.delete()
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 245)

        self.assertEqual(Mark.objects.count(), 2)
        self.assertEqual(list(Mark.objects.values_list(
            'id', flat=True).all().order_by('id')), [mark1.id, mark2.id])