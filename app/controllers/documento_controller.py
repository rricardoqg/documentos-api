from typing import List

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.documento import PrioridadeEnum
from app.schemas.documento_schema import DocumentoResponse, DocumentoUpdateSchema
from app.services.documento_service import documento_service


class DocumentoController:
    def upload(
        self,
        db: Session,
        arquivo: UploadFile,
        nome: str,
        prioridade: PrioridadeEnum,
        usuario_id: int,
    ) -> DocumentoResponse:
        doc = documento_service.fazer_upload(db, arquivo, nome, prioridade, usuario_id)
        return DocumentoResponse.model_validate(doc)

    def listar(self, db: Session, usuario_id: int) -> List[DocumentoResponse]:
        docs = documento_service.listar_documentos(db, usuario_id)
        return [DocumentoResponse.model_validate(d) for d in docs]

    def listar_todos(self, db: Session) -> List[DocumentoResponse]:
        docs = documento_service.listar_todos(db)
        return [DocumentoResponse.model_validate(d) for d in docs]

    def buscar(self, db: Session, documento_id: int, usuario_id: int, is_admin: bool) -> DocumentoResponse:
        doc = documento_service.buscar_documento(db, documento_id, usuario_id, is_admin)
        return DocumentoResponse.model_validate(doc)

    def atualizar(
        self,
        db: Session,
        documento_id: int,
        dados: DocumentoUpdateSchema,
        usuario_id: int,
        is_admin: bool,
    ) -> DocumentoResponse:
        doc = documento_service.atualizar_documento(db, documento_id, dados, usuario_id, is_admin)
        return DocumentoResponse.model_validate(doc)

    def deletar(self, db: Session, documento_id: int, usuario_id: int, is_admin: bool):
        documento_service.deletar_documento(db, documento_id, usuario_id, is_admin)


documento_controller = DocumentoController()
