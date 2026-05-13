import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seoPosts = [
  {
    title: "Top 10 des livres les plus vendus au Maroc",
    slug: "top-10-livres-plus-vendus-maroc",
    excerpt: "Découvrez notre sélection des 10 livres qui connaissent le plus grand succès au Maroc cette année. Des romans captivants aux guides de développement personnel indispensables.",
    content: `
<h2>Les meilleures ventes au Maroc</h2>
<p>Le marché du livre au Maroc connaît une belle dynamique. Les lecteurs marocains sont de plus en plus friands de littérature contemporaine, de livres de développement personnel, et d'essais sur le monde des affaires. Voici le classement des 10 ouvrages les plus plébiscités.</p>

<h3>1. Père Riche, Père Pauvre - Robert Kiyosaki</h3>
<p>Un incontournable absolu pour comprendre l'intelligence financière. Ce livre domine les ventes au Maroc depuis plusieurs mois.</p>

<h3>2. Atomic Habits (Un rien peut tout changer) - James Clear</h3>
<p>La référence mondiale pour créer de bonnes habitudes et se défaire des mauvaises. Très apprécié par la jeunesse marocaine.</p>

<h3>3. L'Alchimiste - Paulo Coelho</h3>
<p>Un classique indémodable qui continue de séduire de nouvelles générations de lecteurs.</p>

<h3>4. L'art subtil de s'en foutre - Mark Manson</h3>
<p>Une approche à contre-courant du développement personnel traditionnel.</p>

<h3>5. Réfléchissez et devenez riche - Napoleon Hill</h3>
<p>Un pilier de la littérature sur le succès et l'indépendance financière.</p>

<h3>6. Le Pouvoir du moment présent - Eckhart Tolle</h3>
<p>Pour ceux qui cherchent la paix intérieure face au stress du quotidien.</p>

<h3>7. Les 48 lois du pouvoir - Robert Greene</h3>
<p>Un livre fascinant et stratégique, très demandé par les professionnels et étudiants.</p>

<h3>8. Miracle Morning - Hal Elrod</h3>
<p>La méthode pour changer sa vie en se levant tôt.</p>

<h3>9. L'Intelligence Émotionnelle - Daniel Goleman</h3>
<p>Une lecture essentielle pour le monde professionnel et personnel.</p>

<h3>10. Sapiens : Une brève histoire de l'humanité - Yuval Noah Harari</h3>
<p>L'essai historique qui a conquis le monde entier, y compris le public marocain.</p>

<p><strong>Vous cherchez à enrichir votre bibliothèque ?</strong> Parcourez notre catalogue et profitez de la livraison rapide partout au Maroc !</p>
    `,
    category: "Guides",
    tags: "top 10, meilleures ventes, maroc, livres",
    language: "fr",
  },
  {
    title: "Où acheter des livres au Maroc ?",
    slug: "ou-acheter-des-livres-au-maroc",
    excerpt: "Vous vous demandez quelle est la meilleure option pour vous procurer vos livres préférés au Maroc ? Voici un guide complet sur les librairies physiques et en ligne.",
    content: `
<h2>Le guide d'achat de livres au Maroc</h2>
<p>L'accès à la culture et à la lecture s'est grandement facilité au Maroc. Que vous soyez à Casablanca, Rabat, Marrakech, ou dans des villes plus éloignées, plusieurs options s'offrent à vous.</p>

<h3>1. Riwaya : La librairie en ligne n°1</h3>
<p>Chez <strong>Riwaya</strong>, nous proposons une vaste sélection de livres : romans, développement personnel, business et bien plus. L'avantage principal ? <strong>La livraison est rapide partout au Maroc</strong>, et vous bénéficiez du <strong>paiement à la livraison (COD)</strong> pour un achat en toute sécurité. De plus, notre plateforme permet l'échange de livres entre lecteurs !</p>

<h3>2. Les grandes librairies physiques</h3>
<p>Dans les grandes villes, vous trouverez des enseignes historiques comme Livremoi, Kalila Wa Dimna, ou la librairie des écoles à Casablanca. Elles offrent le plaisir de flâner entre les rayons, bien que leur couverture géographique soit limitée.</p>

<h3>3. Les bouquinistes</h3>
<p>Pour les chineurs, les bouquinistes de la médina ou de la place Oued El Makhazine à Casablanca regorgent de trésors d'occasion. C'est idéal pour les budgets restreints, même si trouver un titre précis relève souvent du défi.</p>

<h3>Pourquoi privilégier l'achat en ligne avec Riwaya ?</h3>
<ul>
<li><strong>Confort :</strong> Commandez depuis votre canapé.</li>
<li><strong>Choix :</strong> Un catalogue constamment mis à jour.</li>
<li><strong>Packs économiques :</strong> Des sélections de livres à prix réduit.</li>
<li><strong>Rapidité :</strong> Livraison express à votre porte.</li>
</ul>
<p>N'attendez plus pour commencer votre prochaine lecture !</p>
    `,
    category: "Conseils",
    tags: "achat livres, maroc, librairie en ligne, livraison",
    language: "fr",
  },
  {
    title: "Best English books available in Morocco",
    slug: "best-english-books-available-in-morocco",
    excerpt: "Looking to read in English while living in Morocco? Here is a curated list of the most popular and best English books you can order right now.",
    content: `
<h2>The Rise of English Literature in Morocco</h2>
<p>English reading is booming in Morocco among students, professionals, and language enthusiasts. Finding good English books used to be a struggle, but not anymore. Here are some of the best titles you can get your hands on today.</p>

<h3>Top Picks for Self-Improvement</h3>
<p><strong>1. Atomic Habits by James Clear:</strong> A practical and inspiring guide to building good habits and breaking bad ones.</p>
<p><strong>2. Rich Dad Poor Dad by Robert Kiyosaki:</strong> The ultimate personal finance classic that challenges the way you think about money.</p>
<p><strong>3. The Subtle Art of Not Giving a F*ck by Mark Manson:</strong> A raw, refreshing approach to living a good life.</p>

<h3>Top Picks for Business and Mindset</h3>
<p><strong>1. Think and Grow Rich by Napoleon Hill:</strong> Timeless wisdom for success.</p>
<p><strong>2. Deep Work by Cal Newport:</strong> Rules for focused success in a distracted world.</p>
<p><strong>3. Start With Why by Simon Sinek:</strong> How great leaders inspire everyone to take action.</p>

<h3>Where to get them?</h3>
<p>At <strong>Riwaya</strong>, we have a dedicated section for English books. We deliver nationwide across Morocco, offering a seamless Cash on Delivery experience. Check out our English catalog and start reading!</p>
    `,
    category: "Recommendations",
    tags: "english books, morocco, best sellers",
    language: "en",
  },
  {
    title: "Livres de développement personnel au Maroc",
    slug: "livres-de-developpement-personnel-au-maroc",
    excerpt: "Le développement personnel est devenu une véritable tendance au Maroc. Découvrez les ouvrages incontournables pour booster votre mindset et votre carrière.",
    content: `
<h2>Pourquoi le développement personnel cartonne au Maroc ?</h2>
<p>Face aux défis professionnels et personnels modernes, de plus en plus de Marocains se tournent vers les livres de développement personnel. Ces ouvrages offrent des outils pratiques pour améliorer sa productivité, sa confiance en soi et son intelligence financière.</p>

<h3>Les incontournables à lire absolument</h3>
<ul>
<li><strong>L'Effet Cumulé (Darren Hardy) :</strong> Comment de petits choix quotidiens mènent à des résultats extraordinaires.</li>
<li><strong>Pouvoir de la Confiance en Soi (Brian Tracy) :</strong> Pour vaincre ses peurs et oser entreprendre.</li>
<li><strong>Les 7 Habitudes de ceux qui réalisent tout ce qu'ils entreprennent (Stephen Covey) :</strong> Un chef-d'œuvre intemporel sur l'efficacité personnelle.</li>
<li><strong>Comment se faire des amis (Dale Carnegie) :</strong> La bible des relations humaines et de la communication.</li>
</ul>

<h3>L'impact sur la carrière</h3>
<p>Lire ces livres n'est pas qu'un passe-temps, c'est un investissement en soi. De nombreux jeunes entrepreneurs et cadres marocains attribuent une part de leur succès aux leçons tirées de ces lectures.</p>
<p>Retrouvez tous ces titres et bien d'autres dans notre catégorie <strong>Développement Personnel</strong> sur Riwaya, avec livraison rapide et garantie.</p>
    `,
    category: "Inspiration",
    tags: "développement personnel, mindset, succès, maroc",
    language: "fr",
  },
  {
    title: "Roman arabe populaire au Maroc",
    slug: "roman-arabe-populaire-au-maroc",
    excerpt: "Plongez dans l'univers de la littérature arabe. Quels sont les romans arabes les plus populaires et les plus lus par le public marocain ?",
    content: `
<h2>La richesse du roman arabe</h2>
<p>La littérature arabe contemporaine et classique occupe une place de choix dans le cœur des lecteurs marocains. Entre poésie, critique sociale et histoires d'amour poignantes, les romanciers arabes savent captiver leur public.</p>

<h3>Les auteurs et romans qui marquent les esprits</h3>
<p><strong>1. Naguib Mahfouz :</strong> Le prix Nobel de littérature égyptien reste une référence incontestée. Ses œuvres comme <em>Impasse des deux palais</em> sont étudiées et lues avec ferveur.</p>
<p><strong>2. Ahlam Mosteghanemi :</strong> L'écrivaine algérienne connaît un succès phénoménal au Maroc avec sa célèbre trilogie, notamment <em>Mémoires de la chair</em> (Dakirat Al Jassad).</p>
<p><strong>3. Ghassan Kanafani :</strong> Ses nouvelles et romans, comme <em>Des hommes dans le soleil</em>, touchent profondément les lecteurs par leur réalisme et leur portée politique.</p>
<p><strong>4. Ayman Al-Otoom :</strong> Ses romans récents rencontrent un grand écho auprès de la jeunesse marocaine pour leur style moderne et engagé.</p>

<h3>La littérature marocaine arabophone</h3>
<p>Il ne faut pas oublier les auteurs marocains écrivant en arabe, tels que Mohammed Choukri avec son autobiographie bouleversante <em>Le Pain nu</em> (Al-Khubz Al-Hafi), ou encore Abdellatif Laâbi.</p>

<p>Découvrez notre sélection de romans arabes sur Riwaya et laissez-vous emporter par la magie des mots.</p>
    `,
    category: "Revue",
    tags: "roman, littérature arabe, maroc, culture",
    language: "fr",
  }
]

async function seed() {
  console.log('Buscando admin...')
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    console.error('Aucun admin trouvé pour associer les articles.')
    process.exit(1)
  }

  console.log('Création des articles SEO...')
  let count = 0

  for (const post of seoPosts) {
    const exists = await prisma.post.findUnique({
      where: { slug: post.slug }
    })

    if (!exists) {
      await prisma.post.create({
        data: {
          ...post,
          authorId: admin.id,
          published: true,
          publishedAt: new Date(),
        }
      })
      console.log(`✅ Créé : ${post.title}`)
      count++
    } else {
      console.log(`⏩ Déjà existant : ${post.title}`)
    }
  }

  console.log(`Terminé ! ${count} articles SEO ajoutés.`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
