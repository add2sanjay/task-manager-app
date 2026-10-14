# Starts the backend (FastAPI, port 8000) and frontend (Vite, port 3000),
# each in its own PowerShell window. Close a window (or Ctrl+C in it) to stop that server.
#
# Usage, from the repo root:
#   powershell -ExecutionPolicy Bypass -File .\start-dev.ps1

$root = $PSScriptRoot

# Backend: uses the existing venv in backend\venv
Start-Process powershell -WorkingDirectory "$root\backend" -ArgumentList @(
    '-NoExit', '-Command',
    '.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000'
)

# Frontend: installs deps on first run, then starts the dev server
Start-Process powershell -WorkingDirectory "$root\frontend" -ArgumentList @(
    '-NoExit', '-Command',
    'if (-not (Test-Path node_modules)) { npm install }; npm run dev'
)

Write-Host "Backend:  http://localhost:8000  (docs: http://localhost:8000/docs)"
Write-Host "Frontend: http://localhost:3000"
