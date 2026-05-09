# Suggested commands
- Inspect files: `rg --files /Users/hapkovaleksandr/rent-app -g '!backend/venv/**' -g '!**/.next/**'`
- Search code: `rg -n "pattern" /Users/hapkovaleksandr/rent-app`
- View backend files: `sed -n '1,220p' /Users/hapkovaleksandr/rent-app/backend/app/main.py`
- View frontend files: `sed -n '1,260p' /Users/hapkovaleksandr/rent-app/frontend/frontend/app/page.tsx`
- Sync project to server: `rsync -av --delete --exclude 'backend/venv' --exclude 'frontend/frontend/.next' --exclude 'frontend/frontend/node_modules' /Users/hapkovaleksandr/rent-app/ root@82.117.87.118:/opt/prokatilo/app/`
- Check server basics: `ssh -o BatchMode=yes -o ConnectTimeout=10 root@82.117.87.118 'uname -a; cat /etc/os-release'`
- Check DNS from server: `ssh -o BatchMode=yes -o ConnectTimeout=10 root@82.117.87.118 'getent ahostsv4 prokatilo.com'`
- Note: write operations in `/Users/hapkovaleksandr/rent-app` are blocked by current sandbox; use a writable workspace copy or request explicit elevated write access when editing/installing there.