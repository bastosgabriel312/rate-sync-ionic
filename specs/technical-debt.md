# Débito Técnico — Estado Atual

Registro de problemas, duplicações e riscos identificados no frontend `rate-sync-ionic/`, baseado exclusivamente no código analisado.

---

## Código legado e untracked

| Arquivo | Estado | Decisão | Justificativa |
|---|---|---|---|
| `src/app/core/services/auth.service.ts` | Legado / Incompleto | NÃO INTEGRAR | Implementação Firebase incompleta. Não integrar nesta fase; poderá ser refeita futuramente se autenticação for necessária. |
| `src/app/core/interceptors/auth.interceptor.ts` | Legado / Incompleto | NÃO INTEGRAR | Interceptor Firebase não integrado. Não integrar nesta fase; poderá ser refeito futuramente se autenticação for necessária. |
| `src/app/core/resolvers/login.resolver.ts` | Legado / Incompleto | NÃO INTEGRAR | Resolver/guard de login inacessível e vinculado ao fluxo legado de autenticação. |
| `src/app/pages/login/` | Legado / Incompleto | NÃO INTEGRAR | Rota `/login` não registrada no router root. Não integrar nesta fase de refatoração. |
| `src/app/components/toolbar/` | Untracked / Não registrado | AVALIAR → **NÃO INTEGRAR** (Fase 8) | Avaliado em 2026-08-16: depende de `AuthService` (Firebase, NÃO INTEGRAR) para `currentUser$`/`userPhoto$`/`displayName$`; consumido apenas pelo `LoginPage` (NÃO INTEGRAR). Sem auth ativo, o componente não tem valor; a barra oficial do `HomePage` (`ion-header` + `app-search-bar`) já cobre a UI. |
| `src/app/components/user-popover/` | Untracked / Não registrado | AVALIAR → **NÃO INTEGRAR** (Fase 8) | Avaliado em 2026-08-16: depende de `AuthService.logout()` (Firebase, NÃO INTEGRAR) e não possui consumidores ativos (nenhuma referência em templates/routes). Remoção física não autorizada — permanece como código não integrado. |
| `src/app/core/services/api.service.ts` | **INTEGRAR** (oficial) | ✅ Consolidadas em 2026-08-16 | Serviço oficial de filmes em `core/services/`; duplicata `src/app/services/api.service.ts` **removida** (validação completa: referências, consumidores e specs). |
| `src/app/core/services/websocket.service.ts` | **INTEGRAR** (oficial) | ✅ Consolidadas em 2026-08-16 | Serviço oficial de WebSocket em `core/services/` com contrato de texto puro (`toWsUrl()` + `send(text)`); duplicata `src/app/services/websocket.service.ts` **removida**. |
| `src/app/core/services/data.service.ts` | ~~Legado / Sem uso~~ **Removido (2026-08-16, Fase 5)** | ~~DESCARTAR APÓS VALIDAÇÃO~~ ✅ Removido | Utilizava endpoints inexistentes no backend (`/protected/profile`, `/public/hello`) e não possuía consumidores. Removido após validação completa. |
| `src/app/core/services/toast.service.ts` | Integrado (Fase 4) | AVALIAR → **INTEGRADO** ✅ | Serviço de Toasts agora consumido por `HomePage` e `MovieListComponent` para feedback de erros. |

---

## Legenda de severidade

| Nível | Significado |
|---|---|
| **Crítica** | Impede funcionamento ou build |
| **Alta** | Funcionalidade core comprometida |
| **Média** | Manutenibilidade ou qualidade afetada |
| **Baixa** | Inconsistência ou polish |

---

## Crítica

### TD-01: Dependências Firebase ausentes

| Aspecto | Detalhe |
|---|---|
| **Arquivo** | `rate-sync-ionic/src/app/core/services/auth.service.ts` |
| **Problema** | Importa `@angular/fire/auth` e `firebase/auth` |
| **Evidência** | Pacotes ausentes de `rate-sync-ionic/package.json` |
| **Impacto** | Build provavelmente falha; auth não funcional |

### TD-02: Rota `/login` não registrada

