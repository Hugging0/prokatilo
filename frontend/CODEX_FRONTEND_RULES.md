# Codex frontend rules for ПРОКАТило

## Перед изменениями

Перед изменением frontend Codex должен проверить:

1. `frontend/docs/frontend-map.md`
2. `frontend/docs/code-style.md`
3. `frontend/docs/refactoring-rules.md`
4. `frontend/docs/feature-structure.md`
5. `frontend/docs/ui-style-guide.md`, если задача касается UI

## Главные правила

- Не добавлять бизнес-логику в `src/app/page.tsx` и `src/app/app/page.tsx`.
- Не менять тексты PWA, если задача касается только SEO-слоя.
- Не раздувать feature view больше 250 строк.
- Если файл становится больше 250 строк, выделить components/hooks/utils.
- Чистые функции держать в `lib` или `*.utils.ts`.
- Состояние и сценарии держать в hooks.
- UI держать в components.
- API-запросы держать в `src/lib/api`.
- DTO → app model держать в `src/lib/mappers`.
- Общие visual primitives брать из `src/components/ui`.

## Когда создавать hook

Создать hook, если код:

- грузит данные;
- хранит loading/error;
- делает submit;
- синхронизирует state;
- содержит derived state, используемый компонентом;
- нужен повторно или усложняет компонент.

## Когда создавать util

Создать util, если код:

- не использует React;
- принимает значения и возвращает результат;
- сортирует;
- фильтрует;
- форматирует;
- рассчитывает цену, период, доступность, статус.

## Когда создавать component

Создать component, если JSX-блок:

- повторяется;
- больше 40–60 строк;
- имеет понятное самостоятельное назначение;
- мешает читать основной view.

## Запреты

- Не менять backend API.
- Не добавлять новые библиотеки без необходимости.
- Не делать большой rewrite.
- Не смешивать UI-polish и logic-refactoring в одном большом изменении.
- Не оставлять мёртвый код.
- Не оставлять TODO без причины.
