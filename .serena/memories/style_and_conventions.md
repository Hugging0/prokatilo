# Style and conventions
- Backend style: simple module-based FastAPI code with Russian comments/docstrings. Uses SQLAlchemy async session patterns and Pydantic models.
- Frontend style: TypeScript React with Next.js App Router and Tailwind CSS utility classes. Current implementation favors dense inline JSX/Tailwind in a single component rather than extracted components.
- Naming: backend models use `ItemModel` / `OrderModel`; frontend state and helpers are camelCase. UI copy is primarily Russian.
- Important caveat: existing code has inconsistent architecture and should not be treated as an established convention baseline. Prefer introducing clearer component boundaries, typed domain models, API client helpers, and production-safe backend package imports in future work.