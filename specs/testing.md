# Testes — Estado Atual

Documentação da estratégia de testes existente no frontend `rate-sync-ionic/`.

---

## Infraestrutura

| Aspecto | Configuração |
|---|---|
| Framework | Jasmine |
| Runner | Karma |
| Config Karma | `rate-sync-ionic/karma.conf.js` |
| Config Angular | `rate-sync-ionic/angular.json` → target `test` |
| Coverage | `karma-coverage` → `./coverage/app` |
| Browser | Chrome |
| Comando | `npm test` (script em `package.json`) |

**Execução em CI:** configuração `ci` presente em `angular.json` (`progress: false`, `watch: false`), mas pipeline CI: **não identificado no código analisado.**

---

## Inventário de specs

17 arquivos `.spec.ts` identificados em `rate-sync-ionic/src/`:

| Spec | Arquivo testado | Assertions |
|---|---|---|
| `app.component.spec.ts` | `AppComponent` | Criação |
| `home.page.spec.ts` | `HomePage` | Criação + parsing WS (Fase 5) |
| `api.service.spec.ts` | `ApiService` (core/services/) | Criação + busca/updates/HTTP — mock de `WebsocketService` + `HttpClientTestingModule` (Fases 4–5) |
| `websocket.service.spec.ts` | `WebsocketService` (core/services/) | Criação + conexão lazy + fila de mensagens (Fase 8) |
| `toast.service.spec.ts` | `ToastService` | `should be created` |
| `search-bar.component.spec.ts` | `SearchBarComponent` | Criação + debounce 300ms + clear (Fase 5) |
| `movie-list.component.spec.ts` | `MovieListComponent` | Criação + fetch/cache de ratings + skeletons dinâmicos (Fases 7–8) |
| `movie-item.component.spec.ts` | `MovieItemComponent` | Criação + emissão `requestReviews` + parsing OMDB (Fase 7, presentacional) |
| `movie-item-skeleton.component.spec.ts` | `MovieItemSkeletonComponent` | Criação |
| `movie-ratings-skeleton.component.spec.ts` | `MovieRatingsSkeletonComponent` | Criação |
| `info-popover.component.spec.ts` | `InfoPopoverComponent` | Criação |

**Specs ausentes:**

| Arquivo | Motivo relevante |
|---|---|
| `auth.service.spec.ts` | Não identificado no código analisado |
| `auth.interceptor.ts` | Não identificado no código analisado |
| `login.resolver.ts` | Não identificado no código analisado |

---

## Padrão dos testes existentes

### Services

Exemplo típico (`rate-sync-ionic/src/app/core/services/api.service.spec.ts`):

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({});
  service = TestBed.inject(ApiService);
});

