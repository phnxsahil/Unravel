from app.services.store import load

def stream():
    return {"messages": load()}
