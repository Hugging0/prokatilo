# UI style guide

ПРОКАТило — mobile-first сервис аренды вещей. Интерфейс должен ощущаться как одно аккуратное приложение: спокойные карточки, читаемая типографика, понятные статусы и честные действия.

## Типографика

- Screen title: `text-3xl font-black tracking-tight leading-tight text-slate-950`
- Section title: `text-lg font-black tracking-tight text-slate-950`
- Card title: `text-base` или `text-lg font-black leading-snug text-slate-950`
- Main body: `text-base font-bold leading-relaxed text-slate-600` / `text-slate-700`
- Secondary text: `text-sm font-bold leading-relaxed text-slate-500`
- Meta label: `text-xs font-black uppercase tracking-widest text-slate-500`
- Button text: `text-sm` или `text-base font-black`
- Bottom navigation label: `text-xs font-black`
- Badge: `text-xs font-black`

Не использовать `text-[9px]` и `text-[10px]` для важных подписей, кнопок, статусов и навигации. Если текст должен быть маленьким, начинать с `text-xs`.

## Карточки

- Default: `rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm`
- Compact: `rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm`
- Hero: `rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm`
- Dark: `rounded-[1.75rem] border border-white/10 bg-white/10 p-5 shadow-sm`

Предпочтительные радиусы: `rounded-2xl`, `rounded-[1.5rem]`, `rounded-[1.75rem]`, `rounded-[2rem]`. Не добавлять новые случайные radius/padding/shadow без причины.

## Кнопки

- Primary: `min-h-14 rounded-2xl px-5 text-base font-black text-white shadow-xl active:scale-95`
- Secondary: `min-h-14 rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-sm active:scale-95`
- Danger: как secondary, но `border-rose-100 bg-rose-50 text-rose-700`
- Small action: `rounded-xl px-3 py-2 text-xs font-black`

Важные кнопки не должны быть мельче `text-sm`; предпочтительно `text-base`.

## Отступы экранов

- Main: `min-h-screen bg-slate-50 px-5 pt-10 pb-32`
- Content wrapper: `mx-auto max-w-2xl`
- Section gap: `gap-5` или `gap-6`
- Card gap внутри секции: `gap-3` или `gap-4`

## Empty states

Использовать `AppEmptyState`:

- container: `rounded-[1.75rem] border border-slate-100 bg-white px-6 py-10 text-center shadow-sm`
- title: `text-2xl font-black tracking-tight text-slate-950`
- description: `text-base font-bold leading-relaxed text-slate-500`
- action: primary или secondary button

Пустое состояние объясняет, что произошло, и дает понятное действие.

## Notices

- Default: `rounded-[1.5rem] border border-slate-100 bg-white p-5 text-base font-bold leading-relaxed text-slate-500 shadow-sm`
- Danger: `rounded-[1.5rem] border border-rose-100 bg-rose-50 p-5 text-base font-bold leading-relaxed text-rose-600 shadow-sm`
- Warning: `rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5 text-base font-bold leading-relaxed text-amber-800 shadow-sm`

## Общие компоненты

Перед созданием нового визуального паттерна проверить:

- `components/ui/AppCard`
- `components/ui/AppButton`
- `components/ui/AppBadge`
- `components/ui/AppNotice`
- `components/ui/AppSectionHeader`
- `components/ui/AppInfoRow`
- `components/ui/AppEmptyState`

Если подходящий компонент есть, использовать его вместо новых ручных классов.
