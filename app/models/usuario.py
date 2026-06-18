from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Usuario(Base):
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    is_admin = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)

