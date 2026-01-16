"""
News app related data models.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from TaskDesk.models import TaskDeskBaseModel


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
        self.url = self.url.lower()

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

    guid = models.CharField(_("GUID"), max_length=32, blank=True)
    title = models.CharField(_("Title"), max_length=128, blank=False,
                             null=False)
    description = models.TextField(_("Description"), blank=True)
    link = models.URLField(_("Link"), max_length=256, blank=False, null=False)
    author = models.CharField(_("Author"), max_length=32, blank=True)
    enclosure_url = models.URLField(_("Enclosure URL"), max_length=256,
                                    blank=True)
    enclosure_type = models.CharField(_("Enclosure type"), max_length=32,
                                      blank=True)

    published = models.DateTimeField(_("Published"), blank=False, null=False,
                                     db_index=True)

    class Meta:
        verbose_name = _("News")
        verbose_name_plural = _("News")
        db_table = "news"
        ordering = ("-published",)
        constraints = (models.UniqueConstraint(
            fields=('feed', 'guid',), name='unique_feed_guid'),)

    def __str__(self):
        return f"{self.__class__.__name__} (id={self.id}) [{self.title[:16]}]"


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

    class Meta:
        verbose_name = _("Mark")
        verbose_name_plural = _("Marks")
        db_table = 'mark'
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
        'news.Feed', on_delete=models.CASCADE, related_name='newsfilters',
        verbose_name=_('Feed'), null=True, blank=True
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
        return await super(Filter, self).save(*args, **kwargs)