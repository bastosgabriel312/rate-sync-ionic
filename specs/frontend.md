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
**Lint:** ESLint com `@angular-eslint` (`rate-sync-ionic/.eslintrc.json`) — inclui `@typescript-eslint/utils@^8.0.0` (adicionado em 2026-08-16 para destravar o `@angular-eslint/eslint-plugin@18`)

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

**Capacitor:** `rate-sync-ionic/capacitor.config.ts` — `appId: 'com.bastosgabriel.ratesync'` (definido em 2026-08-16, substituindo o placeholder `io.ionic.starter`).

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
- Exibir toasts de erro de busca/populares via `ToastService` (Fase 4)

**Estado local:**

```typescript
isLoadingSearch: boolean       // ativado em onSearch() (Fase 7)
isLoadingMorePopulars: boolean
movieResults: MovieResult[]
moviePopularResults: MovieResult[]
searchQuery: string            // termo ativo da busca (estado vazio/contagem, Fase 10)
popularsError: boolean         // falha ao carregar populares (estado com retry, Fase 10)
```

**Fase 10 (2026-08-16):** removida a dependência de `Platform`/`isAndroid` (o `ion-no-border` do header agora é classe estática). Estados adicionados: `searchQuery` (contagem de resultados + empty state de busca) e `popularsError` (mensagem com botão "Tentar novamente" quando `/more_populars` falha).

**Problema estrutural no template:** `ion-content` aninhado em `home.page.html` — **corrigido (Fase 7)** (substituído por `<div>`).

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
| `MovieListComponent` | `app-movie-list` | Container smart (busca/cache de ratings, Fase 7) | Sim (`getMovieRatings`) |
| `MovieItemComponent` | `app-movie-item` | Presentacional (Fase 7) | Não |
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
- Emite `searchChange` com **debounce de 300ms** via `Subject` + `debounceTime` (Fase 4)
- Emite `searchCleared` imediatamente ao limpar

**MovieItemComponent** (`movie-item.component.ts`):
- **Presentacional (Fase 7, TD-09)** — não injeta `ApiService`/`ToastService`
- Recebe `@Input() movie: MovieResult | undefined`, `@Input() isLoading`, `@Input() reviews`
- Emite `requestReviews` via `@Output` ao **expandir o card** (Fase 10: `toggle()` substitui o accordion Ionic — emite apenas ao expandir; colapsar não reemite)
- **Card com poster (Fase 10):** `article.rs-card` com pôster em `aspect-ratio: 2/3`, título, overview (clamp 2 linhas), badge de nota Cinemeta no pôster, chevron de expansão
- **Fontes indisponíveis (Fase 11):** quando uma fonte retorna `error` (ex.: Letterboxd 403), exibe badge + "Indisponível" via `isOmdbError()`/`hasAnySourceData()` em vez de omitir silenciosamente
- Lógica de ratings por fonte: `formatRating` (escalas corretas — Cinemeta/IMDb `/10`, Rotten Tomatoes `%`, Metacritic `/100`, Letterboxd `/5`), `getRatingTone` (`good`/`neutral`/`bad` → cores semânticas), `getRatingIcon` (ícones de sentimento), `getSourceBadgeSlug` (badges coloridas por fonte)
- Poster via URL completa (Cinemeta) ou fallback `assets/images/rate-sync.png`

**MovieListComponent** (`movie-list.component.ts`):
- **Container smart (Fase 7, TD-09)** — injeta `ApiService`/`ToastService`
- Recebe `@Input() movies`, `@Input() isLoading`
- **Cache local de ratings** `reviewsCache: Map<string, MovieRatings>` por título (re-expansão sem nova requisição)
- `requestReviews(title)` busca via `getMovieRatings` e repassa `[reviews]`/`[isLoading]` ao `MovieItemComponent`
- Erro de busca de ratings exibe toast via `ToastService`
- **Grid responsivo (Fase 10):** template renderiza `.rs-grid` (2 colunas mobile → 4 → 6 desktop) de cards em vez de `ion-list` de linhas
- **Largura máxima (Fase 11):** container de até 1400px centralizado em telas ≥1024px
- **Skeletons dinâmicos (Fases 8/10):** `skeletonItems` gerado a partir de `Platform.height()` (mínimo 3, divisor `280` px estimado para cards)
- **Cleanup (Fase 8):** subscriptions de ratings rastreadas e desinscritas no `OnDestroy`

**ToolbarComponent** (`toolbar.component.ts`):
- Observa `AuthService.currentUser$`, `userPhoto$`, `displayName$`
- Botão de usuário sem handler de click identificado
- Subscribes sem cleanup

