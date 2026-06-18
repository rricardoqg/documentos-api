import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_TEST_URL = "sqlite://"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture
def usuario_e_token(client):
    """Registra um usuário comum e retorna (usuario_data, token)."""
    payload = {"nome": "Teste User", "email": "teste@example.com", "senha": "senha123"}
    client.post("/auth/register", json=payload)
    resp = client.post("/auth/login", json={"email": payload["email"], "senha": payload["senha"]})
    token = resp.json()["access_token"]
    return payload, token


@pytest.fixture
def headers_auth(usuario_e_token):
    _, token = usuario_e_token
    return {"Authorization": f"Bearer {token}"}
