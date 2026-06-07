const fs = require('fs');
const path = require('path');

function renameRecursive(dir) {
  let entries = fs.readdirSync(dir);
  for (let f of entries) {
    let fullPath = path.join(dir, f);
    let stat = fs.statSync(fullPath);
    
    // Si c'est un dossier, on rentre d'abord dedans pour renommer ses enfants
    if (stat.isDirectory()) {
      renameRecursive(fullPath);
    }
    
    // Ensuite on renomme le fichier/dossier lui-même si nécessaire
    let newName = f.replace(/book/g, 'product').replace(/Book/g, 'Product');
    if (newName !== f) {
      let newFullPath = path.join(dir, newName);
      fs.renameSync(fullPath, newFullPath);
      console.log(`Renamed: ${fullPath} -> ${newFullPath}`);
    }
  }
}

renameRecursive(path.join(__dirname, 'src'));
