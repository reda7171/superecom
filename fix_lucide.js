const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Si le fichier importe de lucide-react, on remplace "Product" par "Package" dans l'import
    // Et dans le reste du code, si on a utilisé <Product />, on le remplace par <Package />
    if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
      // 1. Remplacer `Product as BookIcon` par `Package as BookIcon`
      content = content.replace(/Product as BookIcon/g, 'Package as BookIcon');
      
      // 2. Trouver l'import lucide-react et remplacer Product par Package
      content = content.replace(/import\s+{[^}]*}\s+from\s+['"]lucide-react['"]/g, (match) => {
        return match.replace(/\bProduct\b(?!\s+as)/g, 'Package');
      });
      
      // 3. Remplacer les balises <Product ...> par <Package ...>
      content = content.replace(/<Product /g, '<Package ').replace(/<Product\/>/g, '<Package/>');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed lucide-react in: ' + filePath);
    }
  }
});
