# Documentos API

API REST para gerenciamento de documentos com autenticação JWT, controle de acesso por perfil e upload de arquivos.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | FastAPI 0.137 |
| ORM | SQLAlchemy 2.0 |
| Banco de dados | PostgreSQL 15 (Docker) |
| Autenticação | JWT via python-jose |
| Hash de senha | passlib + bcrypt |
| Upload | python-multipart |
| Validação | Pydantic v2 |
| Testes | Pytest + httpx (TestClient) |

## Pré-requisitos

- Python 3.12+
- Docker e Docker Compose

## Como rodar localmente

### 1. Subir o banco de dados

```bash
cd app
docker compose up -d
```

### 2. Criar e ativar o ambiente virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python -m venv venv
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente (opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/documentos
```

### 5. Iniciar a API

```bash
uvicorn app.main:app --reload
```

Acesse a documentação interativa em: http://localhost:8000/docs

### 6. Autenticação no Swagger

1. Clique em **Authorize** (cadeado)
2. Digite `<seu_token>` no campo **HTTPBearer**
3. Clique em **Authorize**

## Rodar os testes

```bash
pytest tests/ -v
```

Os testes usam SQLite em memória — não é necessário ter o PostgreSQL rodando.

---

## Endpoints

### Auth

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/register` | Cadastrar novo usuário | Não |
| POST | `/auth/login` | Login (retorna JWT) | Não |
| GET | `/auth/me` | Dados do usuário autenticado | Sim |

**Exemplo de registro:**
```json
POST /auth/register
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "senha": "senha123"
}
```

**Exemplo de login:**
```json
POST /auth/login
{
  "email": "maria@example.com",
  "senha": "senha123"
}
```
Resposta:
```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

---

### Documentos

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/documentos/upload` | Upload de arquivo + metadados | Sim |
| GET | `/documentos/` | Lista documentos do usuário logado | Sim |
| GET | `/documentos/{id}` | Busca documento por ID | Sim |
| PUT | `/documentos/{id}` | Atualiza nome e/ou prioridade | Sim |
| DELETE | `/documentos/{id}` | Deleta documento e arquivo físico | Sim |
| GET | `/documentos/admin/todos` | Lista todos os documentos (admin) | Admin |

**Upload (multipart/form-data):**
- `arquivo` — arquivo binário (pdf, docx, xlsx, png, jpg — máx 10 MB)
- `nome` — nome do documento (3–255 caracteres)
- `prioridade` — `baixa` | `media` | `alta` (padrão: `media`)

**Atualização (JSON):**
```json
PUT /documentos/1
{
  "nome": "Contrato Revisado",
  "prioridade": "alta"
}
```

**Regras de acesso:**
- Usuário comum só acessa seus próprios documentos
- Admin acessa todos via `/documentos/admin/todos`

---

### Usuários (admin only)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/usuarios/` | Lista todos os usuários |
| GET | `/usuarios/{id}` | Busca usuário por ID |
| PUT | `/usuarios/{id}/desativar` | Desativa usuário (soft delete) |

---

## Arquitetura

```
app/
├── main.py                     # FastAPI app + registro de routers
├── database.py                 # Engine, session, get_db
├── core/
│   └── security.py             # JWT, hash, HTTPBearer, dependências de auth
├── models/
│   ├── usuario.py              # Modelo ORM Usuario
│   └── documento.py            # Modelo ORM Documento + PrioridadeEnum
├── schemas/
│   ├── auth_schema.py          # LoginSchema, TokenSchema
│   ├── usuario_schema.py       # UsuarioCreateSchema, UsuarioResponse
│   └── documento_schema.py     # DocumentoCreate, DocumentoUpdateSchema, DocumentoResponse
├── repositories/
│   ├── usuario_repository.py   # CRUD de usuários
│   └── documento_repository.py # CRUD de documentos
├── services/
│   ├── auth_service.py         # Regras de autenticação
│   ├── usuario_service.py      # Regras de negócio de usuários
│   └── documento_service.py    # Regras de negócio + upload físico
├── controllers/
│   ├── auth_controller.py      # Orquestra auth
│   ├── usuario_controller.py   # Orquestra usuários
│   └── documento_controller.py # Orquestra documentos
└── routers/
    ├── auth_router.py          # Rotas /auth
    ├── usuario_router.py       # Rotas /usuarios
    └── documento_router.py     # Rotas /documentos

uploads/                        # Arquivos enviados (gerados em runtime)
tests/
├── conftest.py                 # Fixtures, SQLite em memória, TestClient
├── test_auth.py                # Testes de autenticação
└── test_documentos.py          # Testes de upload e acesso
```

**Fluxo de dados:**

```
HTTP Request → Router → Controller → Service → Repository → DB
                                   ↓
                              Upload físico (uploads/)
```

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `SECRET_KEY` | `chave-padrao-desenvolvimento` | Chave de assinatura JWT |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/documentos` | URL do banco |

> Em produção, sempre defina `SECRET_KEY` com um valor aleatório seguro (`openssl rand -hex 32`).
