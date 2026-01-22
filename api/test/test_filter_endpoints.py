from tdauth.models import User
from news.models import Filter, Feed, UserFeed

from .api_testcase import APITestCase


class FilterEndpointsTestCase(APITestCase):
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
        self.filter = Filter(user=self.user, feed=self.userfeed, entry="Test",
                             part="start")
        self.filter.save()
        self.afilter = Filter(user=self.user, entry="Another", part="part")
        self.afilter.save()
        self.afeed = Feed(url="http://localhost:8888/rss2")
        self.afeed.save()
        self.auserfeed = UserFeed(feed=self.afeed, user=self.user)
        self.auserfeed.save()
        self.aafeed = Feed(url="http://localhost:8888/rss3")
        self.aafeed.save()
        self.aauserfeed = UserFeed(feed=self.aafeed, user=self.auser,
                                   title="Another feed")
        self.aauserfeed.save()
        self.aafilter = Filter(user=self.auser, entry="Something", part="full")
        self.aafilter.save()
        return result

    def test_not_authenticated(self):
        rsp = self.client.get("/api/v1/filter/")
        self.assertEqual(rsp.status_code, 401)
        rsp = self.client.delete(f"/api/v1/filter/{self.filter.id}/")
        self.assertEqual(rsp.status_code, 401)
        rsp = self.client.post(f"/api/v1/filter/")
        self.assertEqual(rsp.status_code, 401)

    def test_filters_list(self):
        self.login()
        rsp = self.client.get("/api/v1/filter/")
        self.assertEqual(rsp.status_code, 200)
        data = rsp.json()
        self.assertEqual(len(data), 2)
        self.assertIn(self.filter.entry.lower(),
                      [elem.get('entry', None) for elem in data])
        self.assertIn(self.afilter.entry,
                      [elem.get('entry', None) for elem in data])
        self.assertNotIn(self.aafilter.entry,
                         [elem.get('entry', None) for elem in data])

    def test_filter_creation(self):
        self.login()
        feed = Feed.objects.get(url='http://localhost:8888/rss1')
        userfeed = self.user.feeds.get(feed_id=feed.id)
        rsp = self.client.post(f"/api/v1/filter/", json={
            'entry': 'NewFilter', 'part': 'full', 'feed_id': userfeed.id,
        })
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(self.user.newsfilters.all().count(), 3)
        filter = self.user.newsfilters.get(feed_id=userfeed.id, entry='newfilter')
        self.assertEqual(filter.entry, "newfilter")
        self.assertEqual(filter.part, 'full')
        self.assertEqual(filter.feed_id, userfeed.id)

        rsp = self.client.get("/api/v1/filter/")
        self.assertEqual(rsp.status_code, 200)
        data = rsp.json()
        self.assertEqual(len(data), 3)
        self.assertIn(filter.entry, [elem.get('entry', None) for elem in data])
        self.assertIn(self.filter.entry, [elem.get('entry', None) for elem in data])
        self.assertIn(self.afilter.entry, [elem.get('entry', None) for elem in data])
        self.assertNotIn(self.aafilter.entry, [elem.get('entry', None) for elem in data])

    def test_filter_update(self):
        self.login()
        userfeed = self.afeed.userfeeds.get(user_id=self.user.id)
        filter = self.user.newsfilters.exclude(feed_id=userfeed.id).first()
        rsp = self.client.post(f"/api/v1/filter/{filter.id}/", json={
            'entry': 'Modified',
            'part': 'part',
            'feed_id': userfeed.id
        })
        self.assertEqual(rsp.status_code, 200)
        filter.refresh_from_db()
        self.assertEqual(filter.entry, 'modified')
        self.assertEqual(filter.part, 'part')
        self.assertEqual(filter.feed_id, userfeed.id)

    def test_update_not_belonged_filter(self):
        self.login()
        userfeed = self.aauserfeed
        filter = self.aafilter
        rsp = self.client.post(f"/api/v1/filter/{filter.id}/", json={
            'entry': 'Modified',
            'part': 'part',
            'feed_id': userfeed.id
        })
        self.assertEqual(rsp.status_code, 200)
        filter.refresh_from_db()
        self.assertEqual(filter.entry, 'something')
        self.assertEqual(filter.part, 'full')
        self.assertIsNone(filter.feed_id)
        filter = self.user.newsfilters.filter(entry='modified').first()
        self.assertEqual(filter.part, 'part')
        self.assertIsNone(filter.feed_id)

    def test_filter_removing(self):
        self.login()
        filter = self.user.newsfilters.all().first()
        rsp = self.client.delete(f"/api/v1/filter/{filter.id}/")
        self.assertEqual(rsp.status_code, 204)
        filter = self.user.newsfilters.filter(id=filter.id).first()
        self.assertIsNone(filter)

    def test_delete_not_belonged_filter(self):
        self.login()
        filter = self.aafilter
        rsp = self.client.delete(f"/api/v1/filter/{filter.id}/")
        self.assertEqual(rsp.status_code, 204)
        filter = Filter.objects.filter(id=filter.id).first()
        self.assertIsNotNone(filter)