# RateSync - Frontend

**RateSync Frontend** é a interface de usuário do sistema RateSync, desenvolvida com **Angular 18**, **Ionic 8** e **Capacitor 6**, permitindo aos usuários buscar e visualizar avaliações de filmes em tempo real a partir de várias plataformas populares (Cinemeta, OMDb, Letterboxd), com interface intuitiva e responsiva para mobile e desktop.

## Funcionalidades

- **Pesquisa Dinâmica**: Busca por filmes com debounce de 300ms e resultados em tempo real via WebSocket.
- **Consolidação de Avaliações**: Exibe avaliações de múltiplas fontes (Cinemeta, OMDb, Letterboxd) com cache local por filme.
- **Filmes Populares**: Lista de filmes populares exibida na ausência de resultados de busca.
- **Interface Responsiva**: Compatível com dispositivos móveis e desktops, utilizando o Ionic.

## Stack

- **Framework**: [Ionic](https://ionicframework.com/) 8 e [Angular](https://angular.io/) 18
- **Capacitor**: 6 (configuração de build nativo presente em `capacitor.config.ts`)
- **Linguagem**: TypeScript, HTML, SCSS
- **Gerenciador de Pacotes**: npm

## Estrutura

```
src/app/
├── app.module.ts              # Módulo raiz
├── app-routing.module.ts      # Rotas principais (HomePage)
├── core/
│   ├── models/                # Interfaces TypeScript dos contratos da API
│   └── services/              # Serviços singleton (ApiService, WebsocketService, ToastService)
├── components/                # Componentes de UI (declarados em ComponentsModule)
└── pages/
    └── home/                  # Página principal de busca e exibição
```

## Requisitos

- Node.js (compatível com Angular 18)
- npm

## Executando

```bash
npm install
npm start        # ng serve em http://localhost:4200
npm test         # Jasmine + Karma
npm run lint     # ESLint (Angular)
npm run build    # Build de produção em www/
```

## Integração com Backend

- **HTTP**: `GET /api/v1/health`, `GET /api/v1/more_populars`, `GET /api/v1/ratings/{title}`.
- **WebSocket**: `ws://<api>/api/v1/ws/find_movie/` — busca em tempo real por texto puro.

> **Nota**: Autenticação (Firebase/Auth) permanece desativada nesta fase de refatoração. Consulte `specs/technical-debt.md` para o registro técnico completo.