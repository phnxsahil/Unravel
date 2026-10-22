from fastapi import FastAPI
from app.routes import chat, memory

app = FastAPI()
app.include_router(chat.router, prefix="/chat")
app.include_router(memory.router)
