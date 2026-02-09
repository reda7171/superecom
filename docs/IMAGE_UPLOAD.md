# 📸 Système d'Upload d'Images

## Fonctionnalités

✅ **Upload d'images pour les livres d'échange**
- Formats supportés : JPG, PNG, WebP
- Taille maximale : 5MB
- Drag & drop + sélection de fichier
- Prévisualisation en temps réel
- Stockage local dans `/public/uploads/books/`

## Composants

### `ImageUpload.tsx`
Composant réutilisable pour l'upload d'images avec :
- Interface drag-and-drop
- Prévisualisation de l'image
- Validation du type et de la taille
- Bouton de suppression

### Actions Serveur

**`upload.ts`**
- `uploadBookImage(formData)` : Upload une image et retourne l'URL
- `deleteBookImage(imageUrl)` : Supprime une image du serveur

## Utilisation

```tsx
import ImageUpload from '@/components/ImageUpload'

const [selectedImage, setSelectedImage] = useState<File | null>(null)

<ImageUpload
    onImageSelect={setSelectedImage}
    currentImage="/uploads/books/existing.jpg" // Optionnel
    onRemove={() => setSelectedImage(null)}
/>
```

## Sécurité

- ✅ Validation du type MIME
- ✅ Limitation de taille (5MB)
- ✅ Noms de fichiers uniques (timestamp + random)
- ✅ Stockage dans dossier dédié
- ✅ `.gitignore` pour ne pas committer les uploads

## Structure

```
public/
  uploads/
    books/
      .gitignore
      book_1234567890_abc123.jpg
      book_1234567891_def456.png
```

## Améliorations futures

- [ ] Compression automatique des images
- [ ] Redimensionnement côté serveur
- [ ] Stockage cloud (S3, Cloudinary)
- [ ] Gestion des miniatures
- [ ] Watermarking
