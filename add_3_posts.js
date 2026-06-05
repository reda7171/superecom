const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const authorId = "00d8e597-44fd-47e3-9963-8a054a332d74"; // The admin user ID from before
  
  const posts = [
    {
      title: "Ce livre m’a laissé vide pendant 3 jours…",
      slug: "ce-livre-m-a-laisse-vide-pendant-3-jours",
      excerpt: "Découvrez l'ouvrage qui redéfinit la notion même de vide émotionnel. Une lecture qui résonnera en vous bien après la dernière page.",
      content: `<h2>Un choc littéraire inattendu</h2>
<p>Il arrive que l'on commence un livre avec une certaine légèreté, sans se douter du raz-de-marée émotionnel qui nous attend. C'est exactement ce qui se produit avec cette œuvre singulière. L'auteur nous plonge dans un univers si profondément humain que la frontière entre la fiction et la réalité finit par se dissoudre.</p>
<p>Dès les premiers chapitres, une atmosphère lourde de non-dits s'installe. Les personnages ne sont pas simplement décrits, ils vivent, respirent et souffrent à travers les pages. Leur douleur devient la nôtre, leurs dilemmes nous hantent.</p>

<h2>La beauté du vide</h2>
<p>Mais pourquoi un livre qui nous "laisse vide" serait-il recommandable ? Parce que ce vide n'est pas une absence, c'est un espace de réflexion. C'est le silence assourdissant qui suit une grande révélation. L'histoire nous force à remettre en question nos propres certitudes sur l'amour, la perte et le sens que nous donnons à notre existence.</p>
<p>Pendant trois jours, vous ne penserez qu'à eux. Vous tenterez de combler ce vide par l'analyse, la discussion, ou le silence. Une expérience littéraire rare et précieuse.</p>`,
      authorId,
      published: true,
      publishedAt: new Date(),
      category: "Romans & Fiction",
      language: "fr"
    },
    {
      title: "Impossible de finir ce roman sans pleurer",
      slug: "impossible-de-finir-ce-roman-sans-pleurer",
      excerpt: "Préparez-vous à une lecture déchirante. Un drame humain d'une justesse implacable qui brise le cœur des lecteurs les plus endurcis.",
      content: `<h2>L'art de briser les cœurs</h2>
<p>On nous avait prévenus. Les avis sur les réseaux sociaux étaient unanimes : "Prévoyez des mouchoirs", "J'ai pleuré toutes les larmes de mon corps". Et pourtant, on se croyait immunisé. Mais la plume de l'auteur a ce talent rare de contourner nos défenses émotionnelles pour frapper directement au cœur.</p>
<p>L'histoire de ce roman repose sur une tragédie intime, racontée avec une pudeur qui la rend d'autant plus dévastatrice. Il n'y a pas de mélodrame forcé ni de violons larmoyants : juste la crudité de la vie, de l'injustice et de la résilience humaine.</p>

<h2>Un catharsis nécessaire</h2>
<p>Pleurer en lisant n'est pas un signe de faiblesse, c'est la preuve que l'empathie fonctionne. Ce roman réussit le tour de force de nous faire pleurer non seulement de tristesse, mais aussi de beauté. Les sacrifices des personnages, leurs petits moments de bonheur volés au désespoir, sont d'une fulgurance poétique.</p>
<p>C'est une lecture qui vous purge de vos propres chagrins. On en ressort les yeux rouges, le souffle court, mais paradoxalement apaisé.</p>`,
      authorId,
      published: true,
      publishedAt: new Date(),
      category: "Romans & Fiction",
      language: "fr"
    },
    {
      title: "Le plot twist que personne ne voit venir",
      slug: "le-plot-twist-que-personne-ne-voit-venir",
      excerpt: "Un thriller psychologique qui redéfinit le suspense. Découvrez le livre dont la fin obsède les lecteurs du monde entier.",
      content: `<h2>La manipulation à son apogée</h2>
<p>Vous pensiez être un lecteur averti ? Vous êtes du genre à deviner l'identité du coupable dès le troisième chapitre ? Oubliez tout ce que vous croyez savoir. Ce roman va se jouer de vous, vous manipuler, vous diriger exactement là où il veut pour mieux vous prendre à revers.</p>
<p>L'intrigue est tissée avec une précision diabolique. L'auteur sème des indices microscopiques tout au long du récit. Tout est sous nos yeux depuis le début, mais l'illusion est si parfaite que l'on tombe dans le piège avec une naïveté déconcertante.</p>

<h2>Le moment de la bascule</h2>
<p>Et puis vient ce fameux chapitre. Cette phrase anodine qui, soudainement, fait s'effondrer toutes vos certitudes. Le monde que l'auteur avait soigneusement construit se retourne comme un gant. C'est le vertige. L'incrédulité. Vous reprenez la lecture depuis le début pour vérifier, et l'évidence vous frappe : tout était là.</p>
<p>C'est un chef-d'œuvre de construction narrative. Un de ces livres que l'on veut immédiatement faire lire à son entourage, ne serait-ce que pour pouvoir enfin en parler avec quelqu'un.</p>`,
      authorId,
      published: true,
      publishedAt: new Date(),
      category: "Romans & Fiction",
      language: "fr"
    }
  ];

  let createdCount = 0;
  for (const postData of posts) {
    const post = await prisma.post.create({ data: postData });
    console.log("Post created:", post.title);
    createdCount++;
  }
  console.log(createdCount + " posts added.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
