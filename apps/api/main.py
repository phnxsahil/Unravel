"""Legacy ASGI entrypoint for Unravel's local API."""
from apps.unravel.api import create_app

app = create_app()
