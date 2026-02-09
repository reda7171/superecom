# 🚀 Guide d'installation sur un nouveau PC

Ce guide vous explique comment cloner et lancer le projet **Riwaya** sur une nouvelle machine.

## 📋 Pré-requis
* **Node.js** (v18+)
* **Git**
* **Docker Desktop**
* Un éditeur de code (VS Code recommandé)

## 🛠️ Étapes d'installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/reda7171/riwaya.git
cd riwaya
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
Créez un fichier `.env` à la racine :
```env
DATABASE_URL="mysql://root:root@localhost:3306/riwaya"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Lancer l'infrastructure (Docker)
```bash
docker-compose up -d
```

### 5. Préparer la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Insérer les données de test
npx prisma db seed
```

### 6. Lancer l'application
```bash
npm run dev
```
Accès : [http://localhost:3000](http://localhost:3000)

## 🔐 Accès Administration
* **URL** : `/admin`
* **Login** : `admin@riwaya.com`
* **Password** : `admin123`

## 🐳 Commandes Docker utiles
* `docker-compose stop` : Arrêter les services.
* `docker-compose start` : Relancer les services.
* `docker-compose ps` : Vérifier l'état de la base de données.

## 🛠️ Outils Recommandés
* **Prisma Studio** : `npx prisma studio` (pour voir les données dans votre navigateur).
* **Git** : Gardez toujours votre branche à jour avec `git pull origin main`.
