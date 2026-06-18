from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base

class PrioridadeEnum(str, Enum):
    baixa = 'baixa'
    media = 'media'
    alta = 'alta'

class Documento(Base):
    __tablename__ = 'documentos'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)

    prioridade = Column(
        SQLEnum(PrioridadeEnum),
        nullable=False,
        default=PrioridadeEnum.media
    )

    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    tipo_documento = Column(String(50), nullable=False)
    caminho_arquivo = Column(String(500), nullable=False)