it('should be created', () => {
  expect(service).toBeTruthy();
});
```

- Sem mocks de `HttpClient`, `WebsocketService` ou `environment`
- `ApiService` no constructor abre conexão WebSocket real — teste pode falhar ou ter efeitos colaterais

### Pages

Exemplo (`rate-sync-ionic/src/app/pages/home/home.page.spec.ts`):

```typescript
declarations: [HomePage],
imports: [IonicModule.forRoot()]
// Sem mock de ApiService, PopoverController, Platform
```

- Apenas verifica criação do componente
- `HomePage` constructor subscribe em `ApiService.getMovieUpdates()` — dependência não mockada

### Components

Padrão idêntico: `declarations` + `IonicModule.forRoot()` + `should create`.

---

## Cobertura aparente

| Área | Cobertura |
|---|---|
| Criação de instâncias | Baixa — smoke tests apenas |
| Lógica de negócio | **Não identificado no código analisado** |
| Integração HTTP | **Não identificado no código analisado** |
| Integração WebSocket | **Não identificado no código analisado** |
| Fluxos de auth | **Não identificado no código analisado** |
| Error handling | **Não identificado no código analisado** |
| Templates / DOM | **Não identificado no código analisado** |
| Interceptors | **Não identificado no código analisado** |
| Resolvers | **Não identificado no código analisado** |

Relatório de coverage gerado: configurado (`karma-coverage`), mas valor numérico de cobertura: **não identificado no código analisado** (requer execução de `npm test`).

---

## Lint

| Aspecto | Configuração |
|---|---|
| Tool | ESLint |
| Config | `rate-sync-ionic/.eslintrc.json` |
| Patterns | `src/**/*.ts`, `src/**/*.html` |
| Comando | `npm run lint` |

Regras principais: sufixo `Page`/`Component`, prefixo `app`, kebab-case.

Resultado da última execução de lint: **não identificado no código analisado.**

---

## Testes E2E

Framework E2E (Cypress, Playwright, Protractor): **não identificado no código analisado.**

---

## Problemas identificados nos testes

| # | Problema | Impacto |
|---|---|---|
| 1 | ~~Specs duplicados para `ApiService` e `WebsocketService` em duas pastas~~ **Resolvido (Fase 3)**: duplicatas removidas | Manutenção dobrada |
| 2 | ~~`HomePage` spec sem mock de `ApiService`~~ **Resolvido (Fase 4)**: mock de `ApiService` + `ToastService` | Provável falha ou side effects |
| 3 | `LoginPage` spec sem mock de `AuthService` | Provável falha (Firebase ausente) |
| 4 | ~~`ApiService` spec instancia serviço que abre WebSocket~~ **Resolvido (Fase 4)**: `WebsocketService` mockado (`connect` → `Subject`) + `HttpClientTestingModule` | Teste frágil |
| 5 | Zero testes de comportamento funcional | Regressões não detectadas |
| 6 | Sem testes do interceptor de auth | Wiring não verificado |

---

## Comportamentos críticos sem teste

Lista de fluxos importantes sem spec de comportamento identificado:

1. Parsing de resposta WebSocket em `HomePage` (`JSON.parse`, tratamento de `error`)
2. ~~Envio de query via WebSocket (`JSON.stringify` vs texto puro)~~ — contrato corrigido (texto puro) em 2026-08-16; spec de `WebsocketService` (core) com mock do `WebSocket` nativo criado em 2026-08-16 (Fase 8): conexão lazy + fila de mensagens
3. Fetch de ratings no expand do accordion (com cache local por título — Fase 4)
4. Lógica de ícones de sentimento (`getRatingIcon`, thresholds por fonte)
5. Mapeamento de erros Firebase em `LoginPage.getErrorMessage()`
6. Redirect automático em `AuthService` constructor
7. Debounce em `SearchBarComponent` (300ms) — emissão de `searchChange`/`searchCleared`

---

## Estado atual da suíte (2026-08-16, Fase 8)

`npm test`: **29 specs, 29 SUCCESS** ✅ — suíte totalmente verde.

- `ApiService` (8 testes): criação, busca WS, updates, HTTP `more_populars`/`ratings` (com `HttpClientTestingModule` + mock de `WebsocketService`).
- `HomePage` (3): criação + parsing do WebSocket (lista / erro).
- `MovieListComponent` (5, Fases 7–8): criação + fetch/cache de ratings por título como container smart + skeletons dinâmicos por viewport.
- `MovieItemComponent` (4, Fase 7): criação + emissão de `requestReviews` no accordion + parsing OMDB — **presentacional, sem `ApiService`**.
- `SearchBarComponent` (3): criação + debounce de 300ms + clear imediato.
- `WebsocketService` (3, Fase 8): criação + conexão **lazy** (P-06) + fila de mensagens até `onopen` (P-03).
- Demais specs de criação (skeletons, popover).

**Fase 7 (TD-09):** a responsabilidade de busca/cache de ratings migrou de `MovieItemComponent` (smart) para `MovieListComponent` (container) — `HomePage` → `MovieList` → `MovieItem` (presentacional). Specs atualizados conforme o novo contrato de `@Input`/`@Output`.

**Removidos na Fase 5:** specs de `DataService` (serviço removido) e de componentes auth legados `LoginPage`/`Toolbar`/`UserPopover` (compilavam contra Firebase ausente sem valor de cobertura — `NÃO INTEGRAR`).
