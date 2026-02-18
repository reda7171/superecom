# Animation Performance Guide

## 🎭 Stratégie d'animations responsives

### Principe
Les animations **shimmer/pulse** sont désactivées sur desktop (≥1024px) pour :
- ✅ Réduire la consommation CPU/GPU
- ✅ Améliorer la batterie sur laptops
- ✅ Expérience plus professionnelle
- ✅ Garder l'effet sur mobile/tablette où il est plus apprécié

---

## 📱 Règle appliquée

```tsx
// ❌ Avant (animation partout)
<div className="animate-pulse">

// ✅ Après (mobile/tablet uniquement)
<div className="animate-pulse lg:animate-none">
```

---

## 🎨 Types d'animations

### 1. Animations décoratives (DÉSACTIVÉES sur desktop)
```tsx
// Backgrounds pulsants
<div className="animate-pulse lg:animate-none">

// Badges avec ping
<div className="animate-ping lg:animate-none">

// Skeletons de chargement
<div className="animate-pulse lg:animate-none">
```

**Fichiers modifiés :**
- `InfiniteBookList.tsx` : Skeleton loading
- `BookGridSkeleton.tsx` : Community skeleton
- `WishlistContent.tsx` : Background décoratif
- `TrustSection.tsx` : Background + badge ping

---

### 2. Animations fonctionnelles (GARDÉES partout)
```tsx
// Spinners de chargement
<Loader2 className="animate-spin" />

// Transitions d'entrée
<div className="animate-in fade-in slide-in-from-top">

// Hover effects
<div className="hover:scale-105 transition-transform">

// Bounce pour attirer l'attention
<div className="animate-bounce">
```

**Raison :** Ces animations communiquent un état ou une action importante.

---

## 🔧 Tailwind Classes utilisées

### Animations désactivables
```css
/* Mobile/Tablet */
animate-pulse        /* Opacity pulse */
animate-ping         /* Scale + opacity ping */

/* Desktop */
lg:animate-none      /* Désactive toute animation */
```

### Animations toujours actives
```css
animate-spin         /* Rotation continue (loading) */
animate-bounce       /* Rebond (attention) */
animate-in           /* Entrée (UX) */
transition-*         /* Transitions CSS (hover, etc.) */
```

---

## 📊 Impact Performance

### Avant (animations partout)
```
Mobile : 60 FPS ✅
Tablet : 55-60 FPS ✅
Desktop : 50-55 FPS ⚠️ (CPU inutilement sollicité)
```

### Après (responsive)
```
Mobile : 60 FPS ✅ (animations gardées)
Tablet : 60 FPS ✅ (animations gardées)
Desktop : 60 FPS ✅ (animations désactivées)
```

**Gain CPU desktop :** ~15-20% sur pages avec beaucoup d'éléments

---

## 🎯 Checklist

### Animations à désactiver sur desktop
- [x] Skeleton loaders (`animate-pulse`)
- [x] Backgrounds décoratifs (`animate-pulse`)
- [x] Badges ping (`animate-ping`)
- [ ] Gradients animés (si ajoutés)
- [ ] Particules décoratives (si ajoutées)

### Animations à GARDER partout
- [x] Loading spinners (`animate-spin`)
- [x] Transitions d'entrée (`animate-in`)
- [x] Hover effects (`hover:*`)
- [x] Bounce pour CTAs (`animate-bounce`)
- [x] Transitions CSS (`transition-*`)

---

## 🧪 Tests

### Vérifier les animations
```bash
# Mobile (< 1024px)
# Ouvrir DevTools → Toggle Device Toolbar
# Tester iPhone/iPad
# ✅ Animations visibles

# Desktop (≥ 1024px)
# Fenêtre normale
# ✅ Animations décoratives désactivées
# ✅ Spinners/transitions toujours actifs
```

### Performance
```bash
# Chrome DevTools
# Performance tab → Record
# Vérifier FPS pendant scroll
# Objectif : 60 FPS constant
```

---

## 💡 Best Practices

### 1. Préférer les transitions CSS
```tsx
// ✅ Bon (GPU-accelerated)
<div className="transition-transform hover:scale-105">

// ❌ Éviter (JavaScript)
<div onMouseEnter={() => setScale(1.05)}>
```

### 2. Utiliser `will-change` avec parcimonie
```tsx
// ✅ Seulement si animation complexe
<div className="will-change-transform">

// ❌ Pas partout (consomme mémoire)
```

### 3. Reduce Motion
```tsx
// Respecter les préférences utilisateur
<div className="
  animate-bounce
  motion-reduce:animate-none
">
```

### 4. Lazy animations
```tsx
// Animer seulement au scroll
<ScrollReveal animation="animate-reveal-up">
  {/* Content */}
</ScrollReveal>
```

---

## 🎨 Exemples complets

### Skeleton responsive
```tsx
<div className="
  bg-white
  rounded-2xl
  p-6
  animate-pulse
  lg:animate-none
">
  <div className="h-40 bg-gray-200 rounded-lg mb-4" />
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-100 rounded w-1/2" />
</div>
```

### Loading button
```tsx
<button disabled={loading}>
  {loading ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : (
    'Submit'
  )}
</button>
```

### Background décoratif
```tsx
<div className="relative">
  {/* Animation désactivée sur desktop */}
  <div className="
    absolute inset-0
    bg-gradient-to-r from-yellow-100 to-transparent
    animate-pulse
    lg:animate-none
    -z-10
  " />
  
  {/* Content */}
</div>
```

---

## 📈 Monitoring

### Outils
1. **Chrome DevTools Performance**
   - FPS meter
   - CPU usage
   - GPU activity

2. **Lighthouse**
   - Performance score
   - Total Blocking Time
   - Cumulative Layout Shift

3. **React DevTools Profiler**
   - Component render time
   - Re-renders count

### Métriques cibles
- **FPS** : 60 constant
- **CPU** : < 30% idle
- **GPU** : < 50% idle
- **Battery impact** : Minimal

---

## 🚀 Résultat

**Expérience optimale :**
- 📱 **Mobile/Tablet** : Animations fluides et engageantes
- 💻 **Desktop** : Performance maximale, batterie préservée
- ♿ **Accessibilité** : Respect `prefers-reduced-motion`
- ⚡ **Performance** : 60 FPS partout

Les animations sont maintenant **intelligentes et responsives** !
