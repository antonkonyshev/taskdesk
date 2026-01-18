"""
News app related data models.
"""

from collections.abc import Iterable

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from TaskDesk.models import TaskDeskBaseModel
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
                **{'feed' if isinstance(feed, Feed) else 'feed_id'}
            ).for_active_users()

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
                "[UID: {self.user_id} FID: {self.feed_id}]")


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
        def unfiltered_for_user_feed(self, user: int | User, feed: int | Feed):
            news = self.filter(**{
                'feed' if isinstance(feed, Feed) else 'feed_id': feed})
            return news.filter(created__gt=Mark.objects.values_list(
                'news__created', flat=True).last_for_user(user))

        def by_feed_guid(self, feed: int | Feed, guid: str):
            return self.filter(**{
                'feed' if isinstance(feed, Feed) else 'feed_id': feed,
                'guid': guid,
            })

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
    def keywords(cls, content: str) -> Iterable[str]:
        return (word for word in content.lower().strip().split()
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

        def last_for_user(self, user: int | User):
            return self.by_user(user).order_by('-created').first()

        async def alast_for_user(self, user: int | User):
            return await self.by_user(user).order_by('-created').afirst()

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
                "[UID: {self.user_id} NID: {self.news_id}]")



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
        def applicable_to_user_feed(self, user: int | User, feed: int | Feed):
            return self.filter(
                **{'user' if isinstance(user, User) else 'user_id': user}
            ).filter(
                models.Q(
                    **{'feed' if isinstance(feed, Feed) else 'feed_id': feed}
                ) | models.Q(feed_id__isnull=True)
            )

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

    def save(self, *args, **kwargs):
        self.before_save()
        return super(Filter, self).save(*args, **kwargs)
    
    async def asave(self, *args, **kwargs):
        self.before_save()
        return await super(Filter, self).asave(*args, **kwargs)

    def apply_filter(words: Iterable[str]) -> bool:
        """Check whether the filter should be applied to a list of words."""
        if filter.part == Filter.Part.START:
            if len([word for word in words if word.startswith(filter.entry)]):
                return True
        elif filter.part == Filter.Part.FULL:
            if len([word for word in words if word == filter.entry]):
                return True
        elif filter.part == Filter.Part.PART:
            if len([word for word in words if filter.entry in word]):
                return True
        elif filter.part == Filter.Part.END:
            if len([word for word in words if word.endswith(filter.entry)]):
                return True
        return False