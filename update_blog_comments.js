const fs = require('fs');
const path = require('path');

const langs = ['ar', 'en', 'fr'];
const messagesDir = path.join(__dirname, 'src', 'messages');

const translations = {
  ar: {
    "CommentsTitle": "التعليقات",
    "LeaveComment": "اترك تعليقاً",
    "YourName": "اسمك (اختياري)",
    "YourMessage": "رسالتك...",
    "SubmitComment": "إرسال التعليق",
    "NoComments": "لا توجد تعليقات حتى الآن.",
    "CommentSent": "تم إرسال التعليق!",
    "ErrorOccurred": "حدث خطأ ما.",
    "Anonymous": "مجهول"
  },
  en: {
    "CommentsTitle": "Comments",
    "LeaveComment": "Leave a comment",
    "YourName": "Your name (optional)",
    "YourMessage": "Your message...",
    "SubmitComment": "Submit comment",
    "NoComments": "No comments yet.",
    "CommentSent": "Comment submitted!",
    "ErrorOccurred": "An error occurred.",
    "Anonymous": "Anonymous"
  },
  fr: {
    "CommentsTitle": "Commentaires",
    "LeaveComment": "Laisser un commentaire",
    "YourName": "Votre nom (optionnel)",
    "YourMessage": "Votre message...",
    "SubmitComment": "Envoyer le commentaire",
    "NoComments": "Aucun commentaire pour le moment.",
    "CommentSent": "Commentaire envoyé !",
    "ErrorOccurred": "Une erreur est survenue.",
    "Anonymous": "Anonyme"
  }
};

for (const lang of langs) {
  const filePath = path.join(messagesDir, lang + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.BlogComments) data.BlogComments = {};
    Object.assign(data.BlogComments, translations[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("Updated " + lang + ".json");
  }
}
