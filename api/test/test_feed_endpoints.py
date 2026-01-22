from tdauth.models import User
from news.models import Feed, UserFeed

from .api_testcase import APITestCase


class FeedEndpointsTestCase(APITestCase):
    def setUp(self):
        self.auser = User.objects.create_user(
            email="another@example.com", password="123456")
        self.auser.is_active = True
        self.auser.save()
        result = super().setUp()

        self.feed = Feed(url="http://localhost:8888/rss1")
        self.feed.save()
        self.userfeed = UserFeed(feed=self.feed, user=self.user,
                                 title="Testing feed")
        self.userfeed.save()
        self.afeed = Feed(url="http://localhost:8888/rss2")
        self.afeed.save()
        self.auserfeed = UserFeed(feed=self.afeed, user=self.user)
        self.auserfeed.save()
        self.aafeed = Feed(url="http://localhost:8888/rss3")
        self.aafeed.save()
        self.aauserfeed = UserFeed(feed=self.aafeed, user=self.auser,
                                   title="Another feed")
        self.aauserfeed.save()
        return result

    def test_not_authenticated(self):
        rsp = self.client.get("/api/v1/feed/")
        self.assertEqual(rsp.status_code, 401)
        rsp = self.client.delete(f"/api/v1/feed/{self.userfeed.id}/")
        self.assertEqual(rsp.status_code, 401)
        rsp = self.client.post(f"/api/v1/feed/{self.userfeed.id}/")
        self.assertEqual(rsp.status_code, 401)

    def test_feeds_list(self):
        self.login()
        rsp = self.client.get("/api/v1/feed/")
        self.assertEqual(rsp.status_code, 200)
        data = rsp.json()
        self.assertEqual(len(data), 2)
        self.assertIn(self.feed.url, [elem.get('url', None) for elem in data])
        self.assertIn(self.afeed.url, [elem.get('url', None) for elem in data])
        self.assertNotIn(self.aafeed.url, [elem.get('url', None) for elem in data])

    def test_feed_creation(self):
        self.login()
        rsp = self.client.post(f"/api/v1/feed/", json={
            'url': 'http://localhost:8888/rss4',
        })
        self.assertEqual(rsp.status_code, 200)
        feed = Feed.objects.get(url='http://localhost:8888/rss4')
        userfeed = self.user.feeds.get(feed_id=feed.id)
        self.assertEqual(userfeed.title, "")

        rsp = self.client.get("/api/v1/feed/")
        self.assertEqual(rsp.status_code, 200)
        data = rsp.json()
        self.assertEqual(len(data), 3)
        self.assertIn(feed.url, [elem.get('url', None) for elem in data])
        self.assertIn(self.feed.url, [elem.get('url', None) for elem in data])
        self.assertIn(self.afeed.url, [elem.get('url', None) for elem in data])
        self.assertNotIn(self.aafeed.url, [elem.get('url', None) for elem in data])

    def test_feed_update(self):
        self.login()
        userfeed = self.user.feeds.get(feed__url="http://localhost:8888/rss2")
        self.assertEqual(userfeed.title, "")
        rsp = self.client.post("/api/v1/feed/", json={
            'url': 'http://localhost:8888/rss2',
            'title': 'Second testing feed',
        })
        self.assertEqual(rsp.status_code, 200)
        userfeed.refresh_from_db()
        self.assertEqual(userfeed.title, "Second testing feed")

    def test_feed_removing(self):
        self.login()
        userfeed = self.user.feeds.get(feed_id=self.afeed.id)
        rsp = self.client.delete(f"/api/v1/feed/{userfeed.id}/")
        self.assertEqual(rsp.status_code, 204)
        userfeed = self.user.feeds.filter(id=userfeed.id).first()
        self.assertIsNone(userfeed)
