# Frontend map

## Назначение frontend

Frontend — Next.js проект с двумя слоями: индексируемый SEO-сайт и mobile-first PWA-приложение сервиса ПРОКАТило.

Основные зоны:

- SEO-главная и публичный каталог;
- PWA-каталог;
- карточка товара;
- checkout;
- мои брони;
- профиль;
- операторская панель;
- auth.

## Основные папки

### `src/app`

Next.js app entry point. Здесь не должна жить бизнес-логика приложения.

- `src/app/page.tsx` — server-rendered SEO-главная.
- `src/app/app/page.tsx` — вход в клиентское PWA-приложение.
- `src/app/catalog/*`, `src/app/rent/*`, `src/app/blog/*` и соседние routes — SEO-страницы.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts` — индексирование и LLM discovery.

### `src/components/features`

Крупные feature-компоненты по доменам:

- `auth`
- `catalog`
- `checkout`
- `orders`
- `operator`
- `profile`

SEO-компоненты отдельно лежат в `src/components/seo`.

### `src/components/ui`

Переиспользуемые UI primitives:

- `AppButton`
- `AppCard`
- `AppBadge`
- `AppNotice`
- `AppEmptyState`
- `AppInfoRow`
- `AppSectionHeader`
- `Toast`

### `src/hooks`

Hooks для состояния и сценариев:

- auth;
- orders;
- checkout;
- catalog filtering;
- booking slots;
- toast.

### `src/lib/api`

Тонкие API-клиенты. Не содержат UI-логики и не знают о React.

### `src/lib/mappers`

Преобразование backend DTO в frontend app models.

### `src/lib`

Бизнес-утилиты frontend:

- время аренды;
- тарифы;
- статусы заказов;
- copy;
- env;
- auth session.

### `src/types`

Общие frontend types и backend DTO types.

## Правило

Если Codex добавляет новую PWA-фичу, он должен сначала определить её домен:

- catalog;
- checkout;
- orders;
- operator;
- profile;
- auth.

После этого код должен попасть в соответствующую feature-папку, а не в `page.tsx`.

Если задача касается SEO-сайта, сначала проверить `src/lib/seo/*` и `src/components/seo/*`, а не менять PWA-тексты.
