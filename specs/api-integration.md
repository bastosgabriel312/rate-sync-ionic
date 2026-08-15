# Integração com API — Estado Atual

Contratos entre o frontend (`rate-sync-ionic/`) e o backend (`rate-sync/`), baseados no código existente.

---

## Configuração base

| Ambiente | Arquivo | `apiDomain` |
|---|---|---|
| Desenvolvimento | `rate-sync-ionic/src/environments/environment.ts` | `https://localhost:8000/api/v1` |
| Produção | `rate-sync-ionic/src/environments/environment.prod.ts` | `https://rate-sync-production.up.railway.app/api/v1` |

Todos os serviços HTTP/WebSocket constroem URLs a partir de `environment.apiDomain`.

---

## Endpoints consumidos pelo frontend

### 1. WebSocket — busca de filmes

| Aspecto | Valor |
|---|---|
| **Frontend** | `ApiService` → `WebsocketService.connect()` |
| **URL construída** | `{apiDomain}/ws/find_movie/` |
| **Backend** | `@router.websocket("/ws/find_movie/")` em `rate-sync/app/api/v1/routes.py` |
| **Arquivo frontend** | `rate-sync-ionic/src/app/services/api.service.ts` |

**Envio (frontend):**

```typescript
// websocket.service.ts
this.ws.send(JSON.stringify(data));
// data = query string (ex: "avatar")
// Resultado enviado: '"avatar"' (JSON string com aspas)
```

**Recebimento (backend):**

```python
# routes.py
movie_title = await websocket.receive_text()
# Espera texto puro: "avatar"
```

**Resposta (backend → frontend):**

```python
await websocket.send_json(jsonable_encoder(movie))
# movie: list[{ title, overview, poster_path }] ou { error: string }
```

**Parsing (frontend):**

```typescript
// home.page.ts
const parsedData = JSON.parse(data);
if (parsedData.error) throw new Error(parsedData.error);
this.movieResults = parsedData;
```

#### Incompatibilidades identificadas

| # | Problema | Frontend | Backend |
|---|---|---|---|
| 1 | Scheme WebSocket | URL usa `https://` no construtor `WebSocket` | Requer `ws://` ou `wss://` |
| 2 | Formato do payload | `JSON.stringify(query)` | `receive_text()` espera texto puro |
| 3 | Envio enquanto desconectado | Mensagem descartada se `readyState !== OPEN` | N/A |

---

### 2. HTTP GET — filmes populares

| Aspecto | Valor |
|---|---|
| **Frontend** | `ApiService.getMorePopulars()` |
| **URL** | `GET {apiDomain}/more_populars` |
| **Backend** | `@router.get("/more_populars")` |
| **Consumidor** | `HomePage.requestMorePopulars()` |

**Resposta esperada pelo backend** (`rate-sync/app/infrastructure/api_clients/tmdb_client.py`):

```json
[
  { "title": "string", "overview": "string", "poster_path": "string" }
]
```

Ou objeto de erro: `{ "error": "string" }`.

**Tratamento de erro no frontend:** `console.error` — sem feedback visual ao usuário.

---

### 3. HTTP GET — ratings de filme

| Aspecto | Valor |
|---|---|
| **Frontend** | `ApiService.getMovieRatings(movie_id)` |
| **Parâmetro enviado** | `movie.title` (string) |
| **URL** | `GET {apiDomain}/ratings/{movie_id}` |
| **Backend** | `@router.get("/ratings/{movie_id}")` |
| **Consumidor** | `MovieItemComponent.requestReviews()` |

**Nota:** o parâmetro de rota no backend se chama `movie_id`, mas o use case `GetMovieRatings.execute()` recebe `movie_title: str` — o frontend envia o título, o que é compatível com a implementação backend.

**Resposta backend** (`rate-sync/app/domain/use_cases/get_movie_ratings.py`):

