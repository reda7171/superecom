const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.create({
    data: {
      title: "Ce roman va te détruire émotionnellement",
      slug: "ce-roman-va-te-detruire-emotionnellement",
      excerpt: "Découvrez cette œuvre poignante qui ne vous laissera pas indemne. Préparez vos mouchoirs, car l'ascenseur émotionnel est garanti.",
      content: `<h2>Un chef-d'œuvre de la littérature contemporaine</h2>
<p>Il y a des livres qui vous divertissent, des livres qui vous informent, et puis il y a ces livres qui vous prennent aux tripes, qui vous brisent le cœur et vous laissent fixer le vide pendant des heures après en avoir tourné la dernière page. "Mille soleils splendides" de Khaled Hosseini fait indiscutablement partie de cette dernière catégorie.</p>
<p>L'histoire de Mariam et Laila, deux femmes afghanes dont les destins s'entremêlent tragiquement sous le régime des talibans, est d'une intensité rare. À travers leurs souffrances, leurs sacrifices et leur incroyable résilience, l'auteur dresse un portrait bouleversant de la condition féminine dans un pays déchiré par la guerre.</p>

<h2>Pourquoi ce livre vous marquera à jamais</h2>
<p>L'écriture de Khaled Hosseini est d'une beauté cruelle. Il ne nous épargne rien des atrocités de la guerre, de la violence domestique ou de l'injustice sociale. Pourtant, au milieu de cette noirceur absolue, il parvient à faire briller la lumière de l'espoir, de l'amitié inébranlable et de l'amour inconditionnel.</p>
<p>Vous pleurerez de tristesse face aux épreuves que traversent les protagonistes, mais vous pleurerez aussi de beauté devant la force de leur lien. C'est une histoire qui vous rappellera la chance que vous avez, tout en vous brisant le cœur pour ceux qui n'ont pas cette chance.</p>

<h2>Une lecture nécessaire</h2>
<p>Ne vous y trompez pas : cette lecture est difficile. Elle exige beaucoup émotionnellement. Mais elle en vaut chaque larme. C'est le genre de livre qui vous change, qui vous rend plus empathique, plus conscient des réalités qui existent au-delà de votre quotidien.</p>
<p><strong>Notre conseil :</strong> Lisez-le, mais assurez-vous d'avoir du temps pour vous en remettre. Et surtout, gardez une boîte de mouchoirs à portée de main.</p>`,
      authorId: "00d8e597-44fd-47e3-9963-8a054a332d74", // Same admin user ID as before
      published: true,
      publishedAt: new Date(),
      category: "Romans & Fiction",
      language: "fr"
    }
  });
  console.log("Post created:", post.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
