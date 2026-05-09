# rent-app overview
- Purpose: MVP rental service "PROKATilo" for neighbors to browse items and create rental orders.
- Structure: `backend/` contains a FastAPI + SQLAlchemy async API skeleton; `frontend/frontend/` contains a Next.js App Router prototype UI.
- Current maturity: prototype only. Frontend is a single large client component with mock data and no real backend integration. Backend has CRUD/order endpoints but lacks production-ready packaging and deployment setup.
- Extra artifacts: `frontend/frontend/app/page-copy2`, `page-last`, and `page-orderstatus-admin-panel` appear to be alternative prototype snapshots / recovery sources.
- Infra status observed on 2026-05-06: target server `82.117.87.118` is reachable over SSH as root; `prokatilo.com` resolves to that server; server is Ubuntu 24.04.1 with Python 3.12 installed but no Node.js/npm/nginx yet.