# from .base import *
# from decouple import config
# import os

# DEBUG = False
# print("ALLOWED_HOSTS ENV:", config("ALLOWED_HOSTS", default="NOT_SET"))
# ALLOWED_HOSTS = config(
#     "ALLOWED_HOSTS",
#     cast=lambda v: [s.strip() for s in v.split(",")]
# )

# CORS_ALLOWED_ORIGINS = config(
#     "CORS_ALLOWED_ORIGINS",
#     cast=lambda v: [s.strip() for s in v.split(",")]
# )

# CSRF_TRUSTED_ORIGINS = config(
#     "CORS_ALLOWED_ORIGINS",
#     cast=lambda v: [s.strip() for s in v.split(",")]
# )

# # Render handles SSL termination — do not redirect internally
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# SECURE_SSL_REDIRECT = False
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_CONTENT_TYPE_NOSNIFF = True
# X_FRAME_OPTIONS = "DENY"
# SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
# SECURE_HSTS_SECONDS = 31536000
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# # Logging — structured for production log aggregators
# LOGGING = {
#     "version": 1,
#     "disable_existing_loggers": False,
#     "formatters": {
#         "json": {
#             "format": '{"time": "%(asctime)s", "level": "%(levelname)s", "module": "%(module)s", "message": "%(message)s"}',
#         },
#     },
#     "handlers": {
#         "console": {
#             "class": "logging.StreamHandler",
#             "formatter": "json",
#         },
#     },
#     "root": {
#         "handlers": ["console"],
#         "level": "WARNING",
#     },
#     "loggers": {
#         "django": {
#             "handlers": ["console"],
#             "level": "WARNING",
#             "propagate": False,
#         },
#         "apps": {
#             "handlers": ["console"],
#             "level": "INFO",
#             "propagate": False,
#         },
#     },
# }


from .base import *
from decouple import config
import os

DEBUG = False

# Parse comma-separated hosts safely
_allowed_hosts = os.environ.get("ALLOWED_HOSTS", "")
ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts.split(",") if h.strip()]
_cors_origins = os.environ.get("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins.split(",") if o.strip()]

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

# Render handles SSL termination
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": '{"time": "%(asctime)s", "level": "%(levelname)s", "module": "%(module)s", "message": "%(message)s"}',
        },
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "apps": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
EOF