| Aspecto | Detalhe |
|---|---|
| **Arquivo** | `rate-sync-ionic/src/app/app-routing.module.ts` |
| **Problema** | `LoginPageModule` existe mas não está no router root |
| **Conflito** | `AuthService` redireciona para `/login` no constructor |
| **Impacto** | Fluxo de auth inacessível; redirect para rota inexistente |

### TD-03: Incompatibilidade WebSocket (scheme + payload)

| Aspecto | Detalhe |
|---|---|
| **Arquivos** | `api.service.ts`, `websocket.service.ts`, `home.page.ts` |
| **Problema 1** | ~~URL `https://...` passada ao construtor `WebSocket`~~ — **Corrigido em 2026-08-16**: `toWsUrl()` converte `http/https` → `ws/wss` |
| **Problema 2** | ~~Envia `JSON.stringify(query)`; backend usa `receive_text()` esperando texto puro~~ — **Corrigido em 2026-08-16**: `WebsocketService.send()` usa `ws.send(texto)` (texto puro, sem `JSON.stringify`) |
| **Impacto** | ~~Busca em tempo real funciona em conexão, mas payload ainda incompatível~~ — **Resolvido**: contrato WS alinhado ao backend |

---

## Alta

### TD-04: Serviços duplicados

| Serviço | Arquivo 1 | Arquivo 2 |
|---|---|---|
| `ApiService` | `app/services/api.service.ts` | `app/core/services/api.service.ts` |
| `WebsocketService` | `app/services/websocket.service.ts` | `app/core/services/websocket.service.ts` |

Código **100% idêntico**. Specs também duplicados. Home importa de `app/services/`; restante do core fica inconsistente.

**Resolvido em 2026-08-16**: consolidação concluída — `core/services/api.service.ts` e `core/services/websocket.service.ts` são os únicos serviços oficiais; os duplicados `src/app/services/*` foram removidos (após validação de referências, consumidores e specs).

### TD-05: Componentes não registrados em NgModule

| Componente | Usado em | Declarado em | Impacto |
|---|---|---|---|
| `ToolbarComponent` | `login.page.html` | Nenhum módulo | `login.page.html` consome `<app-toolbar>`. O `LoginPageModule` importa `ComponentsModule`, mas este não declara/exporta `ToolbarComponent`, impedindo a compilação/renderização da `LoginPage`. |
| `UserPopoverComponent` | Nenhum template | Nenhum módulo | Componente orfão. |

### TD-06: Interceptor de auth não registrado

| Aspecto | Detalhe |
|---|---|
| **Arquivo** | `rate-sync-ionic/src/app/core/interceptors/auth.interceptor.ts` |
| **Problema** | `authInterceptor` criado mas não registrado em `app.module.ts` |
| **Impacto** | Token Firebase nunca enviado em requests HTTP |

### TD-07: Desalinhamento de auth (Firebase vs Cognito)

| Camada | Provider |
|---|---|
| Frontend | Firebase Auth |
| Backend | AWS Cognito JWT (`rate-sync/app/core/security.py`) |

Sem ponte entre providers. Endpoints de filmes são públicos — auth não integrada ao fluxo principal.

### TD-08: `DataService` referencia endpoints inexistentes

| Endpoint | Backend |
|---|---|
| `GET /protected/profile` | Não em `routes.py` |
| `GET /public/hello` | Não em `routes.py` |

**Resolvido em 2026-08-16 (Fase 5):** serviço sem consumidores e com endpoints ausentes no backend — **removido** (classificação `DESCARTAR APÓS VALIDAÇÃO`, validação completa de referências/consumidores/specs antes da remoção).

### TD-09: Smart component com chamada API direta

| Aspecto | Detalhe |
|---|---|
| **Arquivo** | `rate-sync-ionic/src/app/components/movie-item/movie-item.component.ts` |
| **Problema** | Componente de UI chama `ApiService.getMovieRatings()` diretamente |
| **Impacto** | Dificulta teste, reuso e separação de responsabilidades |

**Corrigido em 2026-08-16 (Fase 7):** `MovieItemComponent` tornou-se **presentacional** — recebe `reviews`/`isLoading` via `@Input` e emite `requestReviews` via `@Output`. A busca/cache de ratings migrou para `MovieListComponent` (container smart, injeta `ApiService`/`ToastService`).

---

## Média

### TD-10: Zero interfaces TypeScript para contratos API

