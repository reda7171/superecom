---
trigger: always_on
---

Supprimer les ficher de test et les fichier inutile
pensé a faire des modifications sur la base de données si un colonne manque ou une table manque
toutes les tables doit etre rempli avec seed data
pensé toujours au SEO dans les annonces ,dans les images ...
pensé à traduire toutes les fonctionalité à venir
mettez de commentaires en francais n ecrivais pas beaucoup pour ne pas consommé beaucoup de crédit
remplacer les alert de javascript par une alert customisé
lors  j ecris "fin dev" push le code dans github ,sans mon intervention,always proced
brainstormé avec moi des idées à implimenté
suggèré moi des fonctionnalité à implimenté
si il ya des fonctionnaité n est pas developpé procédé au developpement automatiquement
créer des tables dans la base de données s il faut ,ajouté des colonne
pensé toujours a sécurisé api et application mobile 
toujours pensé à UI/UX design
toujours pensé à la sécurité
toujours pensé à SEO
toujours pensé à supprimé les fichiers indésirables
toujours pensé à bien structuré le projet
toujours pensé au performence de l application
toujours finir de me proposé quelque truc a developpé 
analysé le design pour voir les fonctionnalité a developpé
n écris  pas de code dans la conversation





Focus sur lisibilité + message clair

Toujours respecter :

identité visuelle fournie
ton de la marque
couleurs / style / positionnement
Aucune variation artistique hors branding.



Optimisation Performance Web (Next.js Ready)

recommander SSG / ISR / SSR

détecter les éléments lourds (images, JS)

proposer des optimisations Core Web Vitals

produire des règles compatibles Next.js / App Route






Jamais d’emojis inutiles

Pas de blabla




Follow OWASP security guidelines:

- Sanitize ALL user inputs (forms, search, URLs)
- Implement rate limiting on every API endpoint
- Never hardcode API keys - use environment variables
- Use parameterized queries to prevent SQL injection
- Validate inputs on both frontend and backend
- Rate limite


🌐 Failles côté site web (frontend / backend)

Injection SQL / NoSQL

Requêtes construites dynamiquement

Absence de requêtes préparées

XSS (Cross-Site Scripting)

Données utilisateur affichées sans échappement

Champs commentaires, profils, formulaires

CSRF

Pas de token CSRF sur les formulaires

Cookies sans SameSite

Upload de fichiers dangereux

Pas de vérification du type MIME

Upload de scripts (.php, .js)

Validation uniquement côté frontend

Aucune validation côté serveur

Données manipulables via requêtes manuelles

Messages d’erreur trop détaillés

Stack trace visible

Infos sur la base de données ou le serveur






🔌 Failles spécifiques aux API :

Pas d’authentification

Endpoints accessibles publiquement

Absence de token (JWT, OAuth…)

JWT mal utilisé

Pas de vérification de signature

Durée de vie trop longue

Token stocké en localStorage (XSS)

Rate limiting absent

Bruteforce possible

DDoS applicatif

Versioning absent

Changements cassants (/api/v1, /api/v2)

CORS trop permissif

Access-Control-Allow-Origin: *

Autorisation des credentials sans restriction

Mass Assignment

L’API accepte des champs non prévus (isAdmin, role)


envoyé des emails soit au user ou à l admin dans les actions qui mérite envoie de mail

Optimisation : Désactivation des logs de débogage pour de meilleures performances en production.


















1. Performance > Fonctionnalité

Antigravity privilégie toujours :

vitesse de chargement

Core Web Vitals

réduction du JS client
même si cela implique de simplifier une fonctionnalité.

2. Server First

Par défaut :

Server Components

SSG / ISR
Client Components uniquement si obligatoire ("use client" justifié).

3. Zéro JS Inutile

Antigravity :

identifie le JS non critique

propose dynamic import

supprime toute lib lourde non essentielle

4. Images = Priorité Absolue

Règles obligatoires :

next/image uniquement

WebP / AVIF

priority réservé au hero

lazy loading partout ailleurs

5. Data Fetching Optimisé

Toujours utiliser le cache Next.js :

force-cache si possible

revalidate sinon
❌ Pas de fetch client inutile

6. Core Web Vitals Driven

Chaque décision doit améliorer :

LCP (image + SSG)

CLS (sizes fixes, fonts optimisées)

INP (moins de JS, moins d’interactions bloquantes)













🚀 Skill 1 : Analyse Page Next.js

Antigravity sait :

détecter SSR inutile

identifier composants lourds

proposer le meilleur mode de rendu

🧩 Skill 2 : App Router Expert

séparation Server / Client

usage optimal de layout.tsx

streaming & suspense maîtrisés

⚡ Skill 3 : Cache & Revalidation

ISR intelligent

headers cache optimisés

réduction TTFB

📦 Skill 4 : Build Optimization

réduction bundle size

analyse des dépendances

suppression des warnings next build

🌐 Skill 5 : Network & Infra

compression Brotli/Gzip
HTTP/2 / HTTP/3








je veux pas de background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
je veux pas la couleur mauve/violé