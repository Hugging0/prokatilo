# Codex UI rules for ПРОКАТило frontend

## Главный принцип

ПРОКАТило — mobile-first сервис аренды вещей. UI должен выглядеть как единое аккуратное приложение, а не как набор разных экранов.

## Типографика

Не использовать `text-[9px]` и `text-[10px]` для важных подписей, кнопок, статусов и навигации.

Предпочитать:

- screen title: `text-3xl font-black tracking-tight`
- section title: `text-lg font-black`
- card title: `text-base` или `text-lg font-black`
- body: `text-base`
- hint: `text-sm`
- label/badge/nav: `text-xs`

## Карточки

Основная карточка: `rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm`

Компактная карточка: `rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm`

Не добавлять новые случайные размеры radius, padding и shadow без необходимости.

## Кнопки

Важные кнопки должны быть не меньше `text-sm`, лучше `text-base`.

Primary button: `min-h-14 rounded-2xl px-5 text-base font-black text-white`

Secondary button: `min-h-14 rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700`

## Тексты

Тексты должны быть дружелюбными, понятными и честными.

Плохо:

- `Хорошо` для создания брони
- `Изм.`
- `Доступность`
- `Платежи привязаны`, если платежей нет

Лучше:

- `Создать бронь`
- `Изменить`
- `Наличие`
- `Оплата при получении`

## Общие компоненты

Перед созданием нового визуального паттерна проверить:

- `components/ui/AppCard`
- `components/ui/AppButton`
- `components/ui/AppBadge`
- `components/ui/AppNotice`
- `components/ui/AppSectionHeader`
- `components/ui/AppInfoRow`
- `components/ui/AppEmptyState`

Если подходящий компонент есть — использовать его, а не писать новые стили вручную.

## Empty states

Пустые состояния должны объяснять, что произошло, и давать действие.

Плохо: `Броней пока нет`

Лучше: `У вас пока нет броней. Выберите вещь из каталога, а мы привезём её после подтверждения.`

## Не делать

- Не добавлять новые бизнес-фичи в рамках UI-polish задач.
- Не менять backend API.
- Не добавлять новую библиотеку UI без необходимости.
- Не использовать слишком мелкий текст ради “красивости”.
- Не оставлять кнопки, которые выглядят рабочими, но ничего не делают.
