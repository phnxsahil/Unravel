"""ASGI entrypoint for the Ravel local workshop."""
from apps.ravel.api import create_app

app = create_app()
