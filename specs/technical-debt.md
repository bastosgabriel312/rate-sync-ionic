# Débito Técnico — Estado Atual

Registro de problemas, duplicações e riscos identificados no frontend `rate-sync-ionic/`, baseado exclusivamente no código analisado.

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
| **Problema 1** | URL `https://...` passada ao construtor `WebSocket` (requer `ws://`/`wss://`) |
| **Problema 2** | Envia `JSON.stringify(query)`; backend usa `receive_text()` esperando texto puro |
| **Impacto** | Busca em tempo real provavelmente não funciona |

---

## Alta

### TD-04: Serviços duplicados

| Serviço | Arquivo 1 | Arquivo 2 |
|---|---|---|
| `ApiService` | `app/services/api.service.ts` | `app/core/services/api.service.ts` |
| `WebsocketService` | `app/services/websocket.service.ts` | `app/core/services/websocket.service.ts` |

Código **100% idêntico**. Specs também duplicados. Home importa de `app/services/`; restante do core fica inconsistente.

### TD-05: Componentes não registrados em NgModule

| Componente | Usado em | Declarado em |
|---|---|---|
| `ToolbarComponent` | `login.page.html` | Nenhum módulo |
| `UserPopoverComponent` | Nenhum template | Nenhum módulo |

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

Serviço existe, nenhum consumidor, endpoints ausentes no backend.

### TD-09: Smart component com chamada API direta

| Aspecto | Detalhe |
|---|---|
| **Arquivo** | `rate-sync-ionic/src/app/components/movie-item/movie-item.component.ts` |
| **Problema** | Componente de UI chama `ApiService.getMovieRatings()` diretamente |
| **Impacto** | Dificulta teste, reuso e separação de responsabilidades |

---

## Média

### TD-10: Zero interfaces TypeScript para contratos API

Uso extensivo de `any` apesar de `strict: true`. Backend tem schemas Pydantic (`rate-sync/app/api/v1/schemas.py`) não espelhados.

### TD-11: `isLoadingSearch` nunca ativado

| Arquivo | `rate-sync-ionic/src/app/pages/home/home.page.ts` |
|---|---|
| **Problema** | `onSearch()` não seta `isLoadingSearch = true` |
| **Impacto** | Skeleton de busca nunca exibido |

### TD-12: Busca sem debounce

Cada keystroke em `SearchBarComponent` emite evento → dispara mensagem WebSocket.

### TD-13: Ratings re-fetch a cada expand

`MovieItemComponent.requestReviews()` chamado no accordion change sem cache.

### TD-14: Subscriptions sem cleanup

| Arquivo | Subscribe |
|---|---|
| `home.page.ts` | Constructor — `getMovieUpdates()` |
| `toolbar.component.ts` | `ngOnInit` — 3 observables do AuthService |

### TD-15: Redirect de navegação no constructor do AuthService

Responsabilidade de routing em serviço de auth — acoplamento e risco de loops.

### TD-16: CORS backend restritivo

`rate-sync/app/main.py` permite apenas `https://ratesync.vercel.app`. Dev local e outros deploys podem falhar.

### TD-17: Asset referenciado ausente

`assets/images/rate-sync.png` referenciado em `index.html` e `movie-item.component.html`. Apenas `assets/shapes.svg` existe.

### TD-18: `ion-content` aninhado

| Arquivo |
|---|
| `rate-sync-ionic/src/app/pages/home/home.page.html` |
| `rate-sync-ionic/src/app/components/user-popover/user-popover.component.html` |

Estrutura Ionic/HTML inválida.

### TD-19: AuthService.getIdToken() sem controle de lifecycle

Usa `onAuthStateChanged` dentro de Promise — pode registrar múltiplos listeners.

---

## Baixa

### TD-20: Capacitor plugins instalados, não usados

`@capacitor/app`, `haptics`, `keyboard`, `status-bar` — zero imports em `src/`.

### TD-21: `@angular/localize` nos polyfills sem i18n

Strings hardcoded em português nos templates.

### TD-22: `material-design-icons` npm vs CDN

Pacote npm instalado; `index.html` carrega Material Icons via Google Fonts CDN.

### TD-23: Mistura de sintaxe Angular

`*ngIf`/`*ngFor` e `@if` no mesmo projeto.

### TD-24: SCSS vazio

`home.page.scss`, `toolbar.component.scss` — sem estilos.

### TD-25: Capacitor appId placeholder

`io.ionic.starter` em `capacitor.config.ts`.

### TD-26: Links externos sem `rel="noopener noreferrer"`

`info-popover.component.html` — `target="_blank"` sem rel.

### TD-27: README desatualizado

`rate-sync-ionic/README.md` não menciona auth, Capacitor, Firebase, ou estrutura `core/`.

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
| `DataService` | `core/services/data.service.ts` | Sem consumidores |
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
| P-03 | Mensagens WS descartadas se socket não OPEN |
| P-04 | 5 skeletons fixos independente do viewport |
| P-05 | 3 palettes dark importadas em `global.scss` |
| P-06 | WebSocket singleton aberto no boot |

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
| 2026-08 | Documento criado a partir de análise estática do código |
