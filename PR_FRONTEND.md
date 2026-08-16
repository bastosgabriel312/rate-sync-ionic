Title: feat(ui): responsive fixes, dev metrics modal and RateSync header

Description:
Ajustes responsivos dos cards e skeleton; corrige alinhamento dos ícones de tom; prioriza Letterboxd na apresentação de ratings; adiciona DevMetrics modal (consome /api/v1/metrics), corrige WebSocket wrapper e e2e Playwright script.

Changes:
- src/app/components/movie-item/*: layout, alignment, rating info grouping
- src/app/components/movie-list/*: single-column on small screens, grid auto sizing
- src/app/components/dev-metrics/*: new dev-only modal to show metrics
- src/app/pages/home/*: added RateSync branded title in header and dev metrics button
- tools/e2e/search_e2e_playwright.js: made robust and reliable
- .github/workflows/ci.yml: CI template to run backend tests, build frontend and run e2e

Validation:
- Frontend: ng build succeeded locally
- Playwright e2e script passed locally (priority ordering test)

Notes:
- Dev metrics modal is dev-only (environment.production guard)
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
