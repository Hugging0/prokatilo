# Frontend map

## Назначение frontend

Frontend — mobile-first клиентское приложение сервиса ПРОКАТило.

Основные зоны:

- каталог;
- карточка товара;
- checkout;
- мои брони;
- профиль;
- операторская панель;
- auth.

## Основные папки

### `src/app`

Next.js app entry point. Здесь не должна жить бизнес-логика приложения. `page.tsx` должен быть тонким composition layer: подключить hooks, выбрать view и передать props.

### `src/components/features`

Крупные feature-компоненты по доменам:

- `auth`
- `catalog`
- `checkout`
- `orders`
- `operator`
- `profile`

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

Если Codex добавляет новую фичу, он должен сначала определить её домен:

- catalog;
- checkout;
- orders;
- operator;
- profile;
- auth.

После этого код должен попасть в соответствующую feature-папку, а не в `page.tsx`.