Uso extensivo de `any` apesar de `strict: true`. Backend tem schemas Pydantic (`rate-sync/app/api/v1/schemas.py`) não espelhados.

**Corrigido parcialmente na Fase 3:** criado `core/models/movie.model.ts` com DTOs tipados (`MovieResult`, `MovieRatings`, `MovieReviewSource`, `MovieRatingEntry`, `MovieRatingDetail`, `MovieError`) substituindo `any` nos contratos de busca/ratings.

**Corrigido em 2026-08-16 (Fase 8):** removidos os `any` restantes em componentes ativos — `accordionGroupChange` usa `AccordionGroupCustomEvent`, `getRatingIcon` aceita `number | string | null | undefined`, `onSearchChange`/`onSearchClear` usam `SearchbarCustomEvent`, `isAndroid` é `boolean`.

### TD-11: `isLoadingSearch` nunca ativado

| Arquivo | `rate-sync-ionic/src/app/pages/home/home.page.ts` |
|---|---|
| **Problema** | `onSearch()` não seta `isLoadingSearch = true` |
| **Impacto** | Skeleton de busca nunca exibido |

**Corrigido em 2026-08-16 (Fase 7):** `onSearch()` define `isLoadingSearch = true`; a resposta do WebSocket (ou o fluxo de erro) retorna para `false`.

### TD-12: Busca sem debounce

Cada keystroke em `SearchBarComponent` emite evento → dispara mensagem WebSocket.

**Corrigido em 2026-08-16 (Fase 4):** `SearchBarComponent` usa `Subject` + `debounceTime(300)` — `searchChange` só é emitido após 300ms de pausa; `searchCleared` (renomeado de `onSearchCleared` na Fase 5 por regra de estilo) permanece imediato.

### TD-13: Ratings re-fetch a cada expand

`MovieItemComponent.requestReviews()` chamado no accordion change sem cache.

**Corrigido em 2026-08-16 (Fase 4):** cache local `reviewsCache: Map<string, MovieRatings>` por título — re-expansão consome dados em memória sem nova requisição.

### TD-14: Subscriptions sem cleanup

| Arquivo | Subscribe |
|---|---|
| `home.page.ts` | Constructor — `getMovieUpdates()` |
| `toolbar.component.ts` | `ngOnInit` — 3 observables do AuthService |

**Corrigido em 2026-08-16 (Fase 7):** `HomePage` implementa `OnDestroy` e armazena as subscriptions (`getMovieUpdates`, `getMorePopulars`) em `subscriptions: Subscription[]`, com unsubscribe no `ngOnDestroy`. `toolbar.component.ts` permanece sem cleanup (`AVALIAR`/legado — `NÃO INTEGRAR`).

### TD-15: Redirect de navegação no constructor do AuthService

Responsabilidade de routing em serviço de auth — acoplamento e risco de loops.

### TD-16: CORS backend restritivo

~~`rate-sync/app/main.py` permitia apenas `https://ratesync.vercel.app`.~~ **Corrigido em 2026-08-16**: `CORS_ORIGINS` em `app/core/config.py` inclui dev (`localhost:4200`, `localhost:8100`) e Vercel.

### TD-17: Imagem de asset com tamanho excessivo (~1 MB)

| Aspecto | Detalhe |
|---|---|
| **Arquivo** | `rate-sync-ionic/src/assets/images/rate-sync.png` |
| **Problema** | Imagem PNG não otimizada possui ~1,02 MB (1.026.844 bytes) |
| **Impacto** | Aumento desnecessário do bundle da aplicação e consumo elevado de dados ao exibir a imagem de fallback |

**Corrigido em 2026-08-16 (Fase 7):** imagem redimensionada de 1024×1024 para 256×256 e re-salva — **~103 KB** (redução de ~90%).

### TD-18: `ion-content` aninhado

| Arquivo |
|---|
| `rate-sync-ionic/src/app/pages/home/home.page.html` |
| `rate-sync-ionic/src/app/components/user-popover/user-popover.component.html` |

Estrutura Ionic/HTML inválida.

**Corrigido em 2026-08-16 (Fase 7):** em `home.page.html` o `ion-content` aninhado foi substituído por `<div>` (seção "Mais populares"). `user-popover.component.html` (legado, `AVALIAR`) permanece.

### TD-19: AuthService.getIdToken() sem controle de lifecycle

