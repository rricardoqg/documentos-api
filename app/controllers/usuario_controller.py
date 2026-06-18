from typing import List

from sqlalchemy.orm import Session

from app.schemas.usuario_schema import UsuarioResponse
from app.services.usuario_service import usuario_service


class UsuarioController:
    def listar(self, db: Session) -> List[UsuarioResponse]:
        usuarios = usuario_service.listar_usuarios(db)
        return [UsuarioResponse.model_validate(u) for u in usuarios]

    def buscar(self, db: Session, usuario_id: int) -> UsuarioResponse:
        usuario = usuario_service.buscar_usuario(db, usuario_id)
        return UsuarioResponse.model_validate(usuario)

    def desativar(self, db: Session, usuario_id: int) -> UsuarioResponse:
        usuario = usuario_service.desativar_usuario(db, usuario_id)
        return UsuarioResponse.model_validate(usuario)


usuario_controller = UsuarioController()