```json
{
  "tmdb": { "title", "rating", "vote_count" } | { "error" },
  "omdb": [ { "imdb": {...} }, { "rotten_tomatoes": {...} }, ... ] | { "error" },
  "letterboxd": { "title", "rating", "year" } | { "error" }
}
```

**Renderização frontend:** `rate-sync-ionic/src/app/components/movie-item/movie-item.component.html`

---

## Endpoints referenciados no frontend, ausentes no backend

| Endpoint | Serviço frontend | Backend |
|---|---|---|
| `GET /protected/profile` | `DataService.getProfile()` | Não identificado em `rate-sync/app/api/v1/routes.py` |
| `GET /public/hello` | `DataService.getHello()` | Não identificado em `rate-sync/app/api/v1/routes.py` |

---

## Endpoint backend não consumido pelo frontend

| Endpoint | Backend | Frontend |
|---|---|---|
| `GET /movie/?movie_title=` | `@router.get("/movie/")` em `routes.py` | Não identificado no código analisado |

---

## Autenticação na integração

### Frontend

| Componente | Comportamento |
|---|---|
| `auth.interceptor.ts` | Adiciona `Authorization: Bearer {token}` (exceto URLs Firebase/Google) |
| Registro no AppModule | **Não identificado no código analisado** |
| Token source | `AuthService.getIdToken()` (Firebase) |

### Backend

| Componente | Comportamento |
|---|---|
| `rate-sync/app/core/security.py` | Valida JWT Bearer via JWKS Cognito |
| Endpoints de filmes | **Sem autenticação** em `routes.py` |

**Conclusão:** endpoints de filmes são públicos no backend. O interceptor frontend, se registrado, enviaria token sem que o backend exija.

---

## CORS

Configuração backend (`rate-sync/app/main.py`):

```python
allow_origins=["https://ratesync.vercel.app"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

| Origin | Compatível |
|---|---|
| `https://ratesync.vercel.app` | Sim |
| `http://localhost:4200` (dev Angular) | Não listado |
| `https://rate-sync-production.up.railway.app` | Não listado |

Proxy de desenvolvimento no frontend: **não identificado no código analisado.**

---

## Recursos externos (não-backend)

| Recurso | Onde referenciado |
|---|---|
| TMDB CDN | `movie-item.component.html` → `https://image.tmdb.org/t/p/w500{poster_path}` |
| Google Fonts | `index.html` → Material Icons |
| Firebase | `AuthService` (não configurado) |

---

## Diagrama de integração

```
┌─────────────────────────────────────────────────────────┐
│  rate-sync-ionic (Frontend)                             │
│                                                         │
│  HomePage ──→ ApiService ──→ GET /more_populars         │
│           └──→ ApiService ──→ WS  /ws/find_movie/       │
│                                                         │
│  MovieItemComponent ──→ ApiService ──→ GET /ratings/:id │
│                                                         │
│  DataService ──→ GET /protected/profile  (sem backend)  │
│              └──→ GET /public/hello      (sem backend)  │
│                                                         │
│  AuthService ──→ Firebase (não integrado ao backend)    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  rate-sync (Backend FastAPI) — prefix /api/v1           │
│                                                         │
│  GET  /more_populars     → TMDBClient                   │
│  GET  /ratings/{id}      → TMDB + OMDB + Letterboxd     │
│  WS   /ws/find_movie/    → TMDBClient.find_movie        │
│  GET  /movie/            → (não consumido pelo frontend) │
└─────────────────────────────────────────────────────────┘
```

---

## Schemas backend (referência)

Definidos em `rate-sync/app/api/v1/schemas.py`:

```python
class MovieRatingResponse(BaseModel):
    omdb: dict
    tmdb: dict
    rotten_tomatoes: dict

class MovieReviewSource(BaseModel):
    title: str
    rating: float | str | None
    year: int | str | None
    error: str | None
```

**Espelhamento no frontend:** não identificado no código analisado.
