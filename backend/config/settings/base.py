from pathlib import Path
from decouple import config
import cloudinary

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("SECRET_KEY", default="build-time-placeholder-not-for-production")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",
    # Local apps
    "apps.core",
    "apps.accounts",
    "apps.projects",
    "apps.monitoring",
    "apps.deployments",
    "apps.portfolio",
    "apps.alerts",

    "rest_framework_simplejwt.token_blacklist",
    "cloudinary",
    "cloudinary_storage",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

import os as _os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": _os.environ.get("DB_NAME", "devos"),
        "USER": _os.environ.get("DB_USER", "devos_user"),
        "PASSWORD": _os.environ.get("DB_PASSWORD", "devos_password"),
        "HOST": _os.environ.get("DB_HOST", "localhost"),
        "PORT": _os.environ.get("DB_PORT", "5432"),
        "OPTIONS": {
            "connect_timeout": 10,
        },
        "TEST": {
            "NAME": "devos_test",
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

# DRF global config
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# JWT config
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}

TELEGRAM_BOT_TOKEN = config("TELEGRAM_BOT_TOKEN", default="")
TELEGRAM_CHAT_ID = config("TELEGRAM_CHAT_ID", default="")

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Security
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# Rate limiting
RATELIMIT_USE_CACHE = "default"
RATELIMIT_FAIL_OPEN = False

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

USE_CLOUDINARY = config("USE_CLOUDINARY", default=False, cast=bool)

if USE_CLOUDINARY:
    cloudinary.config(
        cloud_name=config("CLOUDINARY_CLOUD_NAME", default="dutjjtpst"),
        api_key=config("CLOUDINARY_API_KEY", default="958168721481594"),
        api_secret=config("CLOUDINARY_API_SECRET", default="hgst_kIdPGz9K_hGd8m7FYqrqHU"),
        secure=True,
    )

    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
WEBHOOK_SECRET = config("WEBHOOK_SECRET", default="")
