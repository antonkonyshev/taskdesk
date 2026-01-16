"""
ASGI application exception handlers for the TaskDesk project.
"""

import traceback

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from django.conf import settings


async def http_api_exception_handler(request: Request, err: HTTPException) -> Response:
    tb = traceback.format_exc()
    if not getattr(settings, 'AUTOTESTING', False):
        print(tb)  # TODO: add logging
    if getattr(settings, "DEBUG", False):
        content = {
            "message": "Internal Server Error",
            "detail": str(err),
            "traceback": tb,
        }
        status_code = err.status_code
    elif err.status_code == 401:
        content = {"detail": "Authentication required"}
        status_code = 401
    elif err.status_code == 404:
        content = {"detail": "Entity not found"}
        status_code = 404
    else:
        content = {"detail": "Internal Server Error"}
        status_code = 500
    return JSONResponse(
        status_code = status_code,
        content = content,
    )