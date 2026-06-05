const fs = require('fs');

const frPath = 'src/messages/fr.json';
const arPath = 'src/messages/ar.json';
const enPath = 'src/messages/en.json';

const translations = {
  fr: {
    SectionProducts: {
      Badge: "Accessoires & Goodies",
      Title: "Le coin des <span class=\"text-pink-500\">petits lecteurs</span>",
      Desc: "Découvrez notre sélection d'accessoires conçus spécialement pour accompagner vos enfants dans leurs aventures de lecture."
    },
    ClientStrings: {
      OnlyLeft: "Plus que {stock}",
      OutOfStock: "Épuisé"
    }
  },
  ar: {
    SectionProducts: {
      Badge: "إكسسوارات وهدايا",
      Title: "ركن <span class=\"text-pink-500\">القراء الصغار</span>",
      Desc: "اكتشف تشكيلتنا من الإكسسوارات المصممة خصيصًا لمرافقة أطفالك في مغامرات القراءة الخاصة بهم."
    },
    ClientStrings: {
      OnlyLeft: "بقي {stock} فقط",
      OutOfStock: "نفدت الكمية"
    }
  },
  en: {
    SectionProducts: {
      Badge: "Accessories & Goodies",
      Title: "The <span class=\"text-pink-500\">little readers'</span> corner",
      Desc: "Discover our selection of accessories specially designed to accompany your children in their reading adventures."
    },
    ClientStrings: {
      OnlyLeft: "Only {stock} left",
      OutOfStock: "Out of stock"
    }
  }
};

function updateFile(path, lang) {
  try {
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!data.KidsPage.SectionProducts) {
        data.KidsPage.SectionProducts = translations[lang].SectionProducts;
    }
    if (!data.KidsPage.ClientStrings) {
        data.KidsPage.ClientStrings = translations[lang].ClientStrings;
    }
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log('Updated ' + path);
  } catch (e) {
    console.error('Error updating ' + path, e);
  }
}

updateFile(frPath, 'fr');
updateFile(arPath, 'ar');
updateFile(enPath, 'en');
