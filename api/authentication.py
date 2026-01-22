"""
HTTP API authentication. Uses django sessions to authenticate users interacting
with FastAPI based endpoints.
"""

import logging

from django.contrib.sessions.models import Session
from django.utils import timezone

from fastapi import Cookie, status
from fastapi.exceptions import HTTPException

from tdauth.models import User


logger = logging.getLogger('api')


class Authentication:
    """Authentication for the API based on django sessions."""

    async def __call__(self, sessionid: str = Cookie("sessionid")) -> User:
        try:
            session = await Session.objects.aget(session_key=sessionid)
            if timezone.now() <= session.expire_date:
                return await User.objects.aget(
                    id = session.get_decoded().get("_auth_user_id"))
        except Session.DoesNotExist:
            pass
        except Exception:
            logger.exception(
                f"Error on user authentication with API. SID:{sessionid}")
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED)