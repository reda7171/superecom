const fs = require('fs');
const path = require('path');

const langs = ['ar', 'en', 'fr'];
const messagesDir = path.join(__dirname, 'src', 'messages');

const translations = {
  ar: {
    "BlogArticle": {
      "ShareArticle": "مشاركة المقال",
      "ArticleInfo": "معلومات المقال",
      "Reading": "قراءة",
      "Minutes": "دقائق",
      "MinRead": "دقائق قراءة",
      "Views": "مشاهدات",
      "Comments": "التعليقات",
      "PublishedOn": "نُشر في",
      "Tags": "الكلمات الدالة",
      "InThisArticle": "في هذا المقال",
      "BestQuote": "أفضل اقتباس",
      "KeyLessons": "الدروس المستفادة",
      "BestFor": "لمن هذا الكتاب؟",
      "KeyChapters": "فصول رئيسية",
      "InStock": "في المخزن",
      "OutOfStock": "نفدت الكمية",
      "Discover": "اكتشف",
      "Explore": "استكشف",
      "AllArticles": "جميع المقالات",
      "SimilarArticles": "مقالات مشابهة",
      "SeeAll": "عرض الكل",
      "ReadArticle": "اقرأ المقال",
      "Edit": "تعديل",
      "AboutAuthor": "عن الكاتب",
      "ShareTitle": "مشاركة :",
      "Copied": "تم النسخ !",
      "Share": {
        "Facebook": "فيسبوك",
        "Twitter": "إكس / تويتر",
        "LinkedIn": "لينكد إن",
        "WhatsApp": "واتساب",
        "CopyLink": "نسخ الرابط",
        "LinkCopied": "تم النسخ !"
      }
    }
  },
  en: {
    "BlogArticle": {
      "ShareArticle": "Share article",
      "ArticleInfo": "Article info",
      "Reading": "Reading",
      "Minutes": "minutes",
      "MinRead": "min read",
      "Views": "Views",
      "Comments": "Comments",
      "PublishedOn": "Published on",
      "Tags": "Tags",
      "InThisArticle": "In this article",
      "BestQuote": "Best quote",
      "KeyLessons": "Key lessons",
      "BestFor": "Best for",
      "KeyChapters": "Key chapters",
      "InStock": "In stock",
      "OutOfStock": "Out of stock",
      "Discover": "Discover",
      "Explore": "Explore",
      "AllArticles": "All articles",
      "SimilarArticles": "Similar articles",
      "SeeAll": "See all",
      "ReadArticle": "Read article",
      "Edit": "Edit",
      "AboutAuthor": "About the author",
      "ShareTitle": "Share:",
      "Copied": "Copied!",
      "Share": {
        "Facebook": "Facebook",
        "Twitter": "X / Twitter",
        "LinkedIn": "LinkedIn",
        "WhatsApp": "WhatsApp",
        "CopyLink": "Copy link",
        "LinkCopied": "Link copied!"
      }
    }
  },
  fr: {
    "BlogArticle": {
      "ShareArticle": "Partager l'article",
      "ArticleInfo": "Infos article",
      "Reading": "Lecture",
      "Minutes": "minutes",
      "MinRead": "min de lecture",
      "Views": "Vues",
      "Comments": "Commentaires",
      "PublishedOn": "Publié le",
      "Tags": "Tags",
      "InThisArticle": "Dans cet article",
      "BestQuote": "Meilleure citation",
      "KeyLessons": "Leçons clés",
      "BestFor": "Pour qui ?",
      "KeyChapters": "Chapitres clés",
      "InStock": "En stock",
      "OutOfStock": "Rupture de stock",
      "Discover": "Découvrir",
      "Explore": "Explorer",
      "AllArticles": "Tous les articles",
      "SimilarArticles": "Articles similaires",
      "SeeAll": "Voir tout",
      "ReadArticle": "Lire l'article",
      "Edit": "Modifier",
      "AboutAuthor": "À propos de l'auteur",
      "ShareTitle": "Partager :",
      "Copied": "Copié !",
      "Share": {
        "Facebook": "Facebook",
        "Twitter": "X / Twitter",
        "LinkedIn": "LinkedIn",
        "WhatsApp": "WhatsApp",
        "CopyLink": "Copier le lien",
        "LinkCopied": "Lien copié !"
      }
    }
  }
};

for (const lang of langs) {
  const filePath = path.join(messagesDir, lang + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.BlogArticle = translations[lang].BlogArticle;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("Updated " + lang + ".json");
  }
}
