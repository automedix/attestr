# Deploy-Anleitung für attestr auf VPS

## Voraussetzungen
- Ubuntu Server (22.04 oder neuer empfohlen)
- Node.js 20+ und npm
- Git
- PM2 (für Process Management)
- Nginx (als Reverse Proxy)

---

## Schritt 1: Server vorbereiten

```bash
# System aktualisieren
apt update && apt upgrade -y

# Node.js 20 installieren (falls nicht vorhanden)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx

# PM2 global installieren
npm install -g pm2

# Verzeichnis erstellen
mkdir -p /var/www/attestr
cd /var/www/attestr
```

---

## Schritt 2: Repository klonen

```bash
cd /var/www/attestr

# Repo klonen (öffentlich, da Token nicht mehr nötig)
git clone https://github.com/automedix/attestr.git .

# Branch wechseln (falls nötig)
git checkout main
```

---

## Schritt 3: Dependencies installieren

```bash
# Root-Dependencies installieren
npm install

# Client-Dependencies installieren
cd client
npm install
cd ..

# Server-Dependencies installieren
cd server
npm install
cd ..
```

---

## Schritt 4: Umgebungsvariablen konfigurieren

### Server .env erstellen:

```bash
cd /var/www/attestr/server
cp .env.example .env
nano .env
```

**Wichtige Werte anpassen:**

```env
# Pfad zur SQLite Datenbank
DB_PATH=/var/www/attestr/data/attestr.db

# Token Encryption Key (64 Hex-Zeichen) - ERSTELLE EINEN NEUEN!
TOKEN_ENCRYPTION_KEY=dein64stelligeshexkeyhier

# Cashu Mint URL
MINT_URL=https://mint.macadamia.cash

# CORS - deine Domain hier eintragen
CORS_ORIGINS=https://attestr.deinedomain.de,http://localhost:5173

# Port (intern, wird via Nginx exposed)
PORT=3000

# Trusted Proxy (für Rate Limiting hinter Nginx)
TRUSTED_PROXY=1
```

**Token Encryption Key generieren:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Client .env erstellen (für Build):

```bash
cd /var/www/attestr/client
cp .env.example .env
nano .env
```

```env
VITE_API_URL=https://attestr.deinedomain.de/api
VITE_BLOSSOM_URL=https://blossom.nostr.download
```

---

## Schritt 5: Datenbank-Verzeichnis erstellen

```bash
mkdir -p /var/www/attestr/data
chown -R www-data:www-data /var/www/attestr/data
```

---

## Schritt 6: Client bauen

```bash
cd /var/www/attestr/client
npm run build

# Build-Verzeichnis prüfen
ls -la dist/
```

---

## Schritt 7: Server mit PM2 starten

```bash
cd /var/www/attestr

# Server als PM2 Prozess starten
pm2 start server/dist/index.js --name attestr-server

# PM2 speichern für Autostart
pm2 save
pm2 startup systemd
```

---

## Schritt 8: Nginx konfigurieren

```bash
nano /etc/nginx/sites-available/attestr
```

**Nginx Config:**

```nginx
server {
    listen 80;
    server_name attestr.deinedomain.de;  # DEINE DOMAIN HIER

    # Client (Frontend)
    location / {
        root /var/www/attestr/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API (Backend)
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload-Größe erhöhen (für Datei-Uploads)
    client_max_body_size 100M;
}
```

**Config aktivieren:**

```bash
# Symlink erstellen
ln -s /etc/nginx/sites-available/attestr /etc/nginx/sites-enabled/

# Standard-Seite entfernen (optional)
rm /etc/nginx/sites-enabled/default

# Nginx testen und neustarten
nginx -t
systemctl restart nginx
```

---

## Schritt 9: SSL mit Let's Encrypt (empfohlen)

```bash
# Certbot installieren
apt install -y certbot python3-certbot-nginx

# Zertifikat erzeugen (ersetze mit deiner Domain!)
certbot --nginx -d attestr.deinedomain.de

# Auto-Renewal testen
certbot renew --dry-run
```

---

## Schritt 10: Deployment testen

```bash
# Logs prüfen
pm2 logs attestr-server

# API Health-Check
curl https://attestr.deinedomain.de/api/health
```

---

## Wartung

### Updates deployen:

```bash
cd /var/www/attestr
git pull origin main
npm install
cd client && npm install && npm run build && cd ..
cd server && npm install && npm run build && cd ..
pm2 restart attestr-server
```

### Logs ansehen:

```bash
pm2 logs attestr-server
```

### Neustart:

```bash
pm2 restart attestr-server
```

---

## Fehlerbehebung

### Port bereits belegt:
```bash
# Prozess auf Port 3000 finden und stoppen
lsof -ti:3000 | xargs kill -9
```

### Berechtigungsprobleme:
```bash
chown -R www-data:www-data /var/www/attestr
chmod -R 755 /var/www/attestr
```

### Datenbank-Fehler:
```bash
# Stelle sicher, dass das Datenbank-Verzeichnis existiert
mkdir -p /var/www/attestr/data
chmod 755 /var/www/attestr/data
```

---

Fragen? Überprüfe die Logs mit `pm2 logs`!
