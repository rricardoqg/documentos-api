from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario_schema import UsuarioCreateSchema
from app.core.security import hash_senha, verificar_senha, criar_token_acesso
from app.models.usuario import Usuario

usuario_repository = UsuarioRepository()

class AuthService:
  def registrar_usuario(self, db: Session, usuario_dados: UsuarioCreateSchema) -> Usuario:
    usuario_existente = usuario_repository.obter_usuario_por_email(db, email=usuario_dados.email)
    if usuario_existente:
      raise HTTPException(status_code=400, detail="Email já registrado")
    
    senha_cadastrada = hash_senha(usuario_dados.senha)
    novo_usuario = usuario_repository.criar_usuario(
      db, 
      nome=usuario_dados.nome, 
      email=usuario_dados.email, 
      senha_hash=senha_cadastrada
    )
    return novo_usuario
  
  def autenticar_usuario(self, db: Session, email: str, senha: str) -> str:
    usuario = usuario_repository.obter_usuario_por_email(db, email)

    if not usuario or not verificar_senha(senha, usuario.senha_hash):
      raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    if not usuario.ativo:
      raise HTTPException(status_code=403, detail="Usuário inativo")
    
    token = criar_token_acesso(data={"sub": usuario.email, "user_id": usuario.id,"is_admin": usuario.is_admin})

    return token
  
auth_service = AuthService()
