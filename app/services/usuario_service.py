from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository

usuario_repository = UsuarioRepository()


class UsuarioService:
    def listar_usuarios(self, db: Session) -> List[Usuario]:
        return usuario_repository.listar_usuarios(db)

    def buscar_usuario(self, db: Session, usuario_id: int) -> Usuario:
        usuario = usuario_repository.obter_usuario_por_id(db, usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return usuario

    def desativar_usuario(self, db: Session, usuario_id: int) -> Usuario:
        usuario = self.buscar_usuario(db, usuario_id)
        if not usuario.ativo:
            raise HTTPException(status_code=400, detail="Usuário já está inativo")
        usuario.ativo = False
        db.commit()
        db.refresh(usuario)
        return usuario


usuario_service = UsuarioService()
