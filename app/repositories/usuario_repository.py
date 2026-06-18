from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioCreateSchema

class UsuarioRepository:
  def criar_usuario(self, db: Session, nome:str, email:str, senha_hash:str) -> Usuario:
    db_usuario = Usuario(nome=nome, email=email, senha_hash=senha_hash)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario
  
  def obter_usuario_por_email(self, db: Session, email: str) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.email == email).first()
  
  def obter_usuario_por_id(self, db: Session, usuario_id: int) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()
  
  def listar_usuarios(self, db: Session) -> List[Usuario]:
    return db.query(Usuario).all()
  
  def atualizar_usuario(self, db: Session, usuario_id: int, usuario_atualizado: UsuarioCreateSchema) -> Optional[Usuario]:
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if db_usuario:
      db_usuario.nome = usuario_atualizado.nome
      db_usuario.email = usuario_atualizado.email
      db.commit()
      db.refresh(db_usuario)
    return db_usuario
  def deletar_usuario(self, db: Session, usuario_id: int) -> bool:
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if db_usuario:
      db.delete(db_usuario)
      db.commit()
      return True
    return False
  