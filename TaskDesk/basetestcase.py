from django.test import TransactionTestCase, override_settings
from django.conf import settings
from django.core.cache import cache

from tdauth.models import User


def atask_mocked(task, *args, **kwargs):
    task(*args, **kwargs)


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
    CELERY_ALWAYS_EAGER=True,
    CELERY_TASK_ALWAYS_EAGER=True,
    TASK_ALWAYS_EAGER=True,
    ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES_EXCEPTIONS=True,
    CELERY_TASK_EAGER_PROPAGATES=True,
    BROKER_BACKEND="memory://",
    BROKER_URL="memory://",
    CELERY_BROKER_URL="memory://",
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
