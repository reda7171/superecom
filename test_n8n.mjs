// Test direct du webhook n8n
const payload = {
  bookId: "test-123",
  title: "Test Livre",
  author: "Auteur Test",
  price: 99,
  category: "Test",
  language: "FR",
  image: "https://picsum.photos/400/600",
  bookUrl: "http://localhost/fr/books/test-123",
  caption: "Un livre de test pour vérifier le webhook n8n.",
  description: "Description courte test.",
  longDescription: "Description longue test.",
  format: "post",
  platform: "both",
  scheduleAt: null,
  source: "riwaya-debug"
};

const N8N_URL = "http://localhost:5678/webhook/riwaya-publish";

console.log("Envoi vers:", N8N_URL);
console.log("Payload:", JSON.stringify(payload, null, 2));

fetch(N8N_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then(async res => {
    const text = await res.text();
    console.log("\n✅ Status HTTP:", res.status);
    console.log("Réponse n8n:", text);
  })
  .catch(err => {
    console.error("\n❌ Erreur:", err.message);
    console.log("→ Vérifiez que n8n tourne: docker compose ps");
  });
