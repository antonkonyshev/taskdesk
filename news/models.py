"""
News app related data models.
"""

from collections.abc import Iterable

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings

from TaskDesk.models import TaskDeskBaseModel
from TaskDesk.tasks import atask
from tdauth.models import User


class Feed(TaskDeskBaseModel):
    """News feed shared amoung users."""
    url = models.URLField(_('URL'), max_length=256, blank=False, null=False,
                          unique=True)

    class Meta:
        verbose_name = _("Feed")
        verbose_name_plural = _("Feeds")
        db_table = "feed"
        ordering = ('-created',)

    def __str__(self):
        return f"{self.__class__.__name__} (id={self.id}) [{self.url[:16]}]"

    def before_save(self):
        self.url = self.url.lower().strip()

    def save(self, *args, **kwargs):
        self.before_save()
        return super(Feed, self).save(*args, **kwargs)

    async def asave(self, *args, **kwargs):
        self.before_save()
        return await super(Feed, self).asave(*args, **kwargs)


class UserFeed(TaskDeskBaseModel):
    """Relation many-to-many between news feeds and users."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='feeds', verbose_name=_('User'), null=False
    )
    feed = models.ForeignKey(
        'news.Feed', on_delete=models.CASCADE, related_name='userfeeds',
        verbose_name=_('Feed'), null=False
    )
    title = models.CharField(_("Title"), max_length=64, blank=True, default='')

    class UserFeedQuerySet(models.QuerySet):
        """Customization of queryset manager for user feed subscriptions."""
        def for_active_users(self):
            return self.filter(user__is_active=True)

        def active_for_feed(self, feed: int | Feed):
            return self.filter(
                **{'feed' if isinstance(feed, Feed) else 'feed_id': feed}
            ).for_active_users()

        def by_user(self, user: int | User):
            return self.filter(
                **{'user' if isinstance(user, User) else 'user_id': user})

    objects = UserFeedQuerySet.as_manager()

    class Meta:
        verbose_name = _("User feed")
        verbose_name_plural = _("User feeds")
        db_table = "user_feed"
        ordering = ('-created',)
        indexes = (models.Index(fields=('created',),
                                name='userfeed_created_idx'),)

    def __str__(self):
        return (f"{self.__class__.__name__} (id={self.id}) "
                f"[UID: {self.user_id} FID: {self.feed_id}]")


class News(TaskDeskBaseModel):
    """News entity got from a certain feed and shared amoung users."""
    feed = models.ForeignKey(
        'news.Feed', on_delete=models.CASCADE, related_name='news',
        verbose_name=_('Feed'), null=False
    )

    guid = models.CharField(_("GUID"), max_length=32, blank=False, null=False)
    title = models.CharField(_("Title"), max_length=128, blank=False,
                             null=False)
    description = models.TextField(_("Description"), blank=True, default='')
    link = models.URLField(_("Link"), max_length=256, blank=False, null=False)
    author = models.CharField(_("Author"), max_length=32, blank=True,
                              default='')
    enclosure_url = models.URLField(_("Enclosure URL"), max_length=256,
                                    blank=True, default='')
    enclosure_type = models.CharField(_("Enclosure type"), max_length=32,
                                      blank=True, default='')

    published = models.DateTimeField(_("Published"), blank=False, null=False,
                                     db_index=True)

    class NewsQuerySet(models.QuerySet):
        """Customization of the news queryset manager."""
        def unfiltered_for_user_feed(
            self, userfeed: int | UserFeed
        ):
            if not isinstance(userfeed, UserFeed):
                userfeed = UserFeed.objects.get(id=userfeed)
            news = self.filter(feed_id=userfeed.feed_id)
            last_mark = Mark.objects.values_list('news__created', flat=True)\
                .last_for_userfeed(userfeed)
            if last_mark:
                return news.filter(created__gt=last_mark)
            return news

        def by_feed_guid(self, feed: int | Feed, guid: str):
            return self.filter(**{
                'feed' if isinstance(feed, Feed) else 'feed_id': feed,
                'guid': guid,
            })

        def all_for_user(self, user: int | User):
            return self.filter(feed_id__in=UserFeed.objects\
                               .values_list('feed_id', flat=True).by_user(user))

        def unread_for_user(self, user: int | User):
            return self.all_for_user(user).exclude(
                id__in=Mark.objects.values_list('news_id', flat=True).by_user(user))

        def unread_for_user_feed(self, user: int | User, feed: int | Feed):
            return self.unread_for_user(user).filter(**{
                'feed' if isinstance(feed, Feed) else 'feed_id': feed})

        def bookmarked_for_user(self, user: int | User):
            return self.filter(
                id__in=Mark.objects.values_list('news_id', flat=True)\
                .bookmarked_by_user(user))
                       
        def hidden_for_user(self, user: int | User):
            return self.filter(
                id__in=Mark.objects.values_list('news_id', flat=True)\
                .hidden_by_user(user))

    objects = NewsQuerySet.as_manager()

    class Meta:
        verbose_name = _("News")
        verbose_name_plural = _("News")
        db_table = "news"
        ordering = ("-published",)
        indexes = (models.Index(fields=('created',), name='news_created_idx'),)
        constraints = (models.UniqueConstraint(
            fields=('feed', 'guid',), name='unique_feed_guid'),)

    def __str__(self):
        return f"{self.__class__.__name__} (id={self.id}) [{self.title[:16]}]"

    @classmethod
    def keywords(cls, content: str | TaskDeskBaseModel) -> Iterable[str]:
        return (word for word in
                (content if isinstance(content, str) else getattr(
                    content, 'title', '')).lower().strip().split()
                if len(word) > 2)


class Mark(TaskDeskBaseModel):
    """
    Relation many-to-many between users and news: bookmark on news
    made by a user.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='marks', verbose_name=_('User'), null=False
    )
    news = models.ForeignKey(
        'news.News', on_delete=models.CASCADE, related_name='marks',
        verbose_name=_("News"), null=False
    )

    newsfilter = models.ForeignKey(
        'news.Filter', on_delete=models.CASCADE, related_name='marks',
        verbose_name=_("Filter"), null=True, blank=True
    )

    class Category(models.IntegerChoices):
        HIDDEN = 1, _("Hidden")
        BOOKMARK = 2, _("Bookmark")

    category = models.PositiveSmallIntegerField(
        _("Category"), choices=Category.choices, default=Category.HIDDEN,
        blank=False, null=False
    )

    class MarkQuerySet(models.QuerySet):
        """Customization of queryset manager for the Mark model."""
        def by_user(self, user: int | User):
            return self.filter(**{
                'user' if isinstance(user, User) else 'user_id': user})

        def bookmarked_by_user(self, user: int | User):
            return self.by_user(user).filter(category=Mark.Category.BOOKMARK)

        def hidden_by_user(self, user: int | User):
            return self.by_user(user).filter(category=Mark.Category.HIDDEN)

        def last_for_user(self, user: int | User):
            return self.by_user(user).order_by('-created').first()

        def last_for_userfeed(self, userfeed: UserFeed):
            return self.by_user(userfeed.user_id)\
                .filter(news_id__in=News.objects.values_list('id', flat=True)\
                        .filter(feed_id=userfeed.feed_id))\
                .order_by('-created').first()

        async def alast_for_user(self, user: int | User):
            return await self.by_user(user).order_by('-created').afirst()

        async def alast_for_userfeed(self, userfeed: UserFeed):
            return await self.by_user(userfeed.user_id)\
                .filter(news_id__in=News.objects.values_list('id', flat=True)\
                        .filter(feed_id=userfeed.feed_id))\
                .order_by('-created').afirst()

    objects = MarkQuerySet.as_manager()

    class Meta:
        verbose_name = _("Mark")
        verbose_name_plural = _("Marks")
        db_table = 'mark'
        indexes = (models.Index(fields=('created',), name='mark_created_idx'),)
        constraints = (models.UniqueConstraint(fields=('user', 'news',),
                                               name='unique_user_news'),)

    def __str__(self):
        return (f"{self.__class__.__name__} (id={self.id}) "
                f"[UID: {self.user_id} NID: {self.news_id}]")

    @classmethod
    async def mark_news(
        cls, user: User | int, news: News | int, category: Category.values
    ):
        user_kwarg = {'user' if isinstance(user, User) else 'user_id': user}
        news_kwarg = {'news' if isinstance(news, News) else 'news_id': news}
        mark = await cls.objects.filter(**user_kwarg).filter(**news_kwarg)\
            .afirst()
        if not mark:
            mark = cls(category=category, **user_kwarg, **news_kwarg)
            await mark.asave()
        elif mark and mark.category != category:
            mark.category = category
            mark.created = timezone.now()
            await mark.asave()


class Filter(TaskDeskBaseModel):
    """News filtration rules bound to a user and optionally to a feed."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='newsfilters', verbose_name=_('User'), null=False
    )
    feed = models.ForeignKey(
        'news.UserFeed', on_delete=models.CASCADE, related_name='newsfilters',
        verbose_name=_('Feed'), null=True, blank=True,
    )

    entry = models.CharField(_("Entry"), max_length=32, blank=False, null=False)
    
    class Part(models.TextChoices):
        START = "start", _("Beginning of a word")
        END = "end", _("End of a word")
        FULL = "full", _("Whole word")
        PART = "part", _("Any part of a word")

    part = models.CharField(
        _("Part of a word"), choices=Part.choices, max_length=8, blank=False,
        null=False, default=Part.START
    )

    class FilterQuerySet(models.QuerySet):
        """Customization of queryset manager for the Filters model."""
        def applicable_to_user_feed(
            self, userfeed: int | UserFeed
        ):
            if not isinstance(userfeed, UserFeed):
                userfeed = UserFeed.objects.get(id=userfeed)
            return self.filter(user_id=userfeed.user_id).filter(
                models.Q(feed_id=userfeed.id) |
                models.Q(feed_id__isnull=True))

    objects = FilterQuerySet.as_manager()

    class Meta:
        verbose_name = _("News filter")
        verbose_name_plural = _("News filters")
        db_table = 'filter'
        ordering = ('-created',)
        indexes = (models.Index(fields=('user', 'feed',),
                                name='filter_user_feed_idx'),)

    def __str__(self):
        return f"{self.__class__.__name__} (id={self.id}) [{self.entry[:16]}]"

    def before_save(self):
        self.entry = self.entry.lower()

    def after_save(self):
        try:
            if self.feed_id:
                from news.tasks import filter_news_for_userfeed
                atask(filter_news_for_userfeed, self.feed_id)
            else:
                from news.tasks import filter_news_for_user
                atask(filter_news_for_user, self.user_id)
        except Exception as err:
            # TODO: add logging
            pass

    def save(self, *args, **kwargs):
        self.before_save()
        result = super(Filter, self).save(*args, **kwargs)
        self.after_save()
        return result
    
    async def asave(self, *args, **kwargs):
        self.before_save()
        result = await super(Filter, self).asave(*args, **kwargs)
        self.after_save()
        return result

    def apply_filter(self, words: Iterable[str]) -> bool:
        """Check whether the filter should be applied to a list of words."""
        if self.part == Filter.Part.START:
            if len([word for word in words if word.startswith(self.entry)]):
                return True
        elif self.part == Filter.Part.FULL:
            if len([word for word in words if word == self.entry]):
                return True
        elif self.part == Filter.Part.PART:
            if len([word for word in words if self.entry in word]):
                return True
        elif self.part == Filter.Part.END:
            if len([word for word in words if word.endswith(self.entry)]):
                return True
        return False