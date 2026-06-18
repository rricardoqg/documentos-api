from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.documento import PrioridadeEnum

class DocumentoCreate(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    prioridade: PrioridadeEnum = Field(default=PrioridadeEnum.media)
    usuario_id: int
    tipo_documento: str = Field(..., max_length=50)
    caminho_arquivo: str = Field(..., max_length=500)

class DocumentoResponse(BaseModel):
    id: int
    nome: str
    prioridade: PrioridadeEnum
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    usuario_id: int
    tipo_documento: str
    caminho_arquivo: str

    class Config:
        from_attributes = True