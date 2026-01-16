from .base import *

DEBUG = True

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
