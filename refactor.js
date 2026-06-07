const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const replacements = [
  { search: /\bprisma\.book\b/g, replace: 'prisma.product' },
  { search: /\bprisma\.packBook\b/g, replace: 'prisma.packProduct' },
  { search: /\bprisma\.exchangeBook\b/g, replace: 'prisma.exchangeProduct' },
  { search: /\bBook\b/g, replace: 'Product' },
  { search: /\bBooks\b/g, replace: 'Products' },
  { search: /\bbook\b/g, replace: 'product' },
  { search: /\bbooks\b/g, replace: 'products' },
  { search: /\bBookCondition\b/g, replace: 'ProductCondition' },
  { search: /\bPackBook\b/g, replace: 'PackProduct' },
  { search: /\bExchangeBook\b/g, replace: 'ExchangeProduct' },
  { search: /\bbookId\b/g, replace: 'productId' },
  { search: /\bbookOfferedId\b/g, replace: 'productOfferedId' },
  { search: /\bbookRequestedId\b/g, replace: 'productRequestedId' },
  { search: /\bbookOffered\b/g, replace: 'productOffered' },
  { search: /\bbookRequested\b/g, replace: 'productRequested' },
  { search: /\btargetBookId\b/g, replace: 'targetProductId' },
  { search: /\btargetBook\b/g, replace: 'targetProduct' },
  { search: /\bPackBooks\b/g, replace: 'PackProducts' },
  { search: /\bpackBooks\b/g, replace: 'packProducts' },
];

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated: ' + filePath);
    }
  }
});
