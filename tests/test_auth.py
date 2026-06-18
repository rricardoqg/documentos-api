import pytest
from fastapi.testclient import TestClient


REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"
ME_URL = "/auth/me"

USUARIO_VALIDO = {"nome": "João Silva", "email": "joao@example.com", "senha": "senha123"}


def test_register_sucesso(client: TestClient):
    resp = client.post(REGISTER_URL, json=USUARIO_VALIDO)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == USUARIO_VALIDO["email"]
    assert data["nome"] == USUARIO_VALIDO["nome"]
    assert "senha" not in data


def test_register_email_duplicado(client: TestClient):
    client.post(REGISTER_URL, json=USUARIO_VALIDO)
    resp = client.post(REGISTER_URL, json=USUARIO_VALIDO)
    assert resp.status_code == 400
    assert "Email" in resp.json()["detail"] or "já" in resp.json()["detail"]


def test_register_nome_curto(client: TestClient):
    payload = {**USUARIO_VALIDO, "nome": "AB"}
    resp = client.post(REGISTER_URL, json=payload)
    assert resp.status_code == 422


def test_register_senha_curta(client: TestClient):
    payload = {**USUARIO_VALIDO, "senha": "123"}
    resp = client.post(REGISTER_URL, json=payload)
    assert resp.status_code == 422


def test_login_sucesso(client: TestClient):
    client.post(REGISTER_URL, json=USUARIO_VALIDO)
    resp = client.post(LOGIN_URL, json={"email": USUARIO_VALIDO["email"], "senha": USUARIO_VALIDO["senha"]})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_senha_errada(client: TestClient):
    client.post(REGISTER_URL, json=USUARIO_VALIDO)
    resp = client.post(LOGIN_URL, json={"email": USUARIO_VALIDO["email"], "senha": "errada123"})
    assert resp.status_code == 401


def test_login_email_inexistente(client: TestClient):
    resp = client.post(LOGIN_URL, json={"email": "naoexiste@example.com", "senha": "qualquer"})
    assert resp.status_code == 401


def test_me_com_token_valido(client: TestClient):
    client.post(REGISTER_URL, json=USUARIO_VALIDO)
    login = client.post(LOGIN_URL, json={"email": USUARIO_VALIDO["email"], "senha": USUARIO_VALIDO["senha"]})
    token = login.json()["access_token"]

    resp = client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == USUARIO_VALIDO["email"]


def test_me_sem_token(client: TestClient):
    resp = client.get(ME_URL)
    assert resp.status_code == 403


def test_me_token_invalido(client: TestClient):
    resp = client.get(ME_URL, headers={"Authorization": "Bearer token.falso.aqui"})
    assert resp.status_code == 401
