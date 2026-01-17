"""
News filters management HTTP API endpoints.
"""

from fastapi import Depends, status

from tdauth.models import User
from news.models import Filter

from api.schema.filter import FilterData
from api.authentication import Authentication
from api.router import TaskDeskAPIRouter


@TaskDeskAPIRouter.get("/filter/", response_model=list[FilterData])
async def list_filters(user: User = Depends(Authentication())):
    """The endpoint responds with user news filters list."""
    filters = []
    async for filter in user.newsfilters.all():
        filters.append(FilterData.from_filter(filter))
    return filters


@TaskDeskAPIRouter.post("/filter/", response_model=FilterData)
@TaskDeskAPIRouter.post("/filter/{filter_id}/", response_model=FilterData)
async def create_filter(
    filter_data: FilterData,
    filter_id: int | None = None,
    user: User = Depends(Authentication())
):
    """The endpoint creates or updates a news filters."""
    filter_data.entry = filter_data.entry.lower().strip()
    userfeed = None
    if filter_data.feed_id:
        userfeed = await user.feeds.filter(id=filter_data.feed_id).afirst()
    filter = None
    if filter_id:
        filter = await user.newsfilters.filter(id=filter_id).afirst()
    else:
        filter = await user.newsfilters.filter(
            entry=filter_data.entry, part=filter_data.part,
            feed_id=filter_data.feed_id).afirst()
        if filter:
            return FilterData.from_filter(filter)
    if filter:
        if (
            filter.entry != filter_data.entry or filter.part != filter_data.part
            or filter.feed_id != getattr(userfeed, 'feed_id', None)
        ):
            filter.entry = filter_data.entry
            filter.part = filter_data.part
            filter.feed = userfeed
            await filter.asave()
    else:
        filter = Filter(user=user, feed=userfeed, entry=filter_data.entry,
                        part=filter_data.part)
        await filter.asave()
    return FilterData.from_filter(filter)


@TaskDeskAPIRouter.delete("/filter/{filter_id}/",
                          status_code=status.HTTP_204_NO_CONTENT)
async def delete_filter(filter_id: int, user: User = Depends(Authentication())):
    """The endpoint removes a news filter belonged to an authenticated user."""
    filter = await user.newsfilters.filter(id=filter_id).afirst()
    if filter:
        await filter.adelete()