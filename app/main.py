from fastapi import FastAPI
from app.routers import auth_router
from app.database import engine, Base
from app.models import usuario, documento

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Documentos API", description="API para gerenciamento de documentos", version="1.0")

app.include_router(auth_router.router)

@app.get("/")
def root():
    return {"message": "Bem-vindo à Documentos API!"}