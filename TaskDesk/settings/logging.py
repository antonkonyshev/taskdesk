"""
Part of the project configuration related to logging shared amoung all
deployment environments.
"""

import os


LOGS_PATH = os.path.join(os.path.sep, 'var', 'log', 'taskdesk')
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'django': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGS_PATH, 'django.log'),
            'formatter': 'verbose',
        },
        'api': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGS_PATH, 'api.log'),
            'formatter': 'verbose',
        },
        'task': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGS_PATH, 'task.log'),
            'formatter': 'verbose',
        },
        'auth': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGS_PATH, 'task.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['django', 'console',],
            'level': 'ERROR',
        },
        'api': {
            'handlers': ['api', 'console',],
            'level': 'ERROR',
        },
        'task': {
            'handlers': ['task', 'console',],
            'level': 'ERROR',
        },
        'auth': {
            'handlers': ['task', 'console',],
            'level': 'ERROR',
        },
    },
}