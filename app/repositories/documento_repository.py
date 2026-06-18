from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.documento import Documento, PrioridadeEnum


class DocumentoRepository:
    def criar(
        self,
        db: Session,
        nome: str,
        prioridade: PrioridadeEnum,
        tipo_documento: str,
        caminho_arquivo: str,
        usuario_id: int,
    ) -> Documento:
        doc = Documento(
            nome=nome,
            prioridade=prioridade,
            tipo_documento=tipo_documento,
            caminho_arquivo=caminho_arquivo,
            usuario_id=usuario_id,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    def buscar_por_id(self, db: Session, documento_id: int) -> Optional[Documento]:
        return db.query(Documento).filter(Documento.id == documento_id).first()

    def listar_por_usuario(self, db: Session, usuario_id: int) -> List[Documento]:
        return db.query(Documento).filter(Documento.usuario_id == usuario_id).all()

    def listar_todos(self, db: Session) -> List[Documento]:
        return db.query(Documento).all()

    def atualizar(self, db: Session, documento_id: int, dados: dict) -> Optional[Documento]:
        doc = db.query(Documento).filter(Documento.id == documento_id).first()
        if doc:
            for key, value in dados.items():
                setattr(doc, key, value)
            db.commit()
            db.refresh(doc)
        return doc

    def deletar(self, db: Session, documento_id: int) -> Optional[str]:
        """Deleta o registro e retorna o caminho do arquivo para remoção física."""
        doc = db.query(Documento).filter(Documento.id == documento_id).first()
        if not doc:
            return None
        caminho = doc.caminho_arquivo
        db.delete(doc)
        db.commit()
        return caminho
