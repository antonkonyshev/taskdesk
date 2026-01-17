"""
News feeds management HTTP API endpoints.
"""

from fastapi import Depends, status

from tdauth.models import User
from news.models import Feed, UserFeed

from api.schema.feed import FeedData
from api.authentication import Authentication
from api.router import TaskDeskAPIRouter


@TaskDeskAPIRouter.get("/feed/", response_model=list[FeedData])
async def list_feeds(user: User = Depends(Authentication())):
    """The endpoint responds with user news feeds list."""
    feeds = []
    async for userfeed in UserFeed.objects.select_related('feed').filter(user_id=user.id):
        feeds.append(FeedData.from_user_feed(userfeed))
    return feeds


@TaskDeskAPIRouter.post("/feed/", response_model=FeedData)
@TaskDeskAPIRouter.post("/feed/{feed_id}/", response_model=FeedData)
async def update_feed(
    feeddata: FeedData,
    feed_id: int | None = None,
    user: User = Depends(Authentication())
):
    """The endpoint creates or updates a news feed records."""
    feeddata.url = feeddata.url.lower().strip()
    feed = None
    if feed_id:
        feed = await Feed.objects.filter(id=feed_id).afirst()
    if not feed:
        feed = await Feed.objects.filter(url=feeddata.url).afirst()
    if not feed:
        feed = Feed(url=feeddata.url)
        await feed.asave()
    userfeed = await user.feeds.select_related('feed').filter(
        feed_id=feed.id).afirst()
    if not userfeed:
        userfeed = UserFeed(user=user, feed=feed, title=feeddata.title)
        await userfeed.asave()
    elif userfeed.title != feeddata.title:
        userfeed.title = feeddata.title
        await userfeed.asave()
    return FeedData.from_user_feed(userfeed)


@TaskDeskAPIRouter.delete("/feed/{userfeed_id}/",
                          status_code=status.HTTP_204_NO_CONTENT)
async def delete_feed(userfeed_id: int, user: User = Depends(Authentication())):
    """The endpoint removes a relation between a user and a news feed."""
    userfeed = await user.feeds.filter(feed_id=userfeed_id).afirst()
    if userfeed:
        await userfeed.adelete()
