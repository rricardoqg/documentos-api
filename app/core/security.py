import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "chave-padrao-desenvolvimento")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(senha_texto_puro: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_texto_puro, senha_hash)


def criar_token_acesso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    dados_copia = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    dados_copia.update({"exp": expire})
    token = jwt.encode(dados_copia, SECRET_KEY, algorithm=ALGORITHM)
    return token


def verificar_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.JWTError:
        return None