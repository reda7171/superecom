const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.create({
    data: {
      title: "Books Every Moroccan Should Read",
      slug: "books-every-moroccan-should-read",
      excerpt: "A curated list of essential literature that captures the heart, history, and evolving identity of Morocco.",
      content: `<h2>Exploring the Moroccan Identity Through Literature</h2>
<p>Morocco is a country of rich history, diverse cultures, and profound stories. For anyone looking to understand the complex tapestry of Moroccan society, literature offers the most authentic window. Here are a few essential books that every Moroccan should read at least once.</p>

<h2>1. The Sand Child (L'Enfant de sable) by Tahar Ben Jelloun</h2>
<p>A masterpiece of modern Moroccan literature, this novel tells the story of a father who, desperate for a male heir after having seven daughters, decides to raise his eighth daughter as a boy. It's a profound exploration of gender, society, and identity in traditional Moroccan culture. The lyrical prose and magical realism elements make it an unforgettable journey.</p>

<h2>2. For Bread Alone (Le Pain nu) by Mohamed Choukri</h2>
<p>This autobiographical novel is a raw, unflinching look at poverty, survival, and the harsh realities of life in mid-20th century Morocco. Choukri's journey from a life of street violence and illiteracy to becoming a celebrated writer is both heartbreaking and deeply inspiring. It is a vital piece of Moroccan literary history that challenges its readers to face the uncomfortable truths of society.</p>

<h2>3. Year of the Elephant ('Am al-Fil) by Leila Abouzeid</h2>
<p>Set against the backdrop of Morocco's struggle for independence from French colonial rule, this novel provides a crucial perspective: that of the Moroccan woman. It highlights the sacrifices women made during the resistance, only to find themselves marginalized in the newly independent nation. It is a powerful story of personal and political struggle.</p>

<h2>Why Read These Books?</h2>
<p>These stories do more than just entertain; they preserve our collective memory. They challenge us to reflect on our past, question our present, and envision our future. Whether you are reading them in Arabic, French, or English, they are a fundamental part of the Moroccan cultural heritage.</p>`,
      authorId: "00d8e597-44fd-47e3-9963-8a054a332d74", // Same admin user ID
      published: true,
      publishedAt: new Date(),
      category: "Culture & Literature",
      language: "en"
    }
  });
  console.log("Post created:", post.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
