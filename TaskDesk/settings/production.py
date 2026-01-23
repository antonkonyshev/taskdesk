from .base import *
import os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, 'database', 'taskdesk.sqlite3'),
        "OPTIONS": {
            "timeout": 30,
            # "transaction_mode": "IMMEDIATE",
            "init_command": """
                PRAGMA journal_mode=WAL;
                PRAGMA synchronous=NORMAL;
                PRAGMA foreign_keys=ON;
            """,
        },
    }
}

CACHES={
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'taskdesk',
    }
}

DEBUG = False

DJANGO_VITE = {
    "default": {
        "dev_mode": DEBUG,
        "static_url_prefix": "",
        "manifest_path": os.path.join(BASE_DIR, "static", "vite", ".vite", "manifest.json"),
    }
}

INTERNAL_IPS = ('127.0.0.1',)

try:
    from .local import *
except ImportError:
    pass
