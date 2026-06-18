from fastapi import FastAPI
from app.routers import auth_router, documento_router, usuario_router
from app.database import engine, Base
from app.models import usuario, documento

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Documentos API",
    description="API para gerenciamento de documentos com autenticação JWT",
    version="1.0",
)

app.include_router(auth_router.router)
app.include_router(documento_router.router)
app.include_router(usuario_router.router)


@app.get("/")
def root():
    return {"message": "Bem-vindo à Documentos API!"}