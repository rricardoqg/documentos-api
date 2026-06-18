from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.controllers.auth_controller import auth_controller
from app.schemas.auth_schema import LoginSchema, TokenSchema
from app.schemas.usuario_schema import UsuarioCreateSchema, UsuarioResponse
from app.database import get_db
from typing import List
from app.core.security import get_usuario_atual

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar(usuario_dados: UsuarioCreateSchema, db: Session = Depends(get_db)):
    return auth_controller.registrar(db, usuario_dados)

@router.post("/login", response_model=TokenSchema)
def autenticar(login_dados: LoginSchema, db: Session = Depends(get_db)):
    return auth_controller.autenticar(db, login_dados)

@router.get("/me", response_model=UsuarioResponse)
def me(
    current_user: dict = Depends(get_usuario_atual),
    db: Session = Depends(get_db)
):
    from app.repositories.usuario_repository import UsuarioRepository
    usuario_repo = UsuarioRepository()
    usuario = usuario_repo.obter_usuario_por_id(db, current_user["user_id"])
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )
    return usuario
