from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth_router, documento_router, usuario_router
from app.database import engine, Base
from app.models import usuario, documento

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Documentos API",
    description="API para gerenciamento de documentos com autenticação JWT",
    version="1.0",
)

# Origens permitidas (frontend React/Vite roda em :5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(documento_router.router)
app.include_router(usuario_router.router)


@app.get("/")
def root():
    return {"message": "Bem-vindo à Documentos API!"}