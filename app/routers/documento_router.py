from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.controllers.documento_controller import documento_controller
from app.core.security import get_admin_atual, get_usuario_atual
from app.database import get_db
from app.models.documento import PrioridadeEnum
from app.schemas.documento_schema import DocumentoResponse, DocumentoUpdateSchema

router = APIRouter(prefix="/documentos", tags=["documentos"])


@router.post("/upload", response_model=DocumentoResponse, status_code=status.HTTP_201_CREATED)
async def upload_documento(
    arquivo: UploadFile = File(...),
    nome: str = Form(..., min_length=3, max_length=255),
    prioridade: PrioridadeEnum = Form(default=PrioridadeEnum.media),
    current_user: dict = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return documento_controller.upload(db, arquivo, nome, prioridade, current_user["user_id"])


# ATENÇÃO: rota estática /admin/todos DEVE vir antes de /{id}
@router.get("/admin/todos", response_model=List[DocumentoResponse])
def listar_todos_documentos(
    _: dict = Depends(get_admin_atual),
    db: Session = Depends(get_db),
):
    return documento_controller.listar_todos(db)


@router.get("/", response_model=List[DocumentoResponse])
def listar_documentos(
    current_user: dict = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return documento_controller.listar(db, current_user["user_id"])


@router.get("/{documento_id}", response_model=DocumentoResponse)
def buscar_documento(
    documento_id: int,
    current_user: dict = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return documento_controller.buscar(db, documento_id, current_user["user_id"], current_user["is_admin"])


@router.put("/{documento_id}", response_model=DocumentoResponse)
def atualizar_documento(
    documento_id: int,
    dados: DocumentoUpdateSchema,
    current_user: dict = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return documento_controller.atualizar(db, documento_id, dados, current_user["user_id"], current_user["is_admin"])


@router.delete("/{documento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_documento(
    documento_id: int,
    current_user: dict = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    documento_controller.deletar(db, documento_id, current_user["user_id"], current_user["is_admin"])