---

## Serviços (detalhamento)

### ApiService

**Arquivo oficial (consolidado):** `src/app/core/services/api.service.ts`  
*(Duplicatas em `src/app/services/` removidas em 2026-08-16)*

| Método | Protocolo | Endpoint |
|---|---|---|
| `searchMovies(query)` | WebSocket send | `{apiDomain}/ws/find_movie/` |
| `getMovieUpdates()` | WebSocket receive | mesmo socket |
| `getMorePopulars()` | HTTP GET | `{apiDomain}/more_populars` |
| `getMovieRatings(movieId)` | HTTP GET | `{apiDomain}/ratings/{movieId}` |

WebSocket conectado de forma **lazy** (Fase 8, P-06): `WebsocketService.connect()` cria o `Subject` sem abrir o socket; a conexão é estabelecida no primeiro subscribe/uso. Mensagens enviadas antes do `onopen` são enfileiradas em `pendingQueue` e despachadas no `onopen` (P-03). O payload é **texto puro** (via `WebsocketService.send(text)`), alinhado ao `receive_text()` do backend. Os DTOs de busca/ratings usam os contratos de `src/app/core/models/movie.model.ts`.

### AuthService

**Arquivo:** `rate-sync-ionic/src/app/core/services/auth.service.ts`

- Imports de `@angular/fire/auth` e `firebase/auth` (**pacotes ausentes do `package.json`**)
- Métodos: `loginWithEmail`, `registerWithEmail`, `loginWithGoogle`, `logout`, `getIdToken`
- Redirect automático no constructor via `onAuthStateChanged`
- Observables: `currentUser$`, `userPhoto$`, `displayName$`

### DataService

**Arquivo:** ~~`rate-sync-ionic/src/app/core/services/data.service.ts`~~ **Removido em 2026-08-16 (Fase 5)**.

Serviço sem consumidores, chamando endpoints inexistentes (`GET /protected/profile`, `GET /public/hello`). Removido após validação completa (classificação `DESCARTAR APÓS VALIDAÇÃO`).

### ToastService

**Arquivo:** `rate-sync-ionic/src/app/core/services/toast.service.ts`

Métodos: `presentToast`, `showErrorToast`, `showSuccessToast`, `showWarningToast`.

**Consumidores (Fase 4/7):** `HomePage` (erro de busca e de filmes populares), `MovieListComponent` (erro ao carregar ratings, Fase 7).

### WebsocketService

**Arquivo oficial (consolidado):** `rate-sync-ionic/src/app/core/services/websocket.service.ts`

- `toWsUrl(url)`: converte `http/https` → `ws/wss` para compatibilidade com a API WebSocket do browser.
- `connect(url): Subject<string>`: cria o `Subject` sem abrir o socket (**conexão lazy**, Fase 8/P-06); abre no primeiro subscribe/uso.
- `open(url)`: cria o `WebSocket`, despacha mensagens pendentes (`pendingQueue`) no `onopen` e liga handlers de recepção ao subscriber (**P-03**, Fase 8).
- `send(data)`: envia **texto puro** (sem `JSON.stringify`), alinhado ao `websocket.receive_text()` do backend; se o socket ainda não está `OPEN`, enfileira em `pendingQueue`.

---

## Modelos / interfaces / types

**`src/app/core/models/movie.model.ts`** (criado em 2026-08-16, Fase 3):

```typescript
interface MovieResult { title: string; overview: string; poster_path: string; }
interface MovieError { error: string; }
interface MovieReviewSource { title?: string; rating?: number | string | null; year?: number | string | null; error?: string; }
interface MovieRatingDetail { title?: string; movie_title?: string; rating?: number | string | null; vote_count?: number; year?: number | string | null; source_name?: string; }
interface MovieRatingEntry { [source: string]: MovieRatingDetail; }
interface MovieRatings { cinemeta: MovieReviewSource; omdb: MovieRatingEntry[] | MovieError; letterboxd: MovieReviewSource; }
```

Os DTOs substituem `any` nos contratos de busca e ratings. Campos opcionais refletem a variação de shape entre Cinemeta/OMDb/Letterboxd.

---

## Autenticação

| Aspecto | Estado |
|---|---|
| Provider frontend | Firebase Auth |
| Provider backend | AWS Cognito (`rate-sync/app/core/security.py`) |
| Rotas de login | Módulo existe, rota root ausente |
| Interceptor HTTP | Criado, não registrado |
| Token em requests | `Authorization: Bearer {token}` (se interceptor ativo) |
| Endpoints protegidos consumidos | Nenhum (DataService removido — Fase 5) |

