const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.create({
    data: {
      title: "3 livres qui vont changer ta vision",
      slug: "3-livres-qui-vont-changer-ta-vision",
      excerpt: "Découvrez trois ouvrages incontournables qui transformeront votre façon de voir le monde et d'aborder vos défis quotidiens.",
      content: `<h2>1. Sapiens : Une brève histoire de l'humanité - Yuval Noah Harari</h2>
<p>Sapiens n'est pas seulement un livre d'histoire, c'est une véritable exploration de ce qui fait de nous des êtres humains. En retraçant l'évolution de notre espèce depuis l'Âge de pierre jusqu'au XXIe siècle, Harari nous offre une perspective fascinante sur la façon dont les mythes, les religions et les idéologies ont façonné nos sociétés.</p>
<p><strong>Pourquoi ça va changer votre vision :</strong> Vous ne regarderez plus jamais l'argent, la religion ou même les droits de l'homme de la même manière. Harari démonte nos certitudes avec brio.</p>

<h2>2. L'Alchimiste - Paulo Coelho</h2>
<p>Ce classique de la littérature mondiale raconte l'histoire de Santiago, un jeune berger andalou qui part à la recherche d'un trésor enfoui au pied des Pyramides. C'est un conte philosophique sur la poursuite de ses rêves et l'importance d'écouter son cœur.</p>
<p><strong>Pourquoi ça va changer votre vision :</strong> L'Alchimiste est une puissante métaphore sur la "Légende Personnelle". Il vous rappellera que chaque obstacle sur votre chemin est une leçon nécessaire pour atteindre votre véritable but.</p>

<h2>3. Atomic Habits - James Clear</h2>
<p>Si vous avez du mal à changer vos habitudes, ce livre est pour vous. James Clear explique avec une clarté remarquable comment de petits changements, appliqués de manière cohérente, peuvent mener à des résultats extraordinaires. Il s'appuie sur la biologie, la psychologie et les neurosciences pour proposer un cadre pratique d'amélioration continue.</p>
<p><strong>Pourquoi ça va changer votre vision :</strong> Vous réaliserez que le succès ne dépend pas de grands bouleversements, mais de l'accumulation de petites victoires quotidiennes. C'est un manuel d'action pour transformer votre vie, étape par étape.</p>`,
      authorId: "00d8e597-44fd-47e3-9963-8a054a332d74",
      published: true,
      publishedAt: new Date(),
      category: "Développement Personnel",
      language: "fr"
    }
  });
  console.log("Post created:", post.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
