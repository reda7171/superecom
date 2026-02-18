---
description: Configuration Facebook Pixel pour Riwaya
---

## Étapes de configuration Facebook Pixel

### 1. Accéder à Events Manager
1. Allez sur https://business.facebook.com/events_manager
2. Sélectionnez votre compte professionnel
3. Cliquez sur "Connect Data Sources" → **Web**

### 2. Créer le Pixel
1. Choisissez "Meta Pixel"
2. Nommez-le : **Riwaya - Production**
3. Entrez l'URL : `https://riwaya.com` (ou votre domaine)
4. Cliquez sur "Continue"

### 3. Choisir la méthode d'installation
**Sélectionnez : "Manually install the code yourself"**

### 4. Récupérer le Pixel ID
Dans le code fourni, trouvez la ligne :
```javascript
fbq('init', 'VOTRE_PIXEL_ID');
```
Copiez le numéro (ex: 123456789012345)

### 5. Configurer dans Riwaya
```bash
# Ouvrir .env
code .env
```

Remplacer :
```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id_here
```

Par :
```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

### 6. Redémarrer le serveur
```bash
# Arrêter (Ctrl+C)
# Puis relancer
npm run dev
```

### 7. Vérifier l'installation
1. Installer [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visiter http://localhost:3000
3. Cliquer sur l'extension → Vérifier que le pixel est détecté
4. Vérifier "PageView" event

### 8. Tester les événements
Dans Events Manager :
1. Allez dans "Test Events"
2. Entrez votre URL de test
3. Naviguez sur le site
4. Vérifiez que les événements apparaissent en temps réel

### 9. Événements à configurer (optionnel)
Dans Events Manager → Data Sources → Votre Pixel → Settings :

**Event Match Quality** :
- Activer "Automatic Advanced Matching"

**Conversions API** (futur) :
- Pour tracking côté serveur (plus fiable)

### 10. Domaine vérifié
1. Business Settings → Brand Safety → Domains
2. Ajouter `riwaya.com`
3. Vérifier via DNS ou fichier HTML

## Événements trackés automatiquement

✅ **PageView** - Chaque page visitée
✅ **ViewContent** - Page produit (à implémenter)
✅ **AddToCart** - Ajout panier (à implémenter)
✅ **InitiateCheckout** - Début commande (à implémenter)
✅ **Purchase** - Commande validée (à implémenter)
✅ **Search** - Recherche (à implémenter)

## Prochaines étapes

Voir `FACEBOOK_PIXEL.md` pour intégrer les événements e-commerce dans les pages.
