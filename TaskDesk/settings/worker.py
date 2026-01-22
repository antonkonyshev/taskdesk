"""
Part of the project configuration related to celery workers pool common amoung
all deployment environments.
"""

import os


CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL",
    "amqp://{mq_user}:{mq_pwd}@{mq_host}:{mq_port}/{mq_vhost}".format(
        mq_user = os.getenv("RABBITMQ_DEFAULT_USER", "taskdesk"),
        mq_pwd = os.getenv("RABBITMQ_DEFAULT_PASS", "taskdesk"),
        mq_host = os.getenv("RABBITMQ_DEFAULT_HOST", "mq"),
        mq_port = os.getenv("RABBITMQ_DEFAULT_PORT", "5672"),
        mq_vhost = os.getenv("RABBITMQ_DEFAULT_VHOST", "taskdesk"),
    )
)

CELERY_TASK_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_CREATE_MISSING_QUEUES = True
CELERYD_PREFETCH_MULTIPLIER = 1
CELERY_DEFAULT_QUEUE = 'default'
CELERY_DEFAULT_ROUTING_KEY = 'default'

CELERY_ROUTES = {
    # rss is a queue for fetching news from remote servers and creation of
    # local news entities
    'news.tasks.fetch_all_news': {'queue': 'rss'},
    'news.tasks.fetch_news_from_rss_feed': {'queue': 'rss'},

    # filtering is a queue for processing local news entities and applying user
    # filters to them
    'news.tasks.filter_news_for_user_feed': {'queue': 'filtering'}
}

from celery.schedules import crontab

CELERYBEAT_SCHEDULE = {
    'fetch-all-news': {
        'task': 'news.tasks.fetch_all_news',
        'schedule': crontab(hour='3', minute=42),
        'options': {'expires': 3600},
    },
}