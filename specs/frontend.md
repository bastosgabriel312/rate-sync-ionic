# Frontend — Estado Atual

Documentação técnica do frontend em `rate-sync-ionic/`.

---

## Stack e versões

Fonte: `rate-sync-ionic/package.json`

| Tecnologia | Versão declarada |
|---|---|
| Angular | `^18.0.0` |
| Ionic Angular | `^8.0.0` |
| Capacitor Core | `6.1.2` |
| RxJS | `~7.8.0` |
| TypeScript | `~5.4.0` |
| Zone.js | `~0.14.2` |
| ionicons | `^7.0.0` |

**Testes:** Jasmine + Karma (`rate-sync-ionic/karma.conf.js`)  
**Lint:** ESLint com `@angular-eslint` (`rate-sync-ionic/.eslintrc.json`)

---

## Bootstrap

| Arquivo | Função |
|---|---|
| `rate-sync-ionic/src/main.ts` | Bootstrap via `platformBrowserDynamic().bootstrapModule(AppModule)` |
| `rate-sync-ionic/src/app/app.module.ts` | Registra `BrowserModule`, `IonicModule`, `HttpClientModule`, locale `pt` |
| `rate-sync-ionic/src/index.html` | Shell HTML, dark mode, favicon, Google Fonts Material Icons |
| `rate-sync-ionic/src/app/app.component.html` | `<ion-router-outlet>` |

---

## Configurações de ambiente

| Arquivo | `production` | `apiDomain` |
|---|---|---|
| `rate-sync-ionic/src/environments/environment.ts` | `false` | `https://localhost:8000/api/v1` |
| `rate-sync-ionic/src/environments/environment.prod.ts` | `true` | `https://rate-sync-production.up.railway.app/api/v1` |

Substituição em build prod configurada em `rate-sync-ionic/angular.json` (`fileReplacements`).

**Configuração Firebase:** não identificado no código analisado (sem apiKey, authDomain, etc. nos environments).

**Capacitor:** `rate-sync-ionic/capacitor.config.ts` — `appId: 'io.ionic.starter'` (valor padrão do scaffold).

---

## Páginas

### HomePage

**Arquivos:** `rate-sync-ionic/src/app/pages/home/`

| Propriedade | Valor |
|---|---|
| Rota efetiva | `/home` |
| Lazy loaded | Sim |

**Responsabilidades:**
- Conectar ao stream WebSocket de busca (subscribe no constructor)
- Buscar filmes populares no `ngOnInit`
- Orquestrar `SearchBarComponent` e `MovieListComponent`
- Exibir popover informativo (`InfoPopoverComponent`)

**Estado local:**

```typescript
isLoadingSearch: boolean       // nunca setado como true em onSearch()
isLoadingMorePopulars: boolean
movieResults: any[]
moviePopularResults: any[]
isAndroid: any
```

**Problema estrutural no template:** `ion-content` aninhado em `home.page.html`.

---

### LoginPage

**Arquivos:** `rate-sync-ionic/src/app/pages/login/`

| Propriedade | Valor |
|---|---|
| Rota efetiva | Inacessível — `/login` não registrado no router root |
| Lazy loaded | Não identificado no código analisado (módulo existe, não importado no root) |

**Responsabilidades:**
- Login/registro com email e senha
- Login com Google
- Exibição de erros via `ToastService` ou string local

**Dependências:** `AuthService`, `Router`, `ToastService`, `ToolbarComponent`.

**Problema estrutural de módulos:** `login.page.html` utiliza `<app-toolbar>`. O `LoginPageModule` importa `ComponentsModule`, porém `ComponentsModule` não declara nem exporta `ToolbarComponent` (que não pertence a nenhum NgModule). Isso impede a compilação/renderização correta da `LoginPage`.

---

## Componentes

### Registrados em `ComponentsModule`

Arquivo: `rate-sync-ionic/src/app/components/components.module.ts`

| Componente | Selector | Tipo | Chama API |
|---|---|---|---|
| `SearchBarComponent` | `app-search-bar` | Presentacional | Não |
| `MovieListComponent` | `app-movie-list` | Presentacional | Não |
| `MovieItemComponent` | `app-movie-item` | Smart | Sim (`getMovieRatings`) |
| `MovieItemSkeletonComponent` | `app-movie-item-skeleton` | Placeholder | Não |
| `MovieRatingsSkeletonComponent` | `app-movie-ratings-skeleton` | Placeholder | Não |
| `InfoPopoverComponent` | `app-info-popover` | Informativo | Não |

### Não registrados em nenhum NgModule

| Componente | Arquivo | Usado em | Problema |
|---|---|---|---|
| `ToolbarComponent` | `components/toolbar/` | `login.page.html` | Não exportado/declarado em `ComponentsModule`; falha ao renderizar `LoginPage` |
| `UserPopoverComponent` | `components/user-popover/` | Nenhum template identificado | Componente orfão |

### Detalhes relevantes

**SearchBarComponent** (`search-bar.component.ts`):
- Emite `searchChange` a cada input (sem debounce)
- Emite `onSearchCleared` ao limpar

**MovieItemComponent** (`movie-item.component.ts`):
- Recebe `@Input() movie: any`
- Busca ratings ao expandir accordion
- Lógica de ícones de sentimento por fonte (`getRatingIcon`, `getSourceRatingParameters`)
- Poster via TMDB CDN ou fallback `assets/images/rate-sync.png`

