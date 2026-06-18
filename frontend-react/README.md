# Documentos — Frontend (React + Vite)

Frontend em React para a API de Gestão de Documentos. Visual minimalista
estilo Notion: paleta neutra, muito whitespace, sombras suaves.

## Pré-requisitos

- **Node.js 18+** e **npm** instalados ([nodejs.org](https://nodejs.org)).
  Verifique com:
  ```bash
  node --version
  npm --version
  ```
- A **API rodando** em `http://127.0.0.1:8000` (veja o backend FastAPI na raiz).

## Instalação

A partir da pasta `frontend-react/`:

```bash
npm install
```

## Rodar em desenvolvimento

```bash
npm run dev
```

Abre em **http://localhost:5173**.

## Build de produção

```bash
npm run build     # gera a pasta dist/
npm run preview   # serve o build localmente para conferir
```

## Configuração da URL da API

A URL base é lida da variável de ambiente `VITE_API_URL` (arquivo `.env`).
Padrão: `http://127.0.0.1:8000`. Para apontar para outra API, edite o `.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

## CORS (backend)

O FastAPI precisa liberar a origem do Vite. Em `app/main.py`:

```python
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Estrutura

```
src/
├── main.jsx              # entrada: Router + ToastProvider + AuthProvider
├── App.jsx               # rotas (públicas, protegidas e admin)
├── index.css            # design system (variáveis CSS estilo Notion)
├── services/
│   └── api.js           # axios + interceptors (injeta JWT, trata 401)
├── context/
│   └── AuthContext.jsx  # estado global de auth (user, token, login, logout)
├── utils/
│   └── format.js        # helpers de data e prioridade
├── components/
│   ├── Button.jsx       Spinner.jsx     Modal.jsx
│   ├── Toast.jsx        Icons.jsx       Sidebar.jsx
│   ├── Layout.jsx       ProtectedRoute.jsx
│   ├── DocCard.jsx      UploadModal.jsx
│   ├── EditDocModal.jsx ConfirmModal.jsx
└── pages/
    ├── Login.jsx        # login/cadastro alternável
    ├── Dashboard.jsx    # documentos do usuário
    └── Admin.jsx        # todos os documentos + usuários (admin only)
```

## Rotas

| Rota     | Acesso                    | Descrição                          |
|----------|---------------------------|------------------------------------|
| `/login` | Público                   | Login e cadastro                   |
| `/`      | Autenticado               | Documentos do usuário logado       |
| `/admin` | Autenticado + `is_admin`  | Todos os documentos e usuários     |

O token JWT fica no `localStorage`. Em respostas `401`, o interceptor limpa a
sessão e o usuário é redirecionado para `/login` automaticamente.