Mensagens de erro mapeadas em `login.page.ts` com códigos Firebase (`auth/user-not-found`, etc.).

---

## Armazenamento local / cache

| Mecanismo | Uso |
|---|---|
| `localStorage` / `sessionStorage` | Não identificado no código analisado |
| Firebase `browserLocalPersistence` | Configurado em `AuthService` |
| Cache HTTP | Não identificado no código analisado |
| Cache de ratings | `Map<string, MovieRatings>` no `MovieListComponent` (Fases 4/7) |
| Service Worker / PWA | Não identificado no código analisado |

---

## Gerenciamento de erros

| Contexto | Tratamento |
|---|---|
| WebSocket (home) | `try/catch` + `console.error`, limpa `movieResults` |
| HTTP populares | callback `error` + `console.error` |
| HTTP ratings | callback `error` + `console.error`, cache por título (`MovieListComponent`) |
| Login | Toast ou string em `this.error` |
| Auth | `console.error` |

Feedback visual ao usuário na home (busca/populares): **implementado (Fases 10–11)** — `.rs-empty` com ícone + botão de retry para erros de populares, "Nenhum filme popular disponível" para lista vazia, "Indisponível" por fonte de rating com `error`, contagem de resultados durante a busca.

Serviço centralizado de error handling: **não identificado no código analisado**.

---

## Estilos e tema

| Arquivo | Conteúdo |
|---|---|
| `rate-sync-ionic/src/global.scss` | Imports Ionic CSS, dark mode (1 palette), tipografia base, scrollbar, foco visível, overrides globais |
| `rate-sync-ionic/src/theme/variables.scss` | **Design tokens (Fase 10, 2026-08-16):** paleta dark em camadas (`--rs-color-bg/surface/surface-raised/surface-active`), bordas (`--rs-color-border`), texto (`--rs-text-primary/secondary/muted`), semânticas (`--rs-success/warning/danger/info`), escala tipográfica (`--rs-text-xs…xl`), raios/espaçamentos (`--rs-radius-*`, `--rs-space-*`), fonte (`--rs-font-sans`) + mapeamento das variáveis `--ion-*` |
| `rate-sync-ionic/src/index.html` | `class="dark"` no body; viewport sem `user-scalable=no` (Fase 10, acessibilidade) |

**Fase 10 (2026-08-16):** tema redesenhado com design tokens "Cinematic Dark" — surfaces em camadas, cores semânticas para notas/ícones, escala tipográfica em `rem` (eliminados os `vmax`/`vmin`), `prefers-reduced-motion`, scrollbar estilizado e `:focus-visible`. `home.page.scss` recriado (antes removido por ser vazio na Fase 6) para estilizar header/branding/estados.

**Fase 11 (2026-08-16):** branding com logo (`assets/images/rate-sync.png`, 26px arredondado) ao lado do wordmark no header; `info-popover.component.scss` criado com identidade visual (logo + título com accent, tipografia e links estilizados); container de largura máxima de 1400px centralizado no grid desktop (≥1024px); estados vazios de populares com ícone ("Nenhum filme popular disponível"); contagem de resultados oculta durante o loading da busca.

SCSS vazio removido em 2026-08-16: `home.page.scss` e `toolbar.component.scss` deletados (0 bytes); `styleUrls` de `HomePage` e `ToolbarComponent` ajustados. **Nota (Fase 10):** `home.page.scss` foi recriado com estilos reais.

---

## Assets

| Asset | Status |
|---|---|
| `rate-sync-ionic/src/assets/shapes.svg` | Existe |
| `rate-sync-ionic/src/assets/images/rate-sync.png` | Existe (referenciado em `index.html` e `movie-item.component.html` — imagem de fallback, **otimizada para ~103 KB em 2026-08-16**, Fase 7) |
| `rate-sync-ionic/src/assets/icon/favicon.png` | Existe |

---

## Dependências Capacitor

Pacotes em `package.json`: `@capacitor/app`, `haptics`, `keyboard`, `status-bar` (**mantidos em 2026-08-16** — auto-registrados pelo Capacitor em builds nativos via `package.json`, sem import em `src/`; remoção degradaria um futuro build mobile).

**Uso no código (`src/`):** não identificado no código analisado.

---

## Internacionalização

`@angular/localize` **removido em 2026-08-16** (não havia uso de `$localize`/i18n): retirado dos polyfills (`angular.json`), de `main.ts` e de `tsconfig.app.json`. O locale `pt` permanece registrado via `@angular/common/locales/pt` (usado nos pipes `number`).

Strings i18n (`i18n`, `$localize`): **não identificado no código analisado**. Textos hardcoded em português nos templates.
