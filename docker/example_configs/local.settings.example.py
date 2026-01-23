"""
Local build settings for TaskDesk project.
"""

SECRET_KEY = "django-insecure-@i!@il2oj960=m6cspm-t3_ubt6^vbae%^z_k#!r5a-ftu&m=_"
CSRF_TRUSTED_ORIGINS = ["https://taskdesk.example.org"]
ALLOWED_HOSTS = ["localhost"]
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
