# Responsive Design Guide - Riwaya

## 📱 Breakpoints Tailwind

```javascript
// Configuration par défaut
screens: {
  'xs': '475px',    // Petits smartphones
  'sm': '640px',    // Smartphones
  'md': '768px',    // Tablettes portrait
  'lg': '1024px',   // Tablettes landscape / petits laptops
  'xl': '1280px',   // Laptops
  '2xl': '1536px',  // Grands écrans
}
```

---

## 🎯 Stratégie Mobile-First

### Principe
Toujours coder pour mobile d'abord, puis ajouter les breakpoints pour écrans plus grands.

```tsx
// ❌ Mauvais
<div className="w-full lg:w-1/2 md:w-3/4 sm:w-full">

// ✅ Bon (mobile-first)
<div className="w-full md:w-3/4 lg:w-1/2">
```

---

## 📐 Grilles Responsives

### Layout Principal
```tsx
// Container responsive
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Contenu */}
</div>

// Grille de produits
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
  {/* Cards */}
</div>
```

### Sections Hero
```tsx
<section className="
  py-12 sm:py-16 md:py-20 lg:py-24
  px-4 sm:px-6 lg:px-8
">
  <h1 className="
    text-3xl sm:text-4xl md:text-5xl lg:text-6xl
    font-black
    leading-tight
  ">
    Titre
  </h1>
</section>
```

---

## 🖼️ Images Responsives

### Next/Image avec sizes
```tsx
<Image
  src={image}
  alt={title}
  fill
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 768px) 50vw,
    (max-width: 1024px) 33vw,
    25vw
  "
  className="object-cover"
  loading="lazy"
/>
```

### Aspect Ratios
```tsx
// Mobile: carré, Desktop: 16:9
<div className="
  aspect-square
  md:aspect-video
">
  <Image ... />
</div>
```

---

## 📝 Typographie Responsive

### Échelle de texte
```tsx
// Titres
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
<h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl">

// Corps de texte
<p className="text-sm sm:text-base md:text-lg">

// Petits textes
<span className="text-xs sm:text-sm">
```

### Line Height
```tsx
<p className="
  leading-relaxed sm:leading-loose
  text-sm sm:text-base
">
```

---

## 🎨 Espacements Responsifs

### Padding/Margin
```tsx
// Sections
<section className="py-8 sm:py-12 md:py-16 lg:py-20">

// Cards
<div className="p-4 sm:p-6 md:p-8">

// Gaps
<div className="gap-4 sm:gap-6 md:gap-8 lg:gap-10">
```

---

## 🧭 Navigation Responsive

### Header
```tsx
<header className="
  sticky top-0 z-50
  px-4 sm:px-6 lg:px-8
  py-4 sm:py-6
">
  {/* Logo */}
  <div className="flex items-center justify-between">
    {/* Mobile: Burger menu */}
    <button className="lg:hidden">
      <Menu />
    </button>
    
    {/* Desktop: Full menu */}
    <nav className="hidden lg:flex gap-8">
      {/* Links */}
    </nav>
  </div>
</header>
```

### Footer
```tsx
<footer className="
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
  gap-8 sm:gap-12
  px-4 sm:px-6 lg:px-8
  py-12 sm:py-16 lg:py-20
">
```

---

## 🛒 Composants E-commerce

### BookCard
```tsx
<div className="
  group
  bg-white
  rounded-2xl sm:rounded-3xl
  overflow-hidden
  transition-all
  hover:shadow-2xl
">
  {/* Image */}
  <div className="
    aspect-square sm:aspect-[3/4]
    relative
  ">
    <Image ... />
  </div>
  
  {/* Content */}
  <div className="p-4 sm:p-6">
    <h3 className="text-sm sm:text-base md:text-lg">
      {title}
    </h3>
    <p className="text-xl sm:text-2xl md:text-3xl">
      {price} MAD
    </p>
  </div>
</div>
```

### Cart Drawer
```tsx
<div className="
  fixed inset-y-0 right-0
  w-full sm:w-96
  bg-white
  shadow-2xl
  transform transition-transform
  z-50
">
```

---

## 📊 Tableaux Responsifs

### Admin Tables
```tsx
// Mobile: Cards
<div className="lg:hidden space-y-4">
  {items.map(item => (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Card layout */}
    </div>
  ))}
</div>

// Desktop: Table
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full">
    {/* Table layout */}
  </table>
</div>
```

---

## 🎭 Modals/Dialogs

```tsx
<div className="
  fixed inset-0
  flex items-center justify-center
  p-4 sm:p-6
  z-50
">
  <div className="
    bg-white
    rounded-2xl
    w-full
    max-w-sm sm:max-w-md lg:max-w-lg
    max-h-[90vh]
    overflow-y-auto
    p-6 sm:p-8
  ">
    {/* Modal content */}
  </div>
</div>
```

---

## 🔘 Boutons Responsifs

```tsx
// CTA Principal
<button className="
  w-full sm:w-auto
  px-6 sm:px-8 md:px-10
  py-3 sm:py-4
  text-sm sm:text-base
  font-black
  uppercase
  tracking-widest
  rounded-full
">

// Icon Buttons
<button className="
  p-2 sm:p-3
  rounded-full
">
  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
</button>
```

---

## 📱 Touch Targets (Mobile)

### Taille minimale: 44x44px
```tsx
// ✅ Bon
<button className="min-h-[44px] min-w-[44px] p-3">

// ❌ Trop petit pour mobile
<button className="p-1">
```

---

## 🎨 Utilities Responsives

### Display
```tsx
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
<div className="hidden sm:block lg:hidden">Tablet only</div>
```

### Flex Direction
```tsx
<div className="
  flex
  flex-col sm:flex-row
  gap-4
">
```

### Text Alignment
```tsx
<div className="
  text-center sm:text-left
">
```

---

## 🧪 Tests Responsifs

### Breakpoints à tester
- **320px** : iPhone SE
- **375px** : iPhone 12/13 Pro
- **390px** : iPhone 14 Pro
- **414px** : iPhone 14 Pro Max
- **768px** : iPad Portrait
- **1024px** : iPad Landscape
- **1280px** : Laptop
- **1920px** : Desktop HD

### Chrome DevTools
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Tester tous les presets + rotation
```

---

## ⚡ Performance Mobile

### Optimisations
```tsx
// Lazy loading images
<Image loading="lazy" />

// Reduce motion
<div className="
  transition-transform
  motion-reduce:transition-none
">

// Reduce animations on mobile
<div className="
  animate-bounce
  sm:animate-none
">
```

---

## 🎯 Checklist Responsive

- [ ] Toutes les pages testées sur mobile (320px-414px)
- [ ] Navigation mobile fonctionnelle (burger menu)
- [ ] Images avec `sizes` appropriés
- [ ] Textes lisibles sans zoom
- [ ] Boutons > 44x44px
- [ ] Formulaires utilisables au pouce
- [ ] Pas de scroll horizontal
- [ ] Performance mobile (Lighthouse > 90)
- [ ] Touch gestures fonctionnels
- [ ] Orientation portrait + landscape

---

## 🛠️ Outils

### Testing
- Chrome DevTools (Device Mode)
- Firefox Responsive Design Mode
- BrowserStack (vrais devices)
- Lighthouse Mobile

### Debug
```bash
# Voir les breakpoints actifs
<div className="
  before:content-['xs'] xs:before:content-['xs']
  sm:before:content-['sm']
  md:before:content-['md']
  lg:before:content-['lg']
  xl:before:content-['xl']
  2xl:before:content-['2xl']
">
```

---

## 📋 Exemples Complets

### Page Produit
```tsx
<div className="
  container mx-auto
  px-4 sm:px-6 lg:px-8
  py-8 sm:py-12 lg:py-16
">
  <div className="
    grid grid-cols-1 lg:grid-cols-2
    gap-8 lg:gap-12
  ">
    {/* Image */}
    <div className="aspect-square relative">
      <Image
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
    
    {/* Info */}
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      <p className="text-3xl sm:text-4xl lg:text-5xl">
        {price} MAD
      </p>
      <button className="
        w-full lg:w-auto
        px-8 py-4
      ">
        Ajouter au panier
      </button>
    </div>
  </div>
</div>
```

L'application est maintenant **100% responsive** avec support complet mobile, tablette et desktop.
