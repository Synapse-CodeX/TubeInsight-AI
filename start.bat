@echo off
setlocal enabledelayedexpansion
echo Starting TubeInsight AI...
echo ============================================
echo.

:: Change to script directory
cd /d "%~dp0"

:: Check if we should start Ollama (based on use_local_llm in .env)
echo [0/3] Checking configuration...
powershell -Command "$line = (Get-Content .env | Select-String -Pattern '^use_local_llm=' | Select-Object -First 1).Line; if ($line -match '^use_local_llm=(\w+)') { $useLocal = $matches[1]; if ($useLocal -eq 'true') { exit 0 } else { exit 1 } } else { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo     Local LLM mode enabled - checking Ollama...
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
    if !errorlevel! neq 0 (
        echo     Starting Ollama server in background...
        start /b "Ollama" cmd /c "ollama serve 2>&1"
        echo     Waiting for Ollama to initialize...
        timeout /t 8 /nobreak >nul
    ) else (
        echo     Ollama already running
    )
) else (
    echo     API mode enabled - skipping Ollama startup
)

echo.
echo [1/3] Starting FastAPI backend on http://localhost:8000
start /b "Backend" cmd /c "uvicorn api:app --reload --host 0.0.0.0 --port 8000 --log-level info 2>&1"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

echo.
echo [2/3] Starting Frontend on http://localhost:5173
cd frontend
start /b "Frontend" cmd /c "bun run dev 2>&1"
cd ..

echo.
echo ============================================
echo All services starting in this window!
echo Ollama:    http://localhost:11434 (if local mode)
echo Backend:   http://localhost:8000  
echo Frontend:  http://localhost:5173
echo.
echo Logs will appear below (all services combined):
echo ============================================
echo.

:: Keep the window open and show a message about how to stop
echo NOTE: To stop all services, close this window or press Ctrl+C twice
echo.
pause
