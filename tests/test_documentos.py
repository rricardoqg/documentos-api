import io
import pytest
from fastapi.testclient import TestClient


UPLOAD_URL = "/documentos/upload"
DOCUMENTOS_URL = "/documentos/"


def _fake_pdf(nome="teste.pdf"):
    return ("arquivo", (nome, io.BytesIO(b"%PDF-1.4 fake content"), "application/pdf"))


def test_upload_sucesso(client: TestClient, headers_auth):
    resp = client.post(
        UPLOAD_URL,
        data={"nome": "Contrato 2024", "prioridade": "alta"},
        files=[_fake_pdf()],
        headers=headers_auth,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["nome"] == "Contrato 2024"
    assert data["prioridade"] == "alta"
    assert data["tipo_documento"] == "pdf"


def test_upload_sem_token(client: TestClient):
    resp = client.post(
        UPLOAD_URL,
        data={"nome": "Doc", "prioridade": "media"},
        files=[_fake_pdf()],
    )
    assert resp.status_code == 403


def test_upload_tipo_invalido(client: TestClient, headers_auth):
    resp = client.post(
        UPLOAD_URL,
        data={"nome": "Script", "prioridade": "baixa"},
        files=[("arquivo", ("script.exe", io.BytesIO(b"MZ"), "application/octet-stream"))],
        headers=headers_auth,
    )
    assert resp.status_code == 400


def test_upload_arquivo_muito_grande(client: TestClient, headers_auth):
    conteudo_grande = b"x" * (10 * 1024 * 1024 + 1)
    resp = client.post(
        UPLOAD_URL,
        data={"nome": "Arquivo Grande", "prioridade": "media"},
        files=[("arquivo", ("grande.pdf", io.BytesIO(conteudo_grande), "application/pdf"))],
        headers=headers_auth,
    )
    assert resp.status_code == 400


def test_listar_documentos_proprios(client: TestClient, headers_auth):
    client.post(UPLOAD_URL, data={"nome": "Doc A"}, files=[_fake_pdf()], headers=headers_auth)
    client.post(UPLOAD_URL, data={"nome": "Doc B"}, files=[_fake_pdf()], headers=headers_auth)

    resp = client.get(DOCUMENTOS_URL, headers=headers_auth)
    assert resp.status_code == 200
    docs = resp.json()
    assert len(docs) == 2
    nomes = [d["nome"] for d in docs]
    assert "Doc A" in nomes and "Doc B" in nomes


def test_usuario_nao_ve_documentos_de_outro(client: TestClient, headers_auth):
    client.post(UPLOAD_URL, data={"nome": "Doc do User 1"}, files=[_fake_pdf()], headers=headers_auth)

    client.post("/auth/register", json={"nome": "User Dois", "email": "user2@example.com", "senha": "senha123"})
    login2 = client.post("/auth/login", json={"email": "user2@example.com", "senha": "senha123"})
    headers2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    resp = client.get(DOCUMENTOS_URL, headers=headers2)
    assert resp.status_code == 200
    assert resp.json() == []


def test_buscar_documento_por_id(client: TestClient, headers_auth):
    upload = client.post(UPLOAD_URL, data={"nome": "Relatório"}, files=[_fake_pdf()], headers=headers_auth)
    doc_id = upload.json()["id"]

    resp = client.get(f"/documentos/{doc_id}", headers=headers_auth)
    assert resp.status_code == 200
    assert resp.json()["id"] == doc_id


def test_buscar_documento_de_outro_usuario_retorna_403(client: TestClient, headers_auth):
    upload = client.post(UPLOAD_URL, data={"nome": "Privado"}, files=[_fake_pdf()], headers=headers_auth)
    doc_id = upload.json()["id"]

    client.post("/auth/register", json={"nome": "Invasor", "email": "invasor@example.com", "senha": "senha123"})
    login_inv = client.post("/auth/login", json={"email": "invasor@example.com", "senha": "senha123"})
    headers_inv = {"Authorization": f"Bearer {login_inv.json()['access_token']}"}

    resp = client.get(f"/documentos/{doc_id}", headers=headers_inv)
    assert resp.status_code == 403


def test_atualizar_documento(client: TestClient, headers_auth):
    upload = client.post(UPLOAD_URL, data={"nome": "Original"}, files=[_fake_pdf()], headers=headers_auth)
    doc_id = upload.json()["id"]

    resp = client.put(f"/documentos/{doc_id}", json={"nome": "Atualizado", "prioridade": "alta"}, headers=headers_auth)
    assert resp.status_code == 200
    assert resp.json()["nome"] == "Atualizado"
    assert resp.json()["prioridade"] == "alta"


def test_deletar_documento(client: TestClient, headers_auth):
    upload = client.post(UPLOAD_URL, data={"nome": "Para deletar"}, files=[_fake_pdf()], headers=headers_auth)
    doc_id = upload.json()["id"]

    resp = client.delete(f"/documentos/{doc_id}", headers=headers_auth)
    assert resp.status_code == 204

    resp2 = client.get(f"/documentos/{doc_id}", headers=headers_auth)
    assert resp2.status_code == 404


def test_admin_ve_todos_documentos(client: TestClient, headers_auth):
    client.post(UPLOAD_URL, data={"nome": "Doc User"}, files=[_fake_pdf()], headers=headers_auth)

    from app.repositories.usuario_repository import UsuarioRepository
    from tests.conftest import TestingSessionLocal
    from app.core.security import criar_token_acesso

    db = TestingSessionLocal()
    repo = UsuarioRepository()
    admin = repo.obter_usuario_por_email(db, "teste@example.com")
    admin.is_admin = True
    db.commit()
    db.close()

    token_admin = criar_token_acesso({"sub": "teste@example.com", "user_id": admin.id, "is_admin": True})
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    resp = client.get("/documentos/admin/todos", headers=headers_admin)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_admin_todos_rejeita_usuario_comum(client: TestClient, headers_auth):
    resp = client.get("/documentos/admin/todos", headers=headers_auth)
    assert resp.status_code == 403
