# Photo-upload source fixture

Connect this folder to Unravel to inspect React → literal request → FastAPI route. The API file mirrors the correct upload implementation of `apps/ravel/reference.py`; the bundled app additionally supplies broken and ambiguous variants and frontend serving.

From the repository root, build the frontend and start `python -m apps.ravel.cli reference --port 8017`. Run Unravel on a different port. In Experiments approve the reference URL, `/api/photo`, and the upload/click/assert steps. Source fixtures establish static relationships; only recorded runs establish observed behaviour.
