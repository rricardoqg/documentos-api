from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional 



class UsuarioCreateSchema(BaseModel):
    nome: str = Field(...,min_length=3, max_length=255)
    email: EmailStr
    senha: str = Field(..., min_length=8, max_length=255)

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    criado_em: datetime
    atualizado_em: Optional[datetime] = None  
    is_admin: bool
    ativo: bool

    class Config:
        from_attributes = True