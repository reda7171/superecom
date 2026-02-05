---
trigger: always_on
---

Email: admin@riwaya.com
Password: admin123 (hash: $2a$10$...)
Role: ADMIN


traduction du site web (Francais / Arabe / anglais)

inspiré vous du design existe dans image : C:\Users\redaa\Desktop\riwaya\.agent\rules\images-inspiration\template.png

pas beaucoup de lignes dans meme page ,pensé component

📘 Cahier des charges
Plateforme de vente de livres en ligne (COD)
1️⃣ Présentation générale du projet
1.1 Objectif

Créer une plateforme e-commerce de vente de livres en ligne, permettant :

La vente à l’unité

La vente par packs (2, 3, 4 livres, etc.)

Le paiement Cash On Delivery (paiement à la livraison)

Une gestion simple des commandes et des clients

1.2 Cible

Clients particuliers

Acheteurs mobiles et desktop

Marché local (COD → livraison locale)

2️⃣ Fonctionnalités principales (Front-office)
2.1 Accueil

Présentation de la plateforme

Mise en avant :

Livres populaires

Packs promotionnels

Recherche rapide

2.2 Catalogue de livres

Liste des livres avec :

Image de couverture

Titre

Auteur

Prix

Disponibilité

Filtres :

Catégorie

Prix

Packs / livres unitaires

2.3 Fiche livre

Détails du livre :

Description

Auteur

ISBN

Prix

Stock

Bouton Ajouter au panier

2.4 Gestion des packs

Un pack contient :

Nom du pack (ex : Pack 3 livres motivation)

Nombre de livres

Liste des livres inclus

Prix du pack (réduction possible)

Image du pack

Fonctionnalités :

Acheter un pack comme un produit unique

Visualiser les livres inclus dans le pack

2.5 Panier

Liste des produits (livres & packs)

Modifier les quantités

Supprimer un produit

Calcul automatique :

Sous-total

Frais de livraison

Total à payer

2.6 Checkout (Commande COD)

Formulaire client :

Nom & prénom

Téléphone

Adresse de livraison

Ville

Commentaire optionnel

Validation :

Mode de paiement : Cash On Delivery

Confirmation de commande

2.7 Confirmation de commande

Message de confirmation

Numéro de commande

Récapitulatif

3️⃣ Fonctionnalités Back-office (Admin)
3.1 Authentification Admin

Login sécurisé

Rôles (Admin, Manager – optionnel)

3.2 Gestion des livres

CRUD :

Ajouter

Modifier

Supprimer

Gestion du stock

Upload d’images

3.3 Gestion des packs

Création de packs dynamiques

Sélection de livres existants

Prix spécial du pack

Activation / désactivation

3.4 Gestion des commandes

Liste des commandes

Statuts :

En attente

Confirmée

En livraison

Livrée

Annulée

Détails commande :

Client

Produits

Adresse

Total

3.5 Gestion des clients

Historique des commandes

Informations de contact

3.6 Dashboard

Statistiques :

Nombre de commandes

Chiffre d’affaires

Packs les plus vendus

Livres les plus vendus

4️⃣ Architecture technique
4.1 Stack technique

Frontend

Next.js (App Router)

TypeScript

Tailwind CSS

Zustand / Redux (panier)

Backend

Next.js API Routes

Prisma ORM

MySQL

Infrastructure

Docker

Docker Compose

Nginx (optionnel)

5️⃣ Modélisation de la base de données (Prisma)
5.1 User (Admin)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      String
  createdAt DateTime @default(now())
}

5.2 Book
model Book {
  id          String   @id @default(uuid())
  title       String
  author      String
  description String
  price       Float
  stock       Int
  image       String
  createdAt   DateTime @default(now())
}

5.3 Pack
model Pack {
  id        String   @id @default(uuid())
  name      String
  price     Float
  books     PackBook[]
  active    Boolean  @default(true)
}

5.4 PackBook (relation)
model PackBook {
  id     String @id @default(uuid())
  packId String
  bookId String

  pack Pack @relation(fields: [packId], references: [id])
  book Book @relation(fields: [bookId], references: [id])
}

5.5 Order
model Order {
  id        String   @id @default(uuid())
  fullName  String
  phone     String
  address   String
  city      String
  total     Float
  status    String
  createdAt DateTime @default(now())
  items     OrderItem[]
}

5.6 OrderItem
model OrderItem {
  id       String @id @default(uuid())
  orderId String
  productId String
  type     String // BOOK | PACK
  quantity Int
  price    Float

  order Order @relation(fields: [orderId], references: [id])
}

6️⃣ Docker & Déploiement
6.1 Services Docker

nextjs-app

database (MySQL)

prisma


6.2 Docker Compose

Variables d’environnement

Volumes DB

Réseaux internes

7️⃣ Sécurité & Performance

Hash mot de passe (bcrypt)

Validation des inputs

Rate limiting

SEO (Next.js)

Images optimisées

8️⃣ Évolutions futures

Paiement en ligne (Stripe)

Livraison avec tracking

Codes promo

Multi-langue

Mobile App