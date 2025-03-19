"""
Local build settings for Notes project.
"""

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "notes",
        "USER": "notes",
        "PASSWORD": "notes",
        "HOST": "localhost",
        "PORT": "5432",
    }
}