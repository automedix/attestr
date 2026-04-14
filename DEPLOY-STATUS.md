# Deploy Status - 14.04.2026

## ✅ Was funktioniert
- attestr Server läuft auf VPS (217.160.242.190)
- API erreichbar auf Port 3000: `curl http://localhost:3000/api/health` → OK
- Landing Page im medorder-Design sichtbar auf http://217.160.242.190:8080
- PM2: Server läuft stabil (status: online)

## ❌ Bekannte Probleme
1. **Nginx Proxy 404**: `/api/` wird nicht korrekt weitergeleitet
   - `curl http://localhost:8080/api/health` → 404 Not Found
   - `curl http://localhost:3000/api/health` → Works (direkt)
   - Frontend zeigt "Failed to fetch" beim Upload

2. **Upload nicht möglich**: Wegen API-Routing-Problem

## 🔧 Nächste Schritte (TODO)
- [ ] Nginx `/api/` Location fixen oder neu aufsetzen
- [ ] Alternative: Port 3000 in Firewall öffnen (kurzfristiger Fix)
- [ ] SSL/HTTPS einrichten (Let's Encrypt)
- [ ] Upload-Prozess testen

## 📍 Wichtige Pfade
- App: `/var/www/attestr/`
- Server: `/var/www/attestr/server/dist/server/src/index.js`
- Client Build: `/var/www/attestr/client/dist/`
- Nginx Config: `/etc/nginx/conf.d/attestr.conf`
- Datenbank: `/var/www/attestr/data/attestr.db`

## 🔐 Umgebungsvariablen (Server)
- TOKEN_ENCRYPTION_KEY: 5b18438b159f79e4e51f2e96fa017bbed9993759b6215cef21455c867c7f6861
- PORT: 3000
- DB_PATH: /var/www/attestr/data/attestr.db
- CORS_ORIGINS: http://217.160.242.190:8080

## 📎 Referenzen
- Original Repo: https://github.com/automedix/attestr
- Design-Vorbild: medorder (automedix)
- Farbe: #fea806 (automedix Orange)
