# Système de Publicités - Documentation

## 📊 Vue d'ensemble

Système complet de gestion d'espaces publicitaires avec :
- ✅ Configuration admin (activation, image, lien, emplacement)
- ✅ Tracking analytics (vues, clics, CTR)
- ✅ Planification (dates début/fin)
- ✅ Priorités d'affichage
- ✅ Page B2B pour collaborations

---

## 🗄️ Base de données

### Model Advertisement
```prisma
model Advertisement {
  id          String      @id @default(uuid())
  title       String      // Titre de la pub
  image       String      // URL de l'image
  link        String?     // Lien de destination (optionnel)
  placement   AdPlacement // Emplacement sur le site
  isActive    Boolean     @default(false)
  priority    Int         @default(0) // Plus élevé = affiché en premier
  startDate   DateTime?   // Date de début (optionnel)
  endDate     DateTime?   // Date de fin (optionnel)
  clickCount  Int         @default(0)
  viewCount   Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum AdPlacement {
  HOMEPAGE_TOP        // Haut de la homepage
  HOMEPAGE_MIDDLE     // Milieu de la homepage
  HOMEPAGE_BOTTOM     // Bas de la homepage
  SIDEBAR             // Barre latérale
  BETWEEN_PRODUCTS    // Entre les produits
  BOOK_PAGE           // Page détail livre
  CHECKOUT            // Page checkout
  FOOTER              // Footer
}
```

### Indexes
- `[placement, isActive]` : Requêtes par emplacement
- `[isActive, priority]` : Tri par priorité

---

## 🎯 Emplacements disponibles

| Placement | Description | Taille recommandée |
|-----------|-------------|-------------------|
| `HOMEPAGE_TOP` | Bannière principale homepage | 1200x300px |
| `HOMEPAGE_MIDDLE` | Entre sections homepage | 1200x250px |
| `HOMEPAGE_BOTTOM` | Avant footer homepage | 1200x200px |
| `SIDEBAR` | Barre latérale (desktop) | 300x600px |
| `BETWEEN_PRODUCTS` | Entre grilles de produits | 1200x150px |
| `BOOK_PAGE` | Page détail livre | 728x90px |
| `CHECKOUT` | Page panier/checkout | 468x60px |
| `FOOTER` | Dans le footer | 1200x100px |

---

## 🛠️ Utilisation

### 1. Afficher une pub (Server Component)
```tsx
import AdSlot from '@/components/AdSlot'

export default function HomePage() {
  return (
    <div>
      {/* Bannière top */}
      <AdSlot 
        placement="HOMEPAGE_TOP" 
        className="mb-8"
        closeable={true}
      />
      
      {/* Contenu */}
      <main>...</main>
      
      {/* Bannière bottom */}
      <AdSlot 
        placement="HOMEPAGE_BOTTOM"
        className="mt-8"
      />
    </div>
  )
}
```

### 2. Gérer les pubs (Admin)
```
/admin/ads              → Liste des pubs
/admin/ads/new          → Créer une pub
/admin/ads/[id]/edit    → Modifier une pub
```

### 3. Actions serveur
```typescript
// Récupérer pubs actives
const ads = await getActiveAds('HOMEPAGE_TOP')

// Créer une pub
await createAd({
  title: 'Promo Livres',
  image: '/uploads/banner.jpg',
  link: 'https://example.com',
  placement: 'HOMEPAGE_TOP',
  isActive: true,
  priority: 10,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
})

// Tracker une vue
await trackAdView(adId)

// Tracker un clic
await trackAdClick(adId)
```

---

## 📈 Analytics

### Métriques trackées
- **Views** : Nombre d'affichages
- **Clicks** : Nombre de clics
- **CTR** : Click-Through Rate (clics / vues)

### Calcul automatique
```typescript
const ctr = (clicks / views) * 100
```

### Affichage admin
- Graphique d'évolution (à implémenter)
- Comparaison par emplacement
- Top performers