Usa `onAuthStateChanged` dentro de Promise — pode registrar múltiplos listeners.

---

## Baixa

### TD-20: Capacitor plugins instalados, não usados

`@capacitor/app`, `haptics`, `keyboard`, `status-bar` — zero imports em `src/`.

**Resolvido em 2026-08-16 (decisão técnica):** pacotes **mantidos**. Em builds nativos o Capacitor auto-registra os plugins via `package.json` (sem import em TS); a remoção degradaria um futuro build mobile. Justificativa registrada em `frontend.md`.

### TD-21: `@angular/localize` nos polyfills sem i18n

Strings hardcoded em português nos templates.

**Corrigido em 2026-08-16:** sem uso de `$localize`/i18n no projeto, `@angular/localize` foi removido dos polyfills (`angular.json`), de `main.ts` e de `tsconfig.app.json`, e desinstalado do `package.json`. Locale `pt` mantido via `@angular/common/locales/pt` para os pipes `number`.

### TD-22: `material-design-icons` npm vs CDN

Pacote npm instalado; `index.html` carrega Material Icons via Google Fonts CDN.

**Corrigido em 2026-08-16:** pacote npm **removido** do `package.json` (redundante — os ícones vêm do CDN via Google Fonts). Mantido o `<link>` CDN em `index.html`.

### TD-23: Mistura de sintaxe Angular

`*ngIf`/`*ngFor` e `@if` no mesmo projeto.

**Corrigido em 2026-08-16:** templates dos componentes oficiais (`home.page.html`, `movie-list.component.html`, `movie-item.component.html`) padronizados para **sintaxe de blocos Angular 18** (`@if`/`@for`/`@else`). `login.page.html` (legado, `NÃO INTEGRAR`) permanece com `*ngIf`.

### TD-24: SCSS vazio

`home.page.scss`, `toolbar.component.scss` — sem estilos.

**Corrigido em 2026-08-16:** arquivos vazios (0 bytes) **removidos**; `styleUrls` de `HomePage` e `ToolbarComponent` ajustados (toolbar mantém apenas `app.component.scss`).

### TD-25: Capacitor appId placeholder

`io.ionic.starter` em `capacitor.config.ts`.

**Corrigido em 2026-08-16:** `appId` definido como `com.bastosgabriel.ratesync`.

### TD-26: Links externos sem `rel="noopener noreferrer"`

`info-popover.component.html` — `target="_blank"` sem rel.

**Corrigido em 2026-08-16:** adicionado `rel="noopener noreferrer"` aos links externos do popover informativo.

### TD-27: README desatualizado

`rate-sync-ionic/README.md` não menciona auth, Capacitor, Firebase, ou estrutura `core/`.

**Corrigido em 2026-08-16:** README reescrito com stack (Angular 18, Ionic 8, Capacitor 6), estrutura `core/`, comandos, contratos de integração e nota sobre auth desativado.

---

## Código duplicado (resumo)

| Item | Localização | Tipo |
|---|---|---|
| `ApiService` | `services/` ↔ `core/services/` | Cópia literal |
| `WebsocketService` | `services/` ↔ `core/services/` | Cópia literal |
| Specs de ambos | 4 arquivos espelhados | Cópia literal |
| `ion-content` aninhado | home + user-popover | Padrão repetido |

---

## Código morto (resumo)

| Item | Arquivo | Motivo |
|---|---|---|
| ~~`DataService`~~ | ~~`core/services/data.service.ts`~~ **Removido (Fase 5)** | Sem consumidores — código morto eliminado |
| `UserPopoverComponent` | `components/user-popover/` | Não integrado |
| `LoginResolver` | `core/resolvers/login.resolver.ts` | Rota inacessível |
| `auth.interceptor.ts` | `core/interceptors/` | Não registrado |
| Endpoint `GET /movie/` | backend | Não consumido pelo frontend |

---

## Problemas de performance (resumo)

