"""
ASGI config for TaskDesk project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TaskDesk.settings.dev")

from django.core.asgi import get_asgi_application
from django.conf import settings
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware


def create_application():
    django_app = get_asgi_application()
    app = FastAPI(title=settings.WAGTAIL_SITE_NAME, debug=settings.DEBUG)
    app.add_middleware(
        CORSMiddleware,
        allow_origins = settings.ALLOWED_HOSTS or ["*"],
        allow_credentials = True,
        allow_methods = ["*"],
        allow_headers = ["*"],
    )

    from api.endpoints import api_router
    app.include_router(api_router, prefix="/api/v1")
    app.mount("/", django_app)

    return app

application = create_application()