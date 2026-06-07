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
  { search: /BookCard/g, replace: 'ProductCard' },
  { search: /BooksFilters/g, replace: 'ProductsFilters' },
  { search: /CosmosBooks/g, replace: 'CosmosProducts' },
  { search: /InfiniteBookList/g, replace: 'InfiniteProductList' },
  { search: /DeleteBookButton/g, replace: 'DeleteProductButton' },
  { search: /AddBookForm/g, replace: 'AddProductForm' },
  { search: /EditBookForm/g, replace: 'EditProductForm' },
  { search: /MarketBookCard/g, replace: 'MarketProductCard' },
  { search: /BookGridSkeleton/g, replace: 'ProductGridSkeleton' },
  { search: /AddManualBookReadingList/g, replace: 'AddManualProductReadingList' },
  { search: /BookCreativeModal/g, replace: 'ProductCreativeModal' },
  { search: /BookDescriptionModal/g, replace: 'ProductDescriptionModal' },
  { search: /BookCarousel/g, replace: 'ProductCarousel' },
  { search: /BooksTable/g, replace: 'ProductsTable' },
  { search: /PendingBooksTable/g, replace: 'PendingProductsTable' },
  { search: /BookFilters/g, replace: 'ProductFilters' },
  { search: /community-books/g, replace: 'community-products' },
  // And the imports paths:
  { search: /\/books\//g, replace: '/products/' },
  { search: /['"]@\/lib\/actions\/books['"]/g, replace: "'@/lib/actions/products'" },
  { search: /['"]@\/lib\/db\/books['"]/g, replace: "'@/lib/db/products'" },
  { search: /['"]@\/components\/BookCard['"]/g, replace: "'@/components/ProductCard'" },
  { search: /['"]@\/components\/BooksFilters['"]/g, replace: "'@/components/ProductsFilters'" },
  { search: /['"]@\/components\/CosmosBooks['"]/g, replace: "'@/components/CosmosProducts'" },
  { search: /['"]@\/components\/InfiniteBookList['"]/g, replace: "'@/components/InfiniteProductList'" },
  { search: /['"]@\/components\/admin\/DeleteBookButton['"]/g, replace: "'@/components/admin/DeleteProductButton'" },
  { search: /['"]@\/components\/community\/AddBookForm['"]/g, replace: "'@/components/community/AddProductForm'" },
  { search: /['"]@\/components\/community\/EditBookForm['"]/g, replace: "'@/components/community/EditProductForm'" },
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
      console.log('Fixed imports in: ' + filePath);
    }
  }
});