| ID | Problema |
|---|---|
| P-01 | Busca sem debounce (WebSocket por keystroke) |
| P-02 | Re-fetch de ratings sem cache |
| P-03 | Mensagens WS descartadas se socket não OPEN — **Corrigido (Fase 8)**: fila de pendências (`pendingQueue`) em `websocket.service.ts` — mensagens são enfileiradas e enviadas no `onopen` |
| P-04 | 5 skeletons fixos independente do viewport — **Corrigido (Fase 8)**: `MovieListComponent` gera `skeletonItems` com base em `Platform.height()` (mínimo 3) |
| P-05 | 3 palettes dark importadas em `global.scss` — **Corrigido (Fase 7)**: mantida apenas `dark.always.css` (app é dark-only) |
| P-06 | WebSocket singleton aberto no boot — **Corrigido (Fase 8)**: `connect()` cria o `Subject` sem abrir socket; a conexão abre apenas no primeiro subscribe/uso (`open()` lazy) |

---

## Problemas de segurança no frontend (resumo)

| ID | Problema |
|---|---|
| S-01 | WebSocket sem autenticação |
| S-02 | CDN externo (Google Fonts) sem SRI aparente |
| S-03 | Links `target="_blank"` sem `noopener` |
| S-04 | Token Firebase no client (padrão SPA, mas interceptor inativo) |

---

## Matriz de priorização sugerida

Esta seção descreve ordem lógica de atenção, **não um plano de implementação**:

| Prioridade | IDs | Tema |
|---|---|---|
| 1 | TD-01, TD-02, TD-03 | Build, rotas, WebSocket |
| 2 | TD-04, TD-05, TD-06 | Consolidação e wiring |
| 3 | TD-07, TD-08 | Auth e endpoints |
| 4 | TD-09–TD-19 | Qualidade e manutenção |
| 5 | TD-20–TD-27 | Limpeza e polish |

---

## Histórico

