# Frontend code style

## Главный принцип

Код должен быть читаемым для человека и для Codex. Предпочитать маленькие компоненты, явные имена и разделение ответственности.

## Компоненты

Один компонент — одна ответственность.

Плохо:

- один файл содержит список, детальную страницу, карточки, сортировку, фильтрацию и helper-логику.

Хорошо:

- `MyOrdersView.tsx` отвечает за композицию;
- `OrderDetailsView.tsx` отвечает за деталку;
- `OrderCard.tsx` отвечает за карточку;
- `orders.utils.ts` отвечает за сортировку и вычисления.

## Размер файлов

Ориентиры:

- до 150 строк — хорошо;
- 150–250 строк — допустимо;
- 250+ строк — нужно подумать о разделении;
- 400+ строк — обязательно разделить.

## Hooks

Hooks использовать для состояния и сценариев:

- загрузка данных;
- submit flows;
- derived state;
- local UI state, если оно относится к feature.

Hook не должен возвращать JSX.

## Utils

Utils использовать для чистых функций:

- сортировка;
- фильтрация;
- форматирование;
- расчёт интервалов;
- проверка конфликтов.

Utils не должны обращаться к React state.

## API clients

API-клиенты должны быть тонкими:

- собрать request;
- вызвать `apiRequest`;
- вернуть DTO.

Не мапить данные в API-клиенте, если для этого уже есть `mappers`.

## Mappers

Все преобразования backend DTO → frontend model должны лежать в `src/lib/mappers`.

## Text / copy

Пользовательские тексты должны быть в `src/lib/copy.ts` или feature-specific copy-файле.

Не размазывать важные тексты по JSX. Если `copy.ts` становится слишком большим, разделить его на `src/lib/copy/`:

- `auth.ts`
- `catalog.ts`
- `checkout.ts`
- `orders.ts`
- `operator.ts`
- `profile.ts`
- `bonus.ts`
- `toast.ts`

## Types

Сейчас `src/types/index.ts` может оставаться общей точкой экспорта. Если файл продолжит расти, типы нужно разделить:

- `types/app.ts`
- `types/items.ts`
- `types/orders.ts`
- `types/auth.ts`
- `types/payments.ts`
- `types/api.ts`

## Naming

Использовать понятные имена:

- `useAuth`
- `useOrders`
- `useBookingSlots`
- `useCheckoutState`
- `filterOrdersByTab`
- `getNextActiveOrder`
- `mapBackendUserToUser`

Избегать слишком общих имён:

- `data`
- `itemData`
- `handleClick`
- `process`
- `helper`

## Imports

Порядок imports:

1. React / Next.
2. Third-party libraries.
3. UI components.
4. Feature components.
5. Hooks.
6. Lib/api.
7. Lib/utils.
8. Types.

## Запреты

Не добавлять новую бизнес-логику в `page.tsx`.

Не создавать новые большие файлы, чтобы просто переместить старый большой файл.

Не менять backend API в рамках frontend refactoring.

Не добавлять новую state-management библиотеку без необходимости.
