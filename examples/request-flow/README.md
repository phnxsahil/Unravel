# A small source and check fixture

Connect this folder in Ravel to inspect a React request and FastAPI route with a storage helper. It is an analysis fixture, not a complete installable application.

Its existing `npm test` runs a real Node assertion about route-prefix construction. It does not test FastAPI, persistence, or end-to-end browser behavior. This makes check scope visible while learning.

Edit `store.py` externally, refresh source, and compare the captured versions. Ravel never changes these files for you.
