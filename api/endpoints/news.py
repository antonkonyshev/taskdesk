"""
HTTP API backend controllers related to the news functionality.
"""

from json import JSONDecodeError

from fastapi import (WebSocket, WebSocketDisconnect, Depends,
                     WebSocketException, status)

from TaskDesk.tasks import atask
from tdauth.models import User
from news.models import News, Mark
from news.tasks import fetch_all_news

from api.authentication import Authentication
from api.router import TaskDeskAPIRouter
from api.schema.news import NewsData


NEWS_PER_ONE_REQUEST_LIMIT = 10


@TaskDeskAPIRouter.websocket("/news/")
async def list_news(
    socket: WebSocket,
    user: User = Depends(Authentication()),
):
    """The endpoint implements sending of news entries and news updates."""
    try:
        await socket.accept()
        while True:
            try:
                request = await socket.receive_json()
                if request.get('request', None) == 'list':
                    async for news_values in News.objects.unread_for_user(user)\
                            .values(
                                *NewsData.model_fields.keys()
                            )[:NEWS_PER_ONE_REQUEST_LIMIT]:
                        await socket.send_text(data=NewsData.model_validate(
                            news_values).model_dump_json())
                elif (
                    request.get('request', '') in ('hide', 'bookmark') and
                    request.get('id', None)
                ):
                    await Mark.mark_news(
                        user, request.get('id', None),
                        Mark.Category.HIDDEN
                            if request.get('request', '') == 'hide'
                            else Mark.Category.BOOKMARK)
                elif request.get('request', None) == 'fetch':
                    atask(fetch_all_news)
            except JSONDecodeError as err:
                # TODO: add logging
                print(err)
                raise WebSocketException(code = status.WS_1003_UNSUPPORTED_DATA)
    except WebSocketDisconnect:
        pass