---

## 🎨 Composants

### `<AdSlot>` (Server)
Wrapper qui fetch et affiche la pub active

**Props :**
- `placement` : AdPlacement (requis)
- `className` : string (optionnel)
- `closeable` : boolean (optionnel)

### `<AdBanner>` (Client)
Affiche la bannière avec tracking

**Features :**
- Tracking automatique des vues (1 fois)
- Tracking des clics
- Bouton fermer (si `closeable`)
- LocalStorage pour ne pas réafficher (24h)
- Overlay hover avec titre

---

## 🔒 Sécurité

### Upload d'images
- ✅ Authentification admin requise
- ✅ Validation MIME types
- ✅ Taille max 5MB
- ✅ Sanitization nom de fichier

### Tracking
- ✅ Rate limiting sur les endpoints
- ✅ Validation des IDs
- ✅ Pas de données sensibles exposées

---

## 🌐 Page B2B

### URL
`/b2b` - Page de partenariats

### Contenu
1. **Hero** : Présentation
2. **Stats** : 10K+ visiteurs, 500+ commandes/mois
3. **Opportunités** :
   - Espaces publicitaires
   - Partenariat produits
   - Événements & Sponsoring
   - Programme d'affiliation
4. **Formulaire contact** : Demande de collaboration
5. **Contact direct** : Email, téléphone, adresse

### SEO
- ✅ Metadata optimisé
- ✅ Keywords B2B
- ✅ Structured data (à ajouter)

---

## 📝 TODO

### Court terme
- [ ] Page edit ad (`/admin/ads/[id]/edit`)
- [ ] Seed data pour exemples
- [ ] Traductions (FR/AR/EN)
- [ ] Tests responsive

### Moyen terme
- [ ] Dashboard analytics détaillé
- [ ] A/B testing pubs
- [ ] Rotation automatique (plusieurs pubs/emplacement)
- [ ] Ciblage géographique
- [ ] Ciblage par catégorie de livre

### Long terme
- [ ] API publique pour partenaires
- [ ] Système d'enchères (RTB)
- [ ] Intégration Google Ads
- [ ] Machine learning pour optimisation

---

## 🚀 Déploiement

### 1. Appliquer le schéma
```bash
npx prisma db push
npx prisma generate
```

### 2. Redémarrer le serveur
```bash
# Arrêter (Ctrl+C)
npm run dev
```

### 3. Tester
1. Aller sur `/admin/ads`
2. Créer une pub de test
3. Activer la pub
4. Vérifier l'affichage sur la homepage

---

## 💡 Exemples d'utilisation

### Homepage avec pubs
```tsx
import AdSlot from '@/components/AdSlot'

export default function HomePage() {
  return (
    <>
      <Header />
      
      {/* Pub top */}
      <AdSlot placement="HOMEPAGE_TOP" closeable />
      
      {/* Hero */}
      <HeroSection />
      
      {/* Pub middle */}
      <AdSlot placement="HOMEPAGE_MIDDLE" className="my-16" />
      
      {/* Produits */}
      <ProductsGrid />
      
      {/* Pub bottom */}
      <AdSlot placement="HOMEPAGE_BOTTOM" className="my-16" />
      
      <Footer />
    </>
  )
}
```

### Page livre avec sidebar
```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
  {/* Contenu principal */}
  <div className="lg:col-span-3">
    <BookDetails />
  </div>
  
  {/* Sidebar avec pub */}
  <aside className="hidden lg:block">
    <AdSlot placement="SIDEBAR" />
  </aside>
</div>
```

---

## 🎯 KPIs à suivre

1. **Taux d'affichage** : % de pages avec pub visible
2. **CTR moyen** : Par emplacement
3. **Revenue** : Si monétisation (future)
4. **Engagement** : Temps avant clic
5. **Conversion** : Actions après clic

---

Le système est maintenant prêt à être utilisé ! 🎉
