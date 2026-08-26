# Локальный запуск

Проект рассчитан на Windows и локальный loopback.

1. Установи Python 3.12+ и Node.js 20+.
2. Запусти `install.cmd`.
3. При необходимости создай ignored `.env` по `.env.example`.
4. Запусти `start.cmd`; диагностика — `doctor.cmd`, остановка — `stop.cmd`.

Backend слушает `127.0.0.1:8000`, frontend — `127.0.0.1:3000`. Launcher не
убивает чужие процессы на этих портах и сохраняет PID/start-time только в
ignored `.runtime/`.

Публичный deployment не поддерживается. Нельзя открывать локальный Codex CLI
bridge в сеть. Production/auth/PostgreSQL требуют отдельного security design.
