const fs = require('fs');
const path = require('path');

const locales = ['ar.json', 'fr.json', 'en.json'];
const msgDir = path.join(__dirname, 'src', 'messages');

locales.forEach(file => {
  const filePath = path.join(msgDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacement des clés (et parfois valeurs en anglais)
    content = content.replace(/"Books"/g, '"Products"');
    content = content.replace(/"Book"/g, '"Product"');
    content = content.replace(/"books"/g, '"products"');
    content = content.replace(/"book"/g, '"product"');
    
    // Traductions FR
    if (file === 'fr.json') {
      content = content.replace(/livres/gi, 'produits');
      content = content.replace(/Livre/g, 'Produit');
      content = content.replace(/livre/g, 'produit');
    }
    
    // Traductions AR
    if (file === 'ar.json') {
      content = content.replace(/كتب/g, 'منتجات');
      content = content.replace(/كتاب/g, 'منتج');
      content = content.replace(/الكتب/g, 'المنتجات');
      content = content.replace(/الكتاب/g, 'المنتج');
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated translations in ${file}`);
  }
});
