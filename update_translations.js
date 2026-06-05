const fs = require('fs');

const files = {
  fr: 'src/messages/fr.json',
  en: 'src/messages/en.json',
  ar: 'src/messages/ar.json'
};

const commonStrings = {
  fr: { OrderViaWhatsApp: "Commander via WhatsApp" },
  en: { OrderViaWhatsApp: "Order via WhatsApp" },
  ar: { OrderViaWhatsApp: "اطلب عبر واتساب" }
};

for (const [lang, path] of Object.entries(files)) {
  try {
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));
    
    if (!data.Common) {
      data.Common = {};
    }
    
    Object.assign(data.Common, commonStrings[lang]);
    
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`Updated ${path}`);
  } catch (e) {
    console.error(`Error updating ${path}`, e);
  }
}
