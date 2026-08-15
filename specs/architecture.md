# Arquitetura — Estado Atual

Documento descritivo da arquitetura real do frontend RateSync em `rate-sync-ionic/`.

---

## Visão geral

O frontend é uma SPA/mobile app construída com **Angular 18 + Ionic 8**, empacotável via **Capacitor 6**. O domínio principal é busca de filmes e exibição de ratings consolidados (TMDB, OMDB, Letterboxd) obtidos via backend FastAPI.

O repositório contém dois projetos independentes:

```
RateSync/
├── rate-sync-ionic/    ← frontend (este documento)
└── rate-sync/          ← backend FastAPI (referência de contrato)
```

---

## Estrutura de diretórios

```
rate-sync-ionic/src/
├── app/
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   ├── app.component.*
│   ├── pages/
│   │   ├── home/           # Tela principal
│   │   └── login/          # Autenticação (não roteada no root)
│   ├── components/
│   │   ├── components.module.ts
│   │   ├── search-bar/
│   │   ├── movie-list/
│   │   ├── movie-item/     # inclui skeletons
│   │   ├── info-popover/
│   │   ├── toolbar/        # não registrado em módulo
│   │   └── user-popover/   # não registrado em módulo
│   ├── core/
│   │   ├── services/       # auth, api, websocket, data, toast
│   │   ├── interceptors/   # auth.interceptor.ts (não registrado)
│   │   └── resolvers/      # login.resolver.ts (inacessível)
│   └── services/           # duplicata de api + websocket
├── environments/
├── assets/
├── theme/
└── global.scss
```

**Camadas identificadas:**

| Camada | Local | Papel |
|---|---|---|
| Bootstrap | `app.module.ts`, `main.ts` | Inicialização Angular/Ionic |
| Routing | `app-routing.module.ts`, `*-routing.module.ts` | Navegação lazy parcial |
| Pages | `pages/` | Smart components de tela |
| Components | `components/` | UI reutilizável (parcialmente smart) |
| Services | `services/` + `core/services/` | Comunicação externa e auth |
| Cross-cutting | `core/interceptors`, `core/resolvers` | Auth HTTP e guard de login (não wired) |

Não existe camada explícita de `models/`, `interfaces/`, `store/` ou `shared/`.

---

## Paradigma Angular

- **NgModules** clássicos (`AppModule`, feature modules por page).
- **Lazy loading** apenas para `HomePageModule`.
- Templates misturam sintaxe legada (`*ngIf`, `*ngFor`) e moderna (`@if`) — migração parcial.
- **Standalone components:** não utilizados.
- **Strict mode TypeScript:** habilitado em `rate-sync-ionic/tsconfig.json`, mas com uso extensivo de `any` nos componentes.

---

## Rotas

### Router root (`rate-sync-ionic/src/app/app-routing.module.ts`)

| Path | Destino | Lazy load |
|---|---|---|
| `''` | redirect → `home` | — |
| `home` | `HomePageModule` | Sim |

### Rotas filhas

| Módulo | Path efetivo | Componente |
|---|---|---|
| `home-routing.module.ts` | `/home` | `HomePage` |
| `login-routing.module.ts` | `/login` (se registrado) | `LoginPage` + `LoginResolver` |

**Estado atual:** a rota `/login` **não está registrada** no router root. O módulo `LoginPageModule` existe, mas é inacessível pela navegação principal.

**Guards:** não identificado no código analisado.

---

## Serviços

| Serviço | Arquivo(s) | Responsabilidade | Consumido por |
|---|---|---|---|
| `ApiService` | `app/services/api.service.ts` **e** `app/core/services/api.service.ts` (idênticos) | HTTP + WebSocket para filmes | `HomePage`, `MovieItemComponent` |
| `WebsocketService` | `app/services/` **e** `app/core/services/` (idênticos) | Wrapper RxJS sobre WebSocket nativo | `ApiService` |
| `AuthService` | `app/core/services/auth.service.ts` | Firebase Auth + redirect | `LoginPage`, `ToolbarComponent`, `UserPopoverComponent`, `DataService` |
| `DataService` | `app/core/services/data.service.ts` | Endpoints protegidos/públicos | **Nenhum consumidor** |
| `ToastService` | `app/core/services/toast.service.ts` | Toasts Ionic | `LoginPage` |

Todos usam `providedIn: 'root'`.

**Interceptor:** `auth.interceptor.ts` existe em `core/interceptors/` mas **não está registrado** em `app.module.ts`.

---

## Fluxos principais

### 1. Busca de filmes (WebSocket)

```
SearchBarComponent → HomePage.onSearch()
  → ApiService.searchMovies(query)
  → WebsocketService (Subject)
  → Backend WS /ws/find_movie/
  → HomePage subscribe → JSON.parse → movieResults
  → MovieListComponent
```

Conexão WebSocket é aberta no **constructor** de `ApiService` (singleton no boot).

### 2. Mais populares (HTTP)

```
HomePage.ngOnInit() → ApiService.getMorePopulars()
  → GET /more_populars
  → moviePopularResults (exibido quando movieResults está vazio)
```

### 3. Ratings por filme (HTTP)

```
MovieItemComponent accordion expand
  → ApiService.getMovieRatings(movie.title)
  → GET /ratings/{movie_id}
  → Template renderiza tmdb, omdb, letterboxd
```

Cada expansão refaz a requisição — sem cache.

### 4. Login (incompleto)

```
LoginPage → AuthService (Firebase)
  → redirect /home via Router
```

Fluxo bloqueado por: rota `/login` ausente, Firebase não configurado, interceptor não registrado.

---

## Gerenciamento de estado

- **Biblioteca de state management:** não identificado no código analisado (sem NgRx, Akita, etc.).
- Estado local em componentes (`HomePage`, `MovieItemComponent`).
- `AuthService` usa `BehaviorSubject` para `currentUser$`, `userPhoto$`, `displayName$`.
- Sem cache HTTP ou de ratings.
- Sem `localStorage`/`sessionStorage` explícito (exceto persistência Firebase via `browserLocalPersistence`).

---

## Acoplamentos

| Origem | Destino | Tipo |
|---|---|---|
| Services | `environment.apiDomain` | Configuração |
| Templates | Shape de resposta do backend | Contrato implícito |
| `movie-item.component.html` | `https://image.tmdb.org/t/p/w500` | CDN externa |
| `index.html` | Google Fonts CDN | CDN externa |
| `AuthService` | Firebase (`@angular/fire`) | Auth (pacotes ausentes) |
| `DataService` | Endpoints inexistentes no backend | Código morto |

---

## Dependência do backend

O frontend depende do backend FastAPI (`rate-sync/`) para:

- Busca em tempo real via WebSocket
- Listagem de filmes populares via REST
- Ratings consolidados via REST

Detalhes de contrato em [api-integration.md](./api-integration.md).

O backend referencia autenticação Cognito (`rate-sync/app/core/security.py`), enquanto o frontend referencia Firebase — **desalinhamento de providers**.

---

## Build e deploy

| Aspecto | Valor |
|---|---|
| Output | `www/` (`rate-sync-ionic/angular.json`) |
| Dev server | `ng serve` |
| Prod API | `https://rate-sync-production.up.railway.app/api/v1` |
| Capacitor | Configurado (`capacitor.config.ts`), plugins não usados no código |

Pipeline CI/CD do frontend: **Não identificado no código analisado.**
