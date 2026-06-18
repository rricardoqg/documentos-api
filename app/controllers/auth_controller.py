from sqlalchemy.orm import Session
from app.services.auth_service import auth_service
from app.schemas.usuario_schema import UsuarioCreateSchema, UsuarioResponse
from app.schemas.auth_schema import LoginSchema, TokenSchema

class AuthController:
    def registrar(self, db: Session, usuario_dados: UsuarioCreateSchema) -> UsuarioResponse:
        novo_usuario = auth_service.registrar_usuario(db, usuario_dados)
        return UsuarioResponse.model_validate(novo_usuario)

    def autenticar(self, db: Session, login_dados: LoginSchema) -> TokenSchema:
        token = auth_service.autenticar_usuario(db, login_dados.email, login_dados.senha)
        return TokenSchema(access_token=token)

auth_controller = AuthController()