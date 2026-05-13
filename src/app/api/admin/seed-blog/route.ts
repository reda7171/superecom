
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function slugifyStrict(text: string) {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

export async function GET() {
    try {
        // Liste d'auteurs fictifs avec images premium
        const fakeAuthors = [
            {
                email: 'sarah.l@riwaya.com',
                fullName: 'Sarah Laurent',
                bio: 'Passionnée de littérature classique et critique littéraire depuis 10 ans.',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
            },
            {
                email: 'marc.d@riwaya.com',
                fullName: 'Marc Dubois',
                bio: 'Spécialiste du développement personnel et des essais philosophiques.',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
            },
            {
                email: 'laila.k@riwaya.com',
                fullName: 'Laila Kasmi',
                bio: 'Exploratrice de nouveaux talents littéraires et amoureuse du design de livres.',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
            }
        ]

        // Créer ou récupérer les auteurs
        const authors = []
        for (const authorData of fakeAuthors) {
            let author = await prisma.user.findUnique({ where: { email: authorData.email } })
            if (!author) {
                author = await prisma.user.create({
                    data: {
                        ...authorData,
                        password: 'fake_password_not_for_login', // Nécessaire par le schéma
                        role: 'USER' // Ils sont contributeurs
                    }
                })
            }
            authors.push(author)
        }

        // Ajouter l'admin par défaut au cas où
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) authors.push(admin)

        // Nettoyage complet
        await prisma.post.deleteMany({
            where: { category: 'Literary Review' }
        })

        const books = await prisma.book.findMany({
            where: { active: true },
            take: 30
        })

        if (books.length === 0) {
            return NextResponse.json({ error: 'No books found' }, { status: 404 })
        }

        const languages = ['fr', 'en', 'ar']
        const articlesCreated = []

        for (const lang of languages) {
            const langBooks = []
            for (let i = 0; i < 10; i++) {
                langBooks.push(books[(languages.indexOf(lang) * 10 + i) % books.length])
            }

            for (const book of langBooks) {
                // Choisir un auteur au hasard pour cet article
                const randomAuthor = authors[Math.floor(Math.random() * authors.length)]

                let title = ''
                let excerpt = ''
                let content = ''

                if (lang === 'fr') {
                    title = `Analyse Littéraire : "${book.title}"`
                    excerpt = `Une plongée au cœur de l'œuvre magistrale de ${book.author}. Pourquoi lire "${book.title}" aujourd'hui ?`
                    content = `## Introduction à l'œuvre\n\nLe livre **${book.title}**, signé par **${book.author}**, s'impose comme une lecture fondamentale. Ce texte n'est pas seulement un récit, c'est une réflexion profonde sur notre temps.\n\n## Contexte et Thématiques\n\n${book.description || "L'auteur nous transporte dans un univers riche où chaque détail compte. Les thèmes de la condition humaine sont au cœur de cette narration."}\n\n> "Lire ${book.author}, c'est accepter de voir le monde sous un angle nouveau, plus complexe et infiniment plus riche."\n\n## Pourquoi ce livre est indispensable\n\nCe qui distingue **${book.title}**, c'est la précision chirurgicale de sa plume. Voici trois points clés :\n\n* **Profondeur psychologique :** Les personnages sont d'une complexité rare.\n* **Style narratif :** Un rythme maîtrisé qui maintient le lecteur en haleine.\n* **Résonance moderne :** Ses leçons sont intemporelles.\n\n## Le mot de la rédaction\n\nChez Riwaya, nous avons été particulièrement touchés par la manière dont ${book.author} traite ses sujets. C'est une œuvre qui demande du temps et de l'attention.\n\n--- \n\n### **Verdict final**\n*"Une pépite littéraire à ne pas manquer."*`
                } else if (lang === 'en') {
                    title = `Literary Review: "${book.title}"`
                    excerpt = `A deep dive into ${book.author}'s masterpiece. Exploring the impact of "${book.title}".`
                    content = `## Overview\n\n**${book.title}** by **${book.author}** is more than just a book. It's a journey into the heart of modern literature.\n\n## Analysis\n\n${book.description || "The book creates a vivid atmosphere that stays with you long after the final page."}\n\n> "${book.author} is a master of suspense and emotional depth."\n\n## Why We Love It\n\n* **Rich Storytelling:** Every chapter brings something new.\n* **Iconic Characters:** Memorable and relatable.\n* **Unique Perspective:** A fresh look at classic themes.\n\n## Conclusion\n\nDon't miss out on this literary gem available now at Riwaya.`
                } else if (lang === 'ar') {
                    title = `قراءة تحليلية مفصلة: كتاب "${book.title}"`
                    excerpt = `غوص عميق في أفكار ${book.author} ورؤيته الاستثنائية. استكشاف شامل لكل الأبعاد الفلسفية والأدبية التي تجعل من "${book.title}" عملاً لا يُنسى.`
                    content = `## مقدمة: رحلة في عقل الكاتب\n\nيعتبر كتاب **${book.title}** للكاتب القدير **${book.author}** بمثابة علامة فارقة في المشهد الثقافي والأدبي الحديث. لا يقتصر هذا العمل على كونه مجرد صفحات مطبوعة، بل هو نافذة تطل على عوالم متداخلة من الفكر والتأمل الإنساني العميق. منذ اللحظة الأولى لقراءة الصفحات الافتتاحية، يدرك القارئ أنه أمام تجربة معرفية استثنائية تتطلب حضوراً ذهنياً كاملاً.\n\n## سياق العمل والبيئة المحيطة\n\nلفهم القيمة الحقيقية لهذا الكتاب، يجب أن نأخذ في الاعتبار السياق الذي كُتب فيه. يطرح **${book.author}** في هذا الإصدار مجموعة من التساؤلات الوجودية والمجتمعية التي تعكس قلق الإنسان المعاصر.\n\n${book.description || "إن هذا العمل لا يعتمد على السرد التقليدي، بل يبني هيكله على تفكيك المفاهيم السائدة وإعادة تركيبها بمنظور نقدي حاد. كل فصل بمثابة محطة تأملية تأخذ القارئ إلى أبعاد جديدة."}\n\n> "تتجلى عبقرية ${book.author} في قدرته الفائقة على تحويل الأفكار المجردة والمعقدة إلى نصوص تنبض بالحياة وتمس وجدان القارئ مباشرة."\n\n## التحليل المعمق: الأبعاد والرموز\n\nفي قراءتنا المتأنية لصفحات **${book.title}**، برزت عدة عناصر تجعل منه تحفة فريدة:\n\n### 1. البناء السردي والمنهجية\nاعتمد الكاتب على هيكل متماسك يربط البدايات بالنهايات بأسلوب دقيق. هناك تدرج منطقي وعاطفي يمنع تسلل الملل، ويجعل من كل فكرة حجر أساس لما يليها.\n\n### 2. العمق السيكولوجي والفلسفي\nلم يكتفِ الكاتب بالوصف السطحي، بل غاص في أعماق النفس البشرية. تناول الدوافع، والمخاوف، والتطلعات بطريقة تعكس فهماً دقيقاً لعلم النفس البشري.\n\n### 3. اللغة والأسلوب\n* **بلاغة التعبير:** استخدام مفردات غنية تخدم المعنى وتزيد من جمالية النص.\n* **إيقاع الجمل:** يتأرجح الأسلوب بين الهدوء التأملي والتسارع الدرامي حسب طبيعة المشهد أو الفكرة.\n* **الرمزية المفتوحة:** يترك الكاتب مساحات بيضاء للقارئ ليشارك في استنباط المعاني.\n\n## لماذا يجب أن يكون هذا الكتاب في مكتبتك؟\n\nإذا كنت تبحث عن عمل يغير من نظرتك للأمور، ويحفز عقلك على التفكير خارج الصندوق، فإن هذا الكتاب هو خيارك الأمثل. إنه ليس مجرد كتاب يُقرأ لمرة واحدة ثم يوضع على الرف، بل هو مرجع يعود إليه القارئ كلما باغتته أسئلة الحياة.\n\n## رأي فريق العمل والمراجعة النهائية\n\nنحن في متجر رواية، وبعد دراسة وتقييم العديد من الإصدارات، نضع **${book.title}** في خانة الأعمال الموصى بها بشدة. لقد أثبت **${book.author}** مرة أخرى أنه يمتلك القدرة على ملامسة أوتار العقل والقلب معاً.\n\n--- \n\n### **التقييم النهائي**\n*"عمل متكامل يثري العقل ويسمو بالروح. إضافة حقيقية وقيمة لأي مكتبة شخصية."*\n\nلا تتردد في اقتناء نسختك من متجر رواية اليوم، وشاركنا رأيك بعد القراءة!`
                }

                let slugBase = slugifyStrict(book.title)
                if (!slugBase || slugBase.length < 3) {
                    slugBase = slugifyStrict(book.author) || 'article'
                }
                const slug = `${slugBase}-${lang}-${Math.random().toString(36).substring(7)}`

                const coverImage = book.image && !book.image.includes('removebg') 
                    ? book.image 
                    : `https://images.unsplash.com/photo-1544644107-568f4c27995d?auto=format&fit=crop&q=80&w=1200`

                const post = await prisma.post.create({
                    data: {
                        title,
                        slug,
                        excerpt,
                        content,
                        coverImage,
                        language: lang,
                        published: true,
                        publishedAt: new Date(),
                        authorId: randomAuthor.id, // Auteur aléatoire
                        viewCount: Math.floor(Math.random() * (2500 - 150 + 1)) + 150,
                        category: 'Literary Review',
                        books: {
                            connect: { id: book.id }
                        }
                    }
                })
                articlesCreated.push(post.id)
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `${articlesCreated.length} articles avec auteurs multiples générés.`,
            count: articlesCreated.length
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
