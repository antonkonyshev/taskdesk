"""
ASGI application exception handlers for the TaskDesk project.
"""

import traceback

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from django.conf import settings


async def internal_exception_handler(request: Request, err: Exception) -> Response:
    tb = traceback.format_exc()
    print(tb)  # TODO: add logging
    if getattr(settings, "DEBUG", False):
        content = {
            "message": "Internal Server Error",
            "detail": str(err),
            "traceback": tb,
        }
    else:
        content = {"detail": "Internal Server Error"}
    return JSONResponse(
        status_code = 500,
        content = content
    )