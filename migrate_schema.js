const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replacements
const replacements = [
  { search: /\bBook\b/g, replace: 'Product' },
  { search: /\bBooks\b/g, replace: 'Products' },
  { search: /\bbook\b/g, replace: 'product' },
  { search: /\bbooks\b/g, replace: 'products' },
  { search: /\bbookId\b/g, replace: 'productId' },
  { search: /\bPackBook\b/g, replace: 'PackProduct' },
  { search: /\bpack_books\b/g, replace: 'pack_products' },
  { search: /\bexchange_books\b/g, replace: 'exchange_products' },
  { search: /\bExchangeBook\b/g, replace: 'ExchangeProduct' },
  { search: /\bBookCondition\b/g, replace: 'ProductCondition' },
  { search: /\bOwnedBooks\b/g, replace: 'OwnedProducts' },
  { search: /\bSellerBooks\b/g, replace: 'SellerProducts' },
  { search: /\bPostBooks\b/g, replace: 'PostProducts' },
  { search: /\bBookOffered\b/g, replace: 'ProductOffered' },
  { search: /\bBookRequested\b/g, replace: 'ProductRequested' },
  { search: /\bbookOfferedId\b/g, replace: 'productOfferedId' },
  { search: /\bbookRequestedId\b/g, replace: 'productRequestedId' },
  { search: /\bbookOffered\b/g, replace: 'productOffered' },
  { search: /\bbookRequested\b/g, replace: 'productRequested' },
  { search: /\btargetBookId\b/g, replace: 'targetProductId' },
  { search: /\btargetBook\b/g, replace: 'targetProduct' },
];

replacements.forEach(({ search, replace }) => {
  schema = schema.replace(search, replace);
});

fs.writeFileSync(schemaPath, schema);
console.log('schema.prisma updated successfully.');