| Data | Ação |
|---|---|
| 2026-08-16 | **Fase 11 — Robustez visual dos ratings e polish:** fontes de avaliação indisponíveis agora exibem badge + "Indisponível" (Cinemeta/OMDb/Letterboxd com `error`) via `isOmdbError`/`hasAnySourceData` em vez de sumirem silenciosamente; branding com logo (`rate-sync.png`) no header; container de largura máxima (1400px) no grid desktop; popover informativo com identidade visual; estado vazio de populares ("Nenhum filme popular disponível"); contagem de resultados oculta durante loading. **Suíte: 33 SUCCESS / build OK / lint OK.** |
| 2026-08-16 | **Fase 10 — Redesign UI/UX (aprovado pelo usuário):** design tokens "Cinematic Dark" em `theme/variables.scss` (surfaces em camadas, cores semânticas, escala tipográfica em `rem`, mapeamento `--ion-*`); `global.scss` com tipografia base, scrollbar, `:focus-visible` e `prefers-reduced-motion`; header com branding ("RateSync" com accent) e remoção do `ion-no-border` condicional por plataforma; searchbar estilizada (`Pesquisar filmes`, `aria-label`); **grid de cards com pôster** (2→4→6 colunas) substituindo a lista de linhas em `MovieListComponent`/`MovieItemComponent`; **`toggle()` próprio** substitui o `ion-accordion` (emite `requestReviews` ao expandir); apresentação de ratings com badges coloridas por fonte, escalas corretas (`formatRating`: `/10`, `%`, `/100`, `/5`), tons semânticos (`getRatingTone`); skeletons em formato de card; estados de vazio/erro com retry (`.rs-empty`, contagem de resultados, `searchQuery`/`popularsError`); `home.page.scss` recriado; budget `anyComponentStyle` ajustado (2kb→6kb, estilo de card legítimo); `index.html` permite zoom (a11y); `isAndroid`/`Platform` removidos da `HomePage`. **Suíte: 31 SUCCESS / build OK / lint OK.** |
| 2026-08-16 | Fase 8 — Tipagem, performance e avaliação de legado: TD-10 concluído (removidos `any` restantes — `AccordionGroupCustomEvent`, `SearchbarCustomEvent`, `getRatingIcon` tipado, `isAndroid: boolean`); P-03 corrigido (fila de mensagens WS em `websocket.service.ts` — pendências enviadas no `onopen`); P-04 corrigido (skeletons dinâmicos por `Platform.height()` em `MovieListComponent`); P-06 corrigido (conexão WS lazy — `connect()` não abre socket, abre no primeiro subscribe/uso); `MovieListComponent` passa a rastrear subscriptions de ratings com cleanup no `OnDestroy`; avaliação dos componentes `AVALIAR` concluída (toolbar e user-popover → **NÃO INTEGRAR**, dependem de Firebase auth). Suíte: 26 SUCCESS / build OK / lint OK. |
| 2026-08-16 | Correção dev: `environment.ts` (`http://localhost:8000/api/v1`), `WebsocketService.toWsUrl()` (scheme `ws/wss`), CORS backend via `CORS_ORIGINS` (dev + Vercel). TD-03 (problema 1) e TD-16 corrigidos; resta payload JSON no TD-03. |
| 2026-08-16 | Fase 3 — Consolidação de serviços: `core/services/` tornou-se única origem (ApiService, WebsocketService) com contrato WS de texto puro; removidos duplicados `src/app/services/*`; criado `core/models/movie.model.ts` com DTOs tipados (MovieResult, MovieRatings, MovieReviewSource, etc.) substituindo `any` nos contratos de busca/ratings. TD-03 (problema 2) e TD-04 resolvidos. |
| 2026-08-16 | Fase 4 — Resiliência frontend: `SearchBarComponent` com debounce de 300ms (TD-12/P-04), `MovieItemComponent` com cache local de ratings por título (TD-13), `ToastService` integrado para feedback de erros em `HomePage` e `MovieItemComponent`. Specs de `ApiService`, `HomePage` e `MovieItemComponent` passam a mockar serviços (`HttpClientTestingModule`, `WebsocketService`, `ToastService`). |
| 2026-08-16 | Fase 5 — Testes e limpeza final: `DataService` removido (TD-08, `DESCARTAR APÓS VALIDAÇÃO`, validação completa); specs de comportamento adicionados (busca WS + parsing em `ApiService`/`HomePage`, cache de ratings em `MovieItemComponent`, debounce em `SearchBarComponent`); specs de componentes auth legados (`Toolbar`, `UserPopover`, `LoginPage` — `NÃO INTEGRAR`) removidos; lint destravado instalando `@typescript-eslint/utils@^8.0.0` (requisito de `@angular-eslint/eslint-plugin@18`); corrigidos erros de lint pré-existentes (output `on*`, `OnInit`, empty lifecycle). Suíte: 22 SUCCESS / build OK / lint OK. |
| 2026-08-16 | Fase 7 — Qualidade e performance: `MovieItemComponent` refatorado para **presentacional** (TD-09) — busca/cache de ratings migrou para `MovieListComponent` (container smart); `isLoadingSearch` ativado em `onSearch()` (TD-11); `HomePage` implementa `OnDestroy` com cleanup de subscriptions (TD-14); `ion-content` aninhado removido em `home.page.html` (TD-18); imagem `rate-sync.png` otimizada de ~1 MB para ~103 KB (TD-17); `global.scss` reduzido para palette `dark.always` (P-05). Specs novos de `MovieListComponent`; specs de `MovieItemComponent`/`HomePage` atualizados. Suíte: 26 SUCCESS / build OK / lint OK. |
| 2026-08-16 | Fase 6 — Limpeza e polish (TD-20 a TD-27): templates oficiais padronizados para sintaxe de blocos Angular 18 (`@if`/`@for`/`@else`) — TD-23; SCSS vazios removidos (`home.page.scss`, `toolbar.component.scss`) — TD-24; `appId` Capacitor definido (`com.bastosgabriel.ratesync`) — TD-25; `rel="noopener noreferrer"` adicionado aos links externos — TD-26; README reescrito — TD-27; `@angular/localize` removido (polyfills, main.ts, tsconfig.app.json, package.json) — TD-21; `material-design-icons` desinstalado (CDN é a fonte dos ícones) — TD-22; plugins Capacitor **mantidos por decisão técnica** (auto-registrados em build nativo) — TD-20. Suíte: 22 SUCCESS / build OK / lint OK. |
| 2026-08-16 | Migração TMDB → Cinemeta: `movie-item.component.html` passa a usar `reviews.cinemeta` (rating + ano, sem `vote_count`) e poster via URL completa (`[src]="movie.poster_path"`); `getSourceRatingParameters` trata `'Cinemeta'`; `convertToNumber` removido (era usado apenas pelo `vote_count` do TMDB). |
| 2026-08 | Documento criado a partir de análise estática do código |
