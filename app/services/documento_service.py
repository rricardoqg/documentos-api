import os
import uuid
from pathlib import Path
from typing import List

from fastapi import HTTPException, UploadFile

from app.models.documento import Documento, PrioridadeEnum
from app.repositories.documento_repository import DocumentoRepository
from app.schemas.documento_schema import DocumentoUpdateSchema
from sqlalchemy.orm import Session

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
TIPOS_PERMITIDOS = {"pdf", "docx", "xlsx", "png", "jpg", "jpeg"}
TAMANHO_MAXIMO = 10 * 1024 * 1024  # 10 MB

documento_repository = DocumentoRepository()


class DocumentoService:
    def _garantir_diretorio_upload(self):
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    def _validar_arquivo(self, arquivo: UploadFile, conteudo: bytes):
        extensao = Path(arquivo.filename).suffix.lstrip(".").lower()
        if extensao not in TIPOS_PERMITIDOS:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo não permitido. Permitidos: {', '.join(TIPOS_PERMITIDOS)}",
            )
        if len(conteudo) > TAMANHO_MAXIMO:
            raise HTTPException(status_code=400, detail="Arquivo excede o limite de 10 MB")
        return extensao

    def fazer_upload(
        self,
        db: Session,
        arquivo: UploadFile,
        nome: str,
        prioridade: PrioridadeEnum,
        usuario_id: int,
    ) -> Documento:
        self._garantir_diretorio_upload()
        conteudo = arquivo.file.read()
        extensao = self._validar_arquivo(arquivo, conteudo)

        nome_arquivo = f"{uuid.uuid4()}.{extensao}"
        caminho_absoluto = UPLOAD_DIR / nome_arquivo
        caminho_absoluto.write_bytes(conteudo)

        return documento_repository.criar(
            db=db,
            nome=nome,
            prioridade=prioridade,
            tipo_documento=extensao,
            caminho_arquivo=str(caminho_absoluto),
            usuario_id=usuario_id,
        )

    def buscar_documento(self, db: Session, documento_id: int, usuario_id: int, is_admin: bool) -> Documento:
        doc = documento_repository.buscar_por_id(db, documento_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        if not is_admin and doc.usuario_id != usuario_id:
            raise HTTPException(status_code=403, detail="Acesso negado")
        return doc

    def listar_documentos(self, db: Session, usuario_id: int) -> List[Documento]:
        return documento_repository.listar_por_usuario(db, usuario_id)

    def listar_todos(self, db: Session) -> List[Documento]:
        return documento_repository.listar_todos(db)

    def atualizar_documento(
        self,
        db: Session,
        documento_id: int,
        dados: DocumentoUpdateSchema,
        usuario_id: int,
        is_admin: bool,
    ) -> Documento:
        self.buscar_documento(db, documento_id, usuario_id, is_admin)
        atualizacoes = {k: v for k, v in dados.model_dump().items() if v is not None}
        doc = documento_repository.atualizar(db, documento_id, atualizacoes)
        return doc

    def deletar_documento(self, db: Session, documento_id: int, usuario_id: int, is_admin: bool):
        self.buscar_documento(db, documento_id, usuario_id, is_admin)
        caminho = documento_repository.deletar(db, documento_id)
        if caminho and os.path.exists(caminho):
            os.remove(caminho)


documento_service = DocumentoService()
