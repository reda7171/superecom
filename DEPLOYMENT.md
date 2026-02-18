# 🚀 Guide de Déploiement Production - Riwaya

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Configuration de l'environnement](#configuration-de-lenvironnement)
3. [Base de données](#base-de-données)
4. [Build de production](#build-de-production)
5. [Options de déploiement](#options-de-déploiement)
6. [Configuration post-déploiement](#configuration-post-déploiement)
7. [Sécurité](#sécurité)
8. [Monitoring](#monitoring)
9. [Checklist finale](#checklist-finale)

---

## 🔧 Prérequis

### Versions requises
- ✅ **Node.js:** v20.x LTS (vous avez v20.20.0 - parfait!)
- ✅ **npm:** v9.x ou supérieur
- ✅ **MySQL:** v8.0 ou supérieur
- ✅ **Git:** Pour le déploiement continu

### Vérifier vos versions
```bash
node -v    # Doit afficher v20.x.x
npm -v     # Doit afficher v9.x.x ou supérieur
```

---

## ⚙️ Configuration de l'environnement

### 1. Créer le fichier `.env.production`

```env
# Base de données production
DATABASE_URL="mysql://user:password@host:3306/riwaya_prod"

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# Olivraison API
OLIVRAISON_API_KEY=votre_api_key_production
OLIVRAISON_SECRET_KEY=votre_secret_key_production
OLIVRAISON_WEBHOOK_SECRET=votre_secret_webhook_production

# Email (SMTP)
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre-email@domaine.com
SMTP_PASSWORD=votre-mot-de-passe
SMTP_FROM=noreply@riwaya.com

# Sécurité
JWT_SECRET=votre-secret-jwt-tres-securise-32-caracteres-minimum
SESSION_SECRET=votre-secret-session-tres-securise-32-caracteres-minimum

# Upload d'images (optionnel)
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

### 2. Générer des secrets sécurisés

```bash
# Pour JWT_SECRET et SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Base de données

### 1. Configuration MySQL Production

```sql
-- Créer la base de données
CREATE DATABASE riwaya_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur dédié
CREATE USER 'riwaya_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';

-- Donner les permissions
GRANT ALL PRIVILEGES ON riwaya_prod.* TO 'riwaya_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Migration de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npx prisma migrate deploy

# (Optionnel) Seed initial
npm run prisma:seed
```

### 3. Backup automatique

```bash
# Script de backup quotidien (crontab)
0 2 * * * mysqldump -u riwaya_user -p riwaya_prod > /backup/riwaya_$(date +\%Y\%m\%d).sql
```

---

## 🏗️ Build de production

### 1. Installer les dépendances

```bash
# Mode production uniquement
npm ci --production=false
```

### 2. Build de l'application

```bash
# Build Next.js
npm run build

# Vérifier le build
ls -lah .next/standalone
```

### 3. Test du build localement

```bash
# Démarrer en mode production
npm run start

# Tester sur http://localhost:3000
```

---

## 🌐 Options de déploiement

### Option A: VPS (Ubuntu/Debian) avec PM2

#### 1. Installer sur le serveur

```bash
# SSH vers votre serveur
ssh user@votre-serveur.com

# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
sudo npm install -g pm2

# Cloner le projet
cd /var/www
git clone https://github.com/votre-repo/riwaya.git
cd riwaya
```

#### 2. Configuration PM2

Créer `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'riwaya',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/riwaya',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/riwaya-error.log',
    out_file: '/var/log/pm2/riwaya-out.log',
    time: true
  }]
}
```

#### 3. Démarrer avec PM2

```bash
# Build
npm ci
npm run build

# Démarrer
pm2 start ecosystem.config.js

# Auto-démarrage au reboot
pm2 startup systemd
pm2 save

# Vérifier les logs
pm2 logs riwaya
```

#### 4. Nginx Reverse Proxy

Créer `/etc/nginx/sites-available/riwaya`:

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy vers Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache statique
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images optimisées
    location /_next/image {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }

    # Limite de taille upload
    client_max_body_size 10M;
}
```

Activer le site:

```bash
sudo ln -s /etc/nginx/sites-available/riwaya /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

### Option B: Vercel (Recommandé pour simplicité)

#### 1. Installation Vercel CLI

```bash
npm i -g vercel
```

#### 2. Configuration

Créer `vercel.json`:

```json
{
  "version": 2,
  "env": {
    "DATABASE_URL": "@database-url",
    "OLIVRAISON_API_KEY": "@olivraison-api-key",
    "OLIVRAISON_SECRET_KEY": "@olivraison-secret-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "regions": ["cdg1"]
}
```

#### 3. Déploiement

```bash
# Login
vercel login

# Premier déploiement
vercel

# Production
vercel --prod
```

#### 4. Variables d'environnement Vercel

```bash
# Via le dashboard: https://vercel.com/dashboard
# Ou via CLI:
vercel env add DATABASE_URL production
vercel env add OLIVRAISON_API_KEY production
```

---

### Option C: Docker

#### 1. Créer `Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# Dépendances
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### 2. Créer `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - OLIVRAISON_API_KEY=${OLIVRAISON_API_KEY}
      - OLIVRAISON_SECRET_KEY=${OLIVRAISON_SECRET_KEY}
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: riwaya_prod
      MYSQL_USER: riwaya_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 3. Build et démarrage

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔐 Sécurité

### 1. Variables sensibles

```bash
# Ne jamais commiter .env
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

### 2. Rate Limiting (déjà implémenté)

Vérifier que le middleware applique bien les limites:
- Checkout: 5 requêtes / 15 minutes
- Connexion: 10 requêtes / 15 minutes

### 3. Headers de sécurité

Déjà configurés dans `middleware.ts`:
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options

### 4. HTTPS obligatoire

```javascript
// Ajouter dans next.config.ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        }
      ]
    }
  ]
}
```

---

## 📊 Monitoring

### 1. PM2 Monitoring

```bash
# Dashboard temps réel
pm2 monit

# Logs
pm2 logs riwaya --lines 100

# Redémarrage auto si crash
pm2 startup
```

### 2. Logs structurés

Créer `logger.ts`:

```typescript
export const logError = (error: Error, context: string) => {
  console.error({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    context,
    message: error.message,
    stack: error.stack
  })
}
```

### 3. Health Check

Créer `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
```

---

## ✅ Checklist finale

### Avant le déploiement

- [ ] **Tests locaux passent:** `npm run build && npm start`
- [ ] **Base de données configurée** avec migrations
- [ ] **Variables d'environnement** toutes définies
- [ ] **Secrets générés** (JWT, SESSION)
- [ ] **SSL/TLS configuré** (Let's Encrypt ou Vercel)
- [ ] **Domaine configuré** et DNS pointant vers le serveur
- [ ] **Backup base de données** configuré
- [ ] **Firewall configuré** (ports 80, 443, 3306)

### Après le déploiement

- [ ] **Tester l'application** sur le domaine de production
- [ ] **Vérifier HTTPS** fonctionne correctement
- [ ] **Test de charge** avec plusieurs utilisateurs
- [ ] **Vérifier les emails** (contact, notifications)
- [ ] **Tester Olivraison API** en production
- [ ] **Monitoring actif** (PM2, logs)
- [ ] **Google Search Console** configuré
- [ ] **Analytics** installé (Google Analytics)

### Maintenance continue

- [ ] **Backup quotidien** base de données
- [ ] **Logs rotatifs** configurés
- [ ] **Updates de sécurité** Node.js/packages
- [ ] **Monitoring uptime** (UptimeRobot, Pingdom)
- [ ] **Certificat SSL** renouvellement auto (Let's Encrypt)

---

## 🆘 Dépannage

### Problème: Build échoue

```bash
# Nettoyer et rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Problème: Base de données ne se connecte pas

```bash
# Tester la connexion
npx prisma studio

# Vérifier les migrations
npx prisma migrate status
```

### Problème: Application crash en production

```bash
# Voir les logs PM2
pm2 logs riwaya --err

# Redémarrer l'app
pm2 restart riwaya
```

---

## 📞 Support

Pour toute question:
1. Vérifier les logs: `pm2 logs`
2. Tester la santé: `https://votre-domaine.com/api/health`
3. Consulter la documentation Next.js

---

**Dernière mise à jour:** 13 février 2026
**Version Node.js recommandée:** 20.x LTS
**Version Next.js:** 16.1.6
