"""
HTTP API URL router.
"""

from fastapi import APIRouter, Depends

from api.authentication import Authentication


TaskDeskAPIRouter = APIRouter(redirect_slashes=True,
                              dependencies=[Depends(Authentication())])

from api.endpoints.task import *
from api.endpoints.feed import *