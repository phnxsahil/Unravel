from fastapi import FastAPI, HTTPException
app = FastAPI()
@app.get('/api/search')
def search(q: str = '', variant: str = 'correct'):
    if variant == 'broken':
        raise HTTPException(500, 'Deliberate failure')
    if variant == 'ambiguous':
        return {'items': ['A result'], 'accepted': True}
    return {'results': [item for item in ['React', 'FastAPI', 'SQLite'] if q.lower() in item.lower()]}
