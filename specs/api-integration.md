# Integração com API — Estado Atual

Contratos entre o frontend (`rate-sync-ionic/`) e o backend (`rate-sync/`), baseados no código existente.

---

## Configuração base

| Ambiente | Arquivo | `apiDomain` |
|---|---|---|
| Desenvolvimento | `rate-sync-ionic/src/environments/environment.ts` | `http://localhost:8000/api/v1` |
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
| **Arquivo frontend** | `rate-sync-ionic/src/app/core/services/api.service.ts` |

**Envio (frontend):**

```typescript
// core/services/websocket.service.ts — converte http/https para ws/wss via toWsUrl()
this.ws = new WebSocket(this.toWsUrl(url));
this.ws.send(data);            // texto puro, sem JSON.stringify
// data = query string (ex: "avatar")
// Resultado enviado: "avatar" (texto UTF-8)
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
| 1 | Scheme WebSocket | ~~URL usa `https://`~~ → **Corrigido**: `toWsUrl()` converte `http/https` → `ws/wss` | Requer `ws://` ou `wss://` |
| 2 | Formato do payload | ~~`JSON.stringify(query)`~~ → **Corrigido**: `ws.send(texto)` (texto puro) | `receive_text()` espera texto puro |
| 3 | Envio enquanto desconectado | Mensagem descartada se `readyState !== OPEN` | N/A |

---

### 2. HTTP GET — filmes populares

| Aspecto | Valor |
|---|---|
| **Frontend** | `ApiService.getMorePopulars()` |
| **URL** | `GET {apiDomain}/more_populars` |
| **Backend** | `@router.get("/more_populars")` |
| **Consumidor** | `HomePage.requestMorePopulars()` |

**Resposta esperada pelo backend** (`rate-sync/app/infrastructure/api_clients/cinemeta_client.py`):

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
  "cinemeta": { "title", "rating", "year" } | { "error" },
  "omdb": [ { "imdb": {...} }, { "rotten_tomatoes": {...} }, ... ] | { "error" },
  "letterboxd": { "title", "rating", "year" } | { "error" }
}
```

> **Migração TMDB → Cinemeta:** a chave `tmdb` virou `cinemeta` e `vote_count` não existe mais (a Cinemeta não fornece votos). `rating` = `imdbRating` (0–10). O template `movie-item.component.html` foi atualizado para `reviews.cinemeta` (rating + ano).

**Renderização frontend:** `rate-sync-ionic/src/app/components/movie-item/movie-item.component.html`

---

## Endpoints referenciados no frontend, ausentes no backend

**Resolvido (2026-08-16, Fase 5):** os únicos consumidores desses endpoints eram o `DataService` (removido — código morto). Não há mais referências no frontend a `/protected/profile` e `/public/hello`.

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

Configuração backend (`rate-sync/app/main.py`) — usa `settings.CORS_ORIGINS`:

```python
allow_origins=["http://localhost:4200", "http://localhost:8100", "https://ratesync.vercel.app"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

| Origin | Compatível |
|---|---|
| `https://ratesync.vercel.app` | Sim |
| `http://localhost:4200` (dev Angular) | Sim |
| `http://localhost:8100` (Ionic dev) | Sim |

Proxy de desenvolvimento no frontend: **não identificado no código analisado.**

---

## Recursos externos (não-backend)

| Recurso | Onde referenciado |
|---|---|
| Poster (URL completa Cinemeta) | `movie-item.component.html` → `[src]="movie.poster_path"` (URL absoluta; sem prefixo de CDN) |
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
│  (DataService removido — 2026-08-16, endpoints inexistentes) │
│                                                         │
│  AuthService ──→ Firebase (não integrado ao backend)    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  rate-sync (Backend FastAPI) — prefix /api/v1           │
│                                                         │
│  GET  /more_populars     → CinemetaClient               │
│  GET  /ratings/{id}      → Cinemeta + OMDB + Letterboxd  │
│  WS   /ws/find_movie/    → CinemetaClient.find_movie     │
│  GET  /movie/            → (não consumido pelo frontend) │
└─────────────────────────────────────────────────────────┘
```

---

## Schemas backend (referência)

Definidos em `rate-sync/app/api/v1/schemas.py`:

```python
class MovieRatingResponse(BaseModel):
    omdb: dict
    cinemeta: dict
    letterboxd: dict

class MovieReviewSource(BaseModel):
    title: str
    rating: float | str | None
    year: int | str | None
    error: str | None
```

**Espelhamento no frontend:** não identificado no código analisado.
