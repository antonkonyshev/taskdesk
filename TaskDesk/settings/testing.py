from .base import *

DEBUG = True

DJANGO_VITE = {
    "default": {
        "dev_mode": DEBUG
    }
}

SECRET_KEY = "django-insecure-@i!@il2oj960=m6cspm-t3_ubt6^vbae%^z_k#!r5a-ftu&m=_"

ALLOWED_HOSTS = ["*"]
INTERNAL_IPS = ('127.0.0.1',)

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
        "OPTIONS": {
            "timeout": 30
        },
    }
}

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

CELERY_TASK_ALWAYS_EAGER = True
CELERY_ALWAYS_EAGER = True
CELERY_EAGER_PROPAGATES_EXCEPTIONS = True
CELERY_BROKER_URL = "memory://"

def atask_mocked(task, *args, **kwargs):
    task(*args, **kwargs)

from unittest.mock import patch
patch('TaskDesk.tasks.atask', side_effect=atask_mocked).start()