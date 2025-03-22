from django.test import TestCase, override_settings
from django.conf import settings
from django.core.cache import cache


@override_settings(
    MEDIA_ROOT=f"{settings.MEDIA_ROOT}_test",
    CACHES={'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'taskdesktesting'
    }},
    DEFAULT_CACHE_DURATION=30,
    # DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3'}},
)
class BaseTestCase(TestCase):
    def setUp(self):
        cache.clear()
        return super().setUp()