"""
HTTP API backend controllers related to the news functionality.
"""

import logging
from json import JSONDecodeError

from fastapi import (WebSocket, WebSocketDisconnect, Depends,
                     WebSocketException, status)

from TaskDesk.tasks import atask
from tdauth.models import User
from news.models import News, Mark
from news.tasks import fetch_all_news

from api.authentication import Authentication
from api.router import TaskDeskAPIRouter
from api.schema.news import NewsData, NewsQuery, NewsRequest, NewsMeta


NEWS_PER_ONE_REQUEST_LIMIT = 10

logger = logging.getLogger('api')


@TaskDeskAPIRouter.websocket("/ws/news/")
async def list_news(
    socket: WebSocket,
    user: User = Depends(Authentication()),
):
    """The endpoint implements sending of news entries and news updates."""
    try:
        await socket.accept()
        while True:
            try:
                query = NewsQuery.model_validate(await socket.receive_json())
                if query.request in (
                    NewsRequest.unread, NewsRequest.reading, NewsRequest.hidden,
                    NewsRequest.feed,
                ):
                    news_queryset = News.objects.values(
                        *NewsData.model_fields.keys())
                    if query.request == NewsRequest.unread:
                        news_queryset = news_queryset.unread_for_user(user)
                    elif query.request == NewsRequest.reading:
                        news_queryset = news_queryset.bookmarked_for_user(user)
                    elif query.request == NewsRequest.hidden:
                        news_queryset = news_queryset.hidden_for_user(user)
                    elif query.request == NewsRequest.feed and query.id:
                        news_queryset = news_queryset.unread_for_user_feed(
                            user, query.id)
                    async for news_values \
                            in news_queryset[:NEWS_PER_ONE_REQUEST_LIMIT]:
                        await socket.send_text(data=NewsData.model_validate(
                            news_values).model_dump_json())

                    await socket.send_text(data=NewsMeta.model_validate({
                        "unread": await News.objects.unread_for_user(user).acount(),
                        "reading": await Mark.objects.bookmarked_by_user(user).acount(),
                    }).model_dump_json())
                elif (
                    query.request in (NewsRequest.hide, NewsRequest.bookmark)
                    and query.id
                ):
                    await Mark.mark_news(user, query.id, Mark.Category.HIDDEN
                                         if query.request == NewsRequest.hide
                                         else Mark.Category.BOOKMARK)
                elif query.request == NewsRequest.fetch:
                    atask(fetch_all_news)
            except JSONDecodeError:
                logger.exception(f"Error on news list websocket endpoint "
                                 f"request processing. UID:{user.id}")
                raise WebSocketException(code = status.WS_1003_UNSUPPORTED_DATA)
    except WebSocketDisconnect:
        pass