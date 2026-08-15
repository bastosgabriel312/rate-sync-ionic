# RateSync Frontend — Especificações Técnicas

Documentação do **estado atual** do frontend Ionic/Angular, baseada exclusivamente no código deste repositório (`rate-sync-ionic/`).

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [architecture.md](./architecture.md) | Camadas, rotas, serviços e fluxos |
| [frontend.md](./frontend.md) | Stack, páginas, componentes, estado e configurações |
| [testing.md](./testing.md) | Testes existentes e cobertura aparente |
| [technical-debt.md](./technical-debt.md) | Débitos técnicos e problemas conhecidos |

## Documentação relacionada (monorepo)

| Documento | Localização |
|---|---|
| Integração frontend ↔ backend | [`../../specs/integration.md`](../../specs/integration.md) |
| Visão resumida da integração API | [`../../specs/api-integration.md`](../../specs/api-integration.md) |
| Índice geral do projeto | [`../../specs/README.md`](../../specs/README.md) |
| Backend (API, scrapers) | [`../../rate-sync/specs/README.md`](../../rate-sync/specs/README.md) |

## Propósito

Esta documentação descreve **como o frontend está hoje**, não como deveria ser. Quando uma informação não pôde ser inferida do código:

> *Não identificado no código analisado.*

## Regras de manutenção

- Atualizar estes arquivos quando houver mudanças estruturais no frontend.
- Referências a arquivos deste projeto usam caminhos relativos à raiz de `rate-sync-ionic/` (ex.: `src/app/...`).
- Contratos com o backend: manter alinhados com `../../specs/integration.md`.
