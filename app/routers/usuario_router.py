from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers.usuario_controller import usuario_controller
from app.core.security import get_admin_atual
from app.database import get_db
from app.schemas.usuario_schema import UsuarioResponse

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(
    _: dict = Depends(get_admin_atual),
    db: Session = Depends(get_db),
):
    return usuario_controller.listar(db)


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def buscar_usuario(
    usuario_id: int,
    _: dict = Depends(get_admin_atual),
    db: Session = Depends(get_db),
):
    return usuario_controller.buscar(db, usuario_id)


@router.put("/{usuario_id}/desativar", response_model=UsuarioResponse)
def desativar_usuario(
    usuario_id: int,
    _: dict = Depends(get_admin_atual),
    db: Session = Depends(get_db),
):
    return usuario_controller.desativar(db, usuario_id)
