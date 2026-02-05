# 🎨 Design System - Riwaya

## ✅ Composants Créés

### 1. **BookCard** (`src/components/BookCard.tsx`)
Composant réutilisable pour afficher un livre avec 3 variants :

#### Variants
- **default** : Carte standard pour les grilles
- **compact** : Version compacte pour les suggestions
- **featured** : Version mise en avant avec badge "Populaire"

#### Features
- ✅ Image avec hover effect (scale)
- ✅ Badge de stock (limité, rupture)
- ✅ Badge de catégorie
- ✅ Rating avec étoiles
- ✅ Prix en grand format
- ✅ Bouton "Ajouter au panier"
- ✅ Gradient overlay au hover
- ✅ Responsive (3 tailles)

### 2. **PackCard** (`src/components/PackCard.tsx`)
Composant pour afficher un pack avec calcul d'économie :

#### Features
- ✅ Badge d'économie en % (calculé automatiquement)
- ✅ Grille de 4 livres ou image du pack
- ✅ Liste des livres inclus avec scrollbar custom
- ✅ Comparaison prix normal vs prix pack
- ✅ Affichage de l'économie en MAD
- ✅ Gradient background (blue → purple)
- ✅ Bouton CTA avec gradient

### 3. **Header** (`src/components/Header.tsx`)
Header sticky avec navigation responsive :

#### Features
- ✅ Logo avec gradient
- ✅ Navigation desktop avec underline animée
- ✅ Barre de recherche (desktop)
- ✅ Panier avec badge de quantité
- ✅ Menu mobile avec overlay
- ✅ Backdrop blur effect
- ✅ Sticky top avec shadow

## 🎨 Pages Créées

### 1. **Homepage** (`src/app/page.tsx`)

#### Sections
1. **Hero Section**
   - Gradient background (blue → indigo)
   - Pattern SVG en background
   - Badge "Livraison gratuite"
   - Titre avec gradient text
   - 2 CTA buttons (Livres, Packs)
   - Stats (500+ livres, 10K+ clients, 4.8★)
   - Wave separator SVG

2. **Features**
   - 3 cartes avec icônes
   - Livraison rapide, Paiement COD, Packs avantageux
   - Hover effects

3. **Packs Promotionnels**
   - Badge "Offres spéciales"
   - Grid de 3 packs
   - Bouton "Voir tous les packs"

4. **Nouveautés**
   - Badge "Nouveautés"
   - Grid de 8 livres (4 colonnes)
   - Premier livre en variant "featured"

5. **CTA Section**
   - Gradient background
   - Texte centré
   - Bouton CTA

6. **Footer**
   - 4 colonnes (Logo, Navigation, Aide, Contact)
   - Copyright

### 2. **Catalogue** (`src/app/books/page.tsx`)

#### Features
- ✅ Header avec gradient
- ✅ Sidebar sticky avec filtres
- ✅ Recherche par titre/auteur
- ✅ Filtres par catégorie
- ✅ Affichage des filtres actifs
- ✅ Bouton "Réinitialiser"
- ✅ Grid responsive (2-3-4 colonnes)
- ✅ Message "Aucun résultat"

### 3. **Détail Livre** (`src/app/books/[id]/page.tsx`)

#### Features
- ✅ Breadcrumb navigation
- ✅ Bouton "Retour"
- ✅ Layout 2 colonnes (image + info)
- ✅ Image sticky avec border
- ✅ Trust badges (Livraison, COD, Emballage)
- ✅ Badge catégorie cliquable
- ✅ Rating avec étoiles
- ✅ Prix en grand format avec gradient background
- ✅ Statut de stock avec indicateur coloré
- ✅ Bouton CTA "Ajouter au panier"
- ✅ Section Description
- ✅ Section Détails (tableau)
- ✅ Livres similaires (4 livres en compact)

## 🎨 Design System

### Couleurs

#### Primaires
- **Blue 600**: `#2563EB` - Boutons, liens, badges
- **Blue 700**: `#1D4ED8` - Hover states
- **Indigo 700**: `#4338CA` - Gradients

#### Secondaires
- **Green 500**: `#22C55E` - Stock disponible, économie
- **Orange 500**: `#F97316` - Stock limité
- **Red 600**: `#DC2626` - Rupture de stock
- **Purple 500**: `#A855F7` - Accents

#### Neutres
- **Gray 50**: `#F9FAFB` - Backgrounds
- **Gray 100**: `#F3F4F6` - Cards hover
- **Gray 900**: `#111827` - Texte principal

### Gradients

```css
/* Hero Background */
from-blue-600 via-blue-700 to-indigo-800

/* Pack Cards */
from-blue-50 via-white to-purple-50

/* Buttons */
from-blue-600 to-blue-700

/* Text */
from-yellow-300 to-orange-400

/* Savings Badge */
from-green-500 to-emerald-600
```

### Typography

#### Titres
- **Hero**: `text-4xl md:text-6xl lg:text-7xl font-black`
- **Section**: `text-4xl md:text-5xl font-black`
- **Card Title**: `text-base md:text-lg font-bold`

#### Corps
- **Body**: `text-base text-gray-700`
- **Small**: `text-sm text-gray-600`
- **Tiny**: `text-xs text-gray-500`

### Spacing

#### Sections
- **Padding Y**: `py-16` ou `py-20`
- **Gap Grid**: `gap-6` ou `gap-8`

#### Cards
- **Padding**: `p-4` à `p-6`
- **Rounded**: `rounded-xl` ou `rounded-2xl`

### Shadows

```css
/* Default */
shadow-sm hover:shadow-xl

/* Featured */
shadow-lg hover:shadow-2xl

/* Buttons */
shadow-md hover:shadow-lg
```

### Transitions

```css
/* Standard */
transition-all duration-300

/* Transform */
transition-transform duration-500

/* Colors */
transition-colors
```

### Effects

#### Hover
- **Scale**: `group-hover:scale-105`
- **Translate**: `group-hover:translate-x-1`
- **Opacity**: `opacity-0 group-hover:opacity-100`

#### Active
- **Scale**: `active:scale-95`

## 📱 Responsive

### Breakpoints
- **Mobile**: `< 768px` (2 colonnes)
- **Tablet**: `768px - 1024px` (3 colonnes)
- **Desktop**: `> 1024px` (4 colonnes)

### Grid Patterns

```tsx
// Books Grid
grid-cols-2 md:grid-cols-3 lg:grid-cols-4

// Packs Grid
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Features
grid-cols-1 md:grid-cols-3
```

## 🎯 Interactions

### Boutons
- **Primary**: Blue gradient avec shadow
- **Secondary**: Border avec background transparent
- **Ghost**: Hover background only

### Cards
- **Hover**: Shadow increase + scale image
- **Active**: Scale down (0.95)

### Links
- **Underline**: Animated width transition
- **Color**: Blue 600 → Blue 700

## 🔧 Custom CSS

### Scrollbar
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
```

### Smooth Scroll
```css
html {
  scroll-behavior: smooth;
}
```

## 📐 Layout

### Container
```tsx
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Sticky Elements
- **Header**: `sticky top-0 z-50`
- **Sidebar**: `sticky top-24`
- **Image Detail**: `lg:sticky lg:top-24`

## 🎨 Icons

**Library**: `lucide-react`

**Tailles**:
- Small: `w-4 h-4`
- Medium: `w-5 h-5`
- Large: `w-6 h-6`
- XL: `w-8 h-8`

## ✨ Animations

### Entrée
- Fade in
- Slide up
- Scale in

### Hover
- Scale (1.05)
- Translate X/Y
- Shadow increase

### Active
- Scale down (0.95)

## 🎯 Best Practices

1. **Toujours utiliser les composants réutilisables** (BookCard, PackCard)
2. **Respecter les variants** (default, compact, featured)
3. **Utiliser les gradients** pour les éléments importants
4. **Ajouter des hover effects** sur tous les éléments interactifs
5. **Responsive first** - mobile → desktop
6. **Accessibility** - alt text, aria labels
7. **Performance** - lazy loading, optimized images

## 🚀 Prochaines Étapes

1. [ ] Créer composant `PackCard` pour page `/packs`
2. [ ] Page détail pack `/packs/[id]`
3. [ ] Composant `CartDrawer`
4. [ ] Page panier `/cart`
5. [ ] Page checkout `/checkout`
6. [ ] Composant `Toast` pour notifications
7. [ ] Composant `Modal` pour confirmations

---

**Design inspiré par** : Librairies premium modernes, e-commerce haut de gamme, interfaces SaaS contemporaines.