**ToolbarComponent** (`toolbar.component.ts`):
- Observa `AuthService.currentUser$`, `userPhoto$`, `displayName$`
- Botão de usuário sem handler de click identificado
- Subscribes sem cleanup

---

## Serviços (detalhamento)

### ApiService

**Import usado pela aplicação:** `src/app/services/api.service.ts`  
**Duplicata:** `src/app/core/services/api.service.ts` (código idêntico)

| Método | Protocolo | Endpoint |
|---|---|---|
| `searchMovies(query)` | WebSocket send | `{apiDomain}/ws/find_movie/` |
| `getMovieUpdates()` | WebSocket receive | mesmo socket |
| `getMorePopulars()` | HTTP GET | `{apiDomain}/more_populars` |
| `getMovieRatings(movie_id)` | HTTP GET | `{apiDomain}/ratings/{movie_id}` |

WebSocket conectado no constructor — conexão única singleton.

### AuthService

**Arquivo:** `rate-sync-ionic/src/app/core/services/auth.service.ts`

- Imports de `@angular/fire/auth` e `firebase/auth` (**pacotes ausentes do `package.json`**)
- Métodos: `loginWithEmail`, `registerWithEmail`, `loginWithGoogle`, `logout`, `getIdToken`
- Redirect automático no constructor via `onAuthStateChanged`
- Observables: `currentUser$`, `userPhoto$`, `displayName$`

### DataService

**Arquivo:** `rate-sync-ionic/src/app/core/services/data.service.ts`

| Método | Endpoint |
|---|---|
| `getProfile()` | `GET /protected/profile` |
| `getHello()` | `GET /public/hello` |

**Consumidores:** nenhum identificado no código analisado.  
**Endpoints no backend:** não identificados no código analisado (`rate-sync/app/api/v1/routes.py`).

### ToastService

**Arquivo:** `rate-sync-ionic/src/app/core/services/toast.service.ts`

Métodos: `presentToast`, `showErrorToast`, `showSuccessToast`, `showWarningToast`.

---

## Modelos / interfaces / types

**Não identificado no código analisado.**

Não há pasta `models/`, `interfaces/` ou `types/`. Campos de domínio usam `any`.

Formato de dados inferido dos templates (não formalizado):

```typescript
// Filme (busca/populares) — inferido de templates e backend
{ title: string, overview: string, poster_path: string }

// Ratings — inferido de movie-item.component.html
{
  tmdb?: { rating, vote_count },
  omdb?: Array<Record<string, { source_name, rating, vote_count?, year? }>>,
  letterboxd?: { rating, year }
}
```

---

## Autenticação

| Aspecto | Estado |
|---|---|
| Provider frontend | Firebase Auth |
| Provider backend | AWS Cognito (`rate-sync/app/core/security.py`) |
| Rotas de login | Módulo existe, rota root ausente |
| Interceptor HTTP | Criado, não registrado |
| Token em requests | `Authorization: Bearer {token}` (se interceptor ativo) |
| Endpoints protegidos consumidos | Nenhum (DataService não usado) |

Mensagens de erro mapeadas em `login.page.ts` com códigos Firebase (`auth/user-not-found`, etc.).

---

## Armazenamento local / cache

| Mecanismo | Uso |
|---|---|
| `localStorage` / `sessionStorage` | Não identificado no código analisado |
| Firebase `browserLocalPersistence` | Configurado em `AuthService` |
| Cache HTTP | Não identificado no código analisado |
| Cache de ratings | Não identificado no código analisado |
| Service Worker / PWA | Não identificado no código analisado |

---

## Gerenciamento de erros

| Contexto | Tratamento |
|---|---|
| WebSocket (home) | `try/catch` + `console.error`, limpa `movieResults` |
| HTTP populares | callback `error` + `console.error` |
| HTTP ratings | callback `error` + `console.error`, `reviews = {}` |
| Login | Toast ou string em `this.error` |
| Auth | `console.error` |

Feedback visual ao usuário na home (busca/populares): **não identificado no código analisado** (apenas console).

Serviço centralizado de error handling: **não identificado no código analisado**.

---

## Estilos e tema

| Arquivo | Conteúdo |
|---|---|
| `rate-sync-ionic/src/global.scss` | Imports Ionic CSS, dark mode (3 palettes), overrides globais |
| `rate-sync-ionic/src/theme/variables.scss` | Paleta dark estilo GitHub (#0d1117, #161b22, primary #238636) |
| `rate-sync-ionic/src/index.html` | `class="dark"` no body |

SCSS vazio identificado em: `home.page.scss`, `toolbar.component.scss`.

---

## Assets

| Asset | Status |
|---|---|
| `rate-sync-ionic/src/assets/shapes.svg` | Existe |
| `rate-sync-ionic/src/assets/images/rate-sync.png` | Existe (referenciado em `index.html` e `movie-item.component.html` — imagem de fallback com ~1,02 MB) |
| `rate-sync-ionic/src/assets/icon/favicon.png` | Existe |

---

## Dependências Capacitor

Pacotes em `package.json`: `@capacitor/app`, `haptics`, `keyboard`, `status-bar`.

**Uso no código (`src/`):** não identificado no código analisado.

---

## Internacionalização

`@angular/localize` incluído nos polyfills (`angular.json`), locale `pt` registrado.

Strings i18n (`i18n`, `$localize`): **não identificado no código analisado**. Textos hardcoded em português nos templates.
