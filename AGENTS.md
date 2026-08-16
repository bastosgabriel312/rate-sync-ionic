# AGENTS.md — RateSync Frontend Directive

Operational directives and technical guidelines for AI agents working within the **rate-sync-ionic** (Angular 18 / Ionic 8) repository.

---

## 1. Repository Scope & Limits

This repository (`rate-sync-ionic/`) contains the frontend web/mobile application for RateSync, built with Angular 18, Ionic 8, and Capacitor 6.

- **Scope**: Modifications are strictly confined to `rate-sync-ionic/` and `rate-sync-ionic/specs/`.
- **Backend Isolation**: Do NOT modify files in `rate-sync/`. The backend is read-only for contract verification.

---

## 2. Mandatory Documentation Gate (Frontend)

> **IMPLICIT AND MANDATORY RULE**: Before proposing or executing code changes in `rate-sync-ionic/`, the agent MUST automatically inspect the frontend specifications.

### Pre-Execution Inspection Order:
1. `rate-sync-ionic/specs/README.md` — Frontend specifications index.
2. `specs/SDD.md` — Global Software Design Document.
3. `rate-sync-ionic/specs/architecture.md` — Layers, routes, and state flow.
4. `rate-sync-ionic/specs/frontend.md` — Pages, components, styles, and stack.
5. `rate-sync-ionic/specs/api-integration.md` — HTTP/WebSocket integration contracts.
6. `rate-sync-ionic/specs/technical-debt.md` — Official technical debt registry and legacy code classification.

*Token Efficiency*: Read the minimum relevant documentation necessary for the task, but always check `rate-sync-ionic/specs/README.md`, `specs/SDD.md`, and `technical-debt.md` before code edits.

---

## 3. Legacy Code & Untracked Files Directives

Consult `rate-sync-ionic/specs/technical-debt.md` before touching legacy or untracked files:

| File / Path | Official Classification | Behavioral Directive |
|---|---|---|
| `src/app/core/services/auth.service.ts` | **NÃO INTEGRAR** | Missing Firebase dependencies. Do NOT integrate in current phase. |
| `src/app/core/interceptors/auth.interceptor.ts` | **NÃO INTEGRAR** | Interceptor disabled. Do NOT register or inject into AppModule. |
| `src/app/core/resolvers/login.resolver.ts` | **NÃO INTEGRAR** | Inaccessible login resolver. Do NOT integrate. |
| `src/app/pages/login/` | **NÃO INTEGRAR** | Unrouted login page module. Do NOT integrate. |
| `src/app/components/toolbar/` | **AVALIAR** | Visual toolbar UI; evaluate visual reuse without auth logic. |
| `src/app/components/user-popover/` | **AVALIAR** | Visual popover UI; evaluate visual reuse without user session logic. |
| `src/app/core/services/api.service.ts` | **INTEGRAR** | Target consolidation: official service destination in `core/services/`. |
| `src/app/core/services/websocket.service.ts` | **INTEGRAR** | Target consolidation: official service destination in `core/services/`. |
| `src/app/core/services/data.service.ts` | **DESCARTAR APÓS VALIDAÇÃO** | Dead code calling non-existent endpoints. Candidate for physical removal after validation. |
| `src/app/core/services/toast.service.ts` | **AVALIAR** | Ionic Toast utility; evaluate integration for user feedback messages. |

> **Note on "INTEGRAR"**: Indicates the file is part of the target architectural consolidation defined in specs, **not** that the agent should edit it automatically on every task.  
> *Never delete untracked files simply because they are untracked.*

---

## 4. Legacy Removal Protocol (`DESCARTAR APÓS VALIDAÇÃO`)

Before physically deleting any file marked `DESCARTAR APÓS VALIDAÇÃO` (e.g., `DataService` or legacy duplicate services in `src/app/services/`), the agent MUST:
1. Search all references and imports (`grep_search`).
2. Search active consumers across components and pages.
3. Check test suite coverage (`Jasmine`).
4. Check module declarations and providers.
5. Update `rate-sync-ionic/specs/technical-debt.md` with final decision.
6. Only then remove the file IF explicitly authorized by task.

---

## 5. Target Frontend Architecture

The target frontend structure follows Angular 18 & Ionic 8 conventions:

```
src/app/
├── app.module.ts              # Root module
├── app-routing.module.ts      # Main routes (HomePage)
├── core/
│   ├── models/                # TypeScript interfaces for API models/DTOs
│   └── services/              # Consolidated singleton services (ApiService, WebsocketService, ToastService)
├── components/                # Reusable UI components declared in ComponentsModule
└── pages/
    └── home/                  # Main search and display page
```

### Architectural Guidelines:
- **Consolidation Target**: Create new services in `src/app/core/services/`. The duplicated folder `src/app/services/` will be consolidated.
- **Presentational Component Isolation**: Presentational components (`MovieListComponent`, `SearchBarComponent`) must NOT invoke API services directly.
- **Strict TypeScript Typing**: Replace `any` usages with dedicated interfaces in `src/app/core/models/`.

---

## 6. HTTP & WebSocket Integration Rules

- **WebSocket Search**:
  - Dynamically convert `environment.apiDomain` to `ws://` or `wss://`.
  - Send search queries as **raw UTF-8 text** (e.g., `Avatar`) without `JSON.stringify()`.
  - Apply `debounceTime(300)` on input events.
- **HTTP Requests**:
  - Consume endpoints via `HttpClient` using `environment.apiDomain`.
  - Handle network errors gracefully using `ToastService`.

---

## 7. Dependencies & Configuration

- ❌ Do NOT add packages in `package.json` without prior justification.
- ❌ Do NOT import or install `@angular/fire` or Firebase Auth in this refactoring phase.
- Environment settings reside in `src/environments/environment.ts` and `environment.prod.ts`.

---

## 8. Testing & Quality (Jasmine / Karma / Lint)

- **Framework**: Jasmine + Karma (`npm test`).
- Mock `ApiService` and `WebsocketService` in unit tests to prevent opening real WebSocket sockets during test execution.
- Validate code changes:
  ```bash
  npm test
  npm run lint
  npm run build
  ```

---

## 9. Git Safety Rules

- ❌ NEVER execute `git clean`, `git add`, `git commit`, or `git push` automatically.
- Keep changes minimal, verified, and strictly within scope.
