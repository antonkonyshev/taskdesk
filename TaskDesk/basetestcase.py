from django.test import TransactionTestCase, override_settings
from django.conf import settings
from django.core.cache import cache

from tdauth.models import User


@override_settings(
    MEDIA_ROOT=f"{settings.MEDIA_ROOT}_test",
    CACHES={'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'taskdesktesting'
    }},
    DEFAULT_CACHE_DURATION=30,
    # DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3'}},
    TASKWARRIOR_STORAGE_PATH = "test_taskstorage",
    AUTOTESTING = True,
)
class BaseTestCase(TransactionTestCase):
    username = "test@example.com"
    password = "123456"

    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            email=self.username, password=self.password)
        self.user.is_active = True
        self.user.save()
        return super().setUp()