import os.path as op
from time import sleep

from fastapi import WebSocketDisconnect

from news.models import Feed, UserFeed, Mark, News
from news.tasks import fetch_news_from_rss_feed

from .api_testcase import APITestCase


class NewsEndpointsTestCase(APITestCase):
    def setUp(self):
        result = super().setUp()
        self.feed1, self.feed2 = Feed.objects.bulk_create([
            Feed(url=op.join(op.dirname(op.dirname(op.dirname(
                __file__))), 'news', 'test', 'data', 'vc_rss')),
            Feed(url=op.join(op.dirname(op.dirname(op.dirname(
                __file__))), 'news', 'test', 'data', 'python_rss')),
        ])
        self.userfeed = UserFeed(user=self.user, feed=self.feed1,
                                 title="First feed")
        self.userfeed.save()
        fetch_news_from_rss_feed(self.feed1.id)
        fetch_news_from_rss_feed(self.feed2.id)
        return result

    def test_not_authenticated(self):
        rsp = self.client.get("/api/v1/ws/news/")
        self.assertNotEqual(rsp.status_code, 200)
        session = self.client.websocket_connect("/api/v1/ws/news/")
        self.assertRaises(WebSocketDisconnect, session.__enter__)

    def test_unread_news_list_requesting(self):
        self.assertEqual(News.objects.count(), 37)
        self.login()
        with self.client.websocket_connect("/api/v1/ws/news/") as socket:
            socket.send_json({'request': 'unread'})
            data = socket.receive_json()
            self.assertTrue(data)
            data = socket.receive_json()
            self.assertIn('цены на новые легковые автомобили', data.get('title'))
            self.assertIn('события и мнения о рынках', data.get('description'))
            self.assertEqual(data.get('guid'), '2688634')
            self.assertEqual(data.get('author'), 'Артур Томилко')
            self.assertIn('https://vc.ru/money', data.get('link'))
            self.assertIn('novye-legkovye-avtomobili', data.get('link'))
            self.assertEqual(data.get('feed'), self.feed1.id)
            self.assertEqual(data.get('published'), '2026-01-14T05:31:34Z')
            self.assertIn('https://leonardo.osnova.io/ec1',
                          data.get('enclosure_url'))
            self.assertEqual(data.get('enclosure_type'), 'image/jpeg')
            data = socket.receive_json()
            self.assertTrue(data)

    def test_bookmarked_news_list_request(self):
        news = News.objects.unread_for_user(self.user).first()
        anews = News.objects.unread_for_user(self.user).last()
        Mark(user=self.user, news=news, category=Mark.Category.BOOKMARK).save()
        Mark(user=self.user, news=anews, category=Mark.Category.HIDDEN).save()
        self.login()
        with self.client.websocket_connect("/api/v1/ws/news/") as socket:
            socket.send_json({'request': 'reading'})
            data = socket.receive_json()
            self.assertTrue(data)
            self.assertIn('запрет на создание', data.get('title'))

    def test_hidden_news_list_request(self):
        news = News.objects.unread_for_user(self.user).first()
        anews = News.objects.unread_for_user(self.user).last()
        Mark(user=self.user, news=news, category=Mark.Category.BOOKMARK).save()
        Mark(user=self.user, news=anews, category=Mark.Category.HIDDEN).save()
        self.login()
        with self.client.websocket_connect("/api/v1/ws/news/") as socket:
            socket.send_json({'request': 'hidden'})
            data = socket.receive_json()
            self.assertTrue(data)
            self.assertIn('самозанятые в 2025 году', data.get('title'))

    def test_news_list_for_feed_request(self):
        self.login()
        with self.client.websocket_connect("/api/v1/ws/news/") as socket:
            socket.send_json({'request': 'feed', 'id': self.feed1.id})
            data = socket.receive_json()
            self.assertTrue(data)
            data = socket.receive_json()
            self.assertIn('цены на новые легковые автомобили', data.get('title'))

    def test_news_hiding_and_bookmarking(self):
        self.assertEqual(News.objects.unread_for_user(self.user).count(), 12)
        news = News.objects.unread_for_user(self.user).first()
        anews = News.objects.unread_for_user(self.user).last()
        self.login()
        with self.client.websocket_connect("/api/v1/ws/news/") as socket:
            socket.send_json({'request': 'hide', 'id': news.id})
            sleep(1)
            self.assertEqual(News.objects.unread_for_user(self.user).count(), 11)
            socket.send_json({'request': 'bookmark', 'id': anews.id})
            sleep(1)
            self.assertEqual(News.objects.unread_for_user(self.user).count(), 10)
            self.assertEqual(self.user.marks.count(), 2)
            self.assertEqual(self.user.marks.filter(
                category=Mark.Category.HIDDEN).count(), 1)
            self.assertEqual(self.user.marks.filter(
                category=Mark.Category.BOOKMARK).count(), 1)

            socket.send_json({'request': 'hide', 'id': anews.id})
            sleep(1)
            self.assertEqual(News.objects.unread_for_user(self.user).count(), 10)
            self.assertEqual(self.user.marks.count(), 2)
            self.assertEqual(self.user.marks.filter(
                category=Mark.Category.HIDDEN).count(), 2)
            self.assertEqual(self.user.marks.filter(
                category=Mark.Category.BOOKMARK).count(), 0)

            socket.send_json({'request': 'bookmark', 'id': news.id})
            socket.send_json({'request': 'bookmark', 'id': anews.id})
            sleep(1)
            self.assertEqual(News.objects.unread_for_user(self.user).count(), 10)
            self.assertEqual(self.user.marks.count(), 2)
            self.assertEqual(self.user.marks.filter(
                category=Mark.Category.HIDDEN).count(), 0)
            self.assertEqual(self.user.marks.filter(
                category=Mark.Category.BOOKMARK).count(), 2)