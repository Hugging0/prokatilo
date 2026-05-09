# Completion checklist
- Verify backend imports/package layout still work when launched from the intended command.
- Verify database URL/driver configuration matches SQLAlchemy async engine usage.
- Run frontend install/build/lint in a writable location before deploying.
- Remove prototype-only integrations (notably Gemini) when moving toward production.
- Confirm server runtime prerequisites (Node.js, nginx, python3-venv, systemd units, reverse proxy, TLS) before calling deployment complete.
- After each implementation iteration, propose AGENTS.md updates to the user, but do not modify AGENTS.md without approval.