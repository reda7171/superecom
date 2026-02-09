const fs = require('fs');
const path = require('path');

const files = [
    'src/app/[locale]/wishlist/page.tsx',
    'src/app/[locale]/tracking/page.tsx',
    'src/app/[locale]/returns/page.tsx',
    'src/app/[locale]/packs/[id]/page.tsx',
    'src/app/[locale]/packs/page.tsx',
    'src/app/[locale]/faq/page.tsx',
    'src/app/[locale]/contact/page.tsx',
    'src/app/[locale]/community/register/page.tsx',
    'src/app/[locale]/community/profile/edit/page.tsx',
    'src/app/[locale]/community/page.tsx',
    'src/app/[locale]/community/market/page.tsx',
    'src/app/[locale]/community/login/page.tsx',
    'src/app/[locale]/community/exchanges/page.tsx',
    'src/app/[locale]/community/exchange/request/[bookId]/page.tsx',
    'src/app/[locale]/community/books/new/page.tsx',
    'src/app/[locale]/checkout/success/[orderId]/page.tsx',
    'src/app/[locale]/checkout/page.tsx',
    'src/app/[locale]/cart/page.tsx',
    'src/app/[locale]/books/[id]/page.tsx',
    'src/app/[locale]/books/page.tsx',
    'src/app/[locale]/about/page.tsx',
];

let count = 0;

files.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        if (content.includes("import Header from '@/components/Header'")) {
            content = content.replace(
                "import Header from '@/components/Header'",
                "import Header from '@/components/HeaderWithUser'"
            );

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${file}`);
            count++;
        }
    } else {
        console.log(`⚠️  Not found: ${file}`);
    }
});

console.log(`\n✨ Done! Updated ${count} files.`);
