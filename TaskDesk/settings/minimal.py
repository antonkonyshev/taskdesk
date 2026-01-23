"""
Minimal production deployment. Excludes message queue, celery workers pool,
cache backend (uses RAM caching instead) and docker. Uses sqlite3 as main
backend database. Uses cron instead of scheduled celery tasks.
"""

from .base import *
import os


EAGER_ATASKS = True

TASKWARRIOR_STORAGE_PATH = os.path.join(os.path.dirname(BASE_DIR), "Workspace",
                                        "taskstorage")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(os.path.dirname(BASE_DIR), 'Workspace', 'sqlite3',
                             'taskdesk.sqlite3'),
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

MEDIA_ROOT = os.path.join(os.path.dirname(BASE_DIR), "Workspace", "media")

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
