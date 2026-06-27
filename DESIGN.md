# Design System

## Overview

ПРОКАТило использует один визуальный язык для PWA и публичного SEO-сайта: светлые поверхности, плотная Manrope, темный текст и оранжево-розовый акцент. Приложение остается спокойным и утилитарным; публичные страницы могут использовать один выразительный предметный интерактивный момент.

## Color

- App background: `#f8fafc`
- Public surface: `#ffffff`
- Primary ink: `#0f172a`
- Muted text: `#64748b`
- Border: `#e2e8f0`
- Brand orange: `#f97316`
- Brand rose: `#e11d48`
- Primary gradient: `from-amber-400 via-orange-500 to-rose-600`

## Typography

- Family: Manrope with system sans-serif fallback.
- Screen title: large, black weight, tight but readable line-height.
- Section title: `text-lg` to `text-3xl`, black weight.
- Body: at least `text-base` for important explanations.
- Secondary text: at least `text-sm`; `text-xs` is reserved for metadata.
- Important buttons: `text-sm` or `text-base`, black weight.
- Do not use viewport-width font scaling or negative letter spacing beyond `-0.04em`.

## Components

- App cards: white, restrained border and shadow, established radii from `frontend/docs/ui-style-guide.md`.
- Primary actions: orange-to-rose gradient, readable white text, clear focus and pressed states.
- Secondary actions: white surface, slate border and text.
- Icons: Lucide where an established symbol exists.
- Avoid nested cards, redundant badges and explanatory UI copy.

## Layout

- PWA: mobile-first, focused content column, bottom navigation and safe-area spacing.
- SEO pages: responsive full-width bands with constrained content.
- Public catalog: one full-viewport product stage, active object in front, adjacent objects at depth, then indexable supporting content below.
- Stable dimensions and explicit image aspect ratios prevent layout shift.

## Motion

- Motion clarifies product selection and navigation.
- Use transform and opacity with ease-out timing; avoid persistent `will-change` and expensive animated filters.
- The active product always remains above adjacent and rear objects.
- Respect `prefers-reduced-motion` by reducing transitions to an immediate state change.

## Source Of Truth

Detailed implementation rules remain in `frontend/docs/ui-style-guide.md`, `frontend/docs/code-style.md` and `AI_RULES.md`.
