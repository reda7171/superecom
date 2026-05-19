import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const products = await prisma.extraProduct.findMany()
    console.log("Current products count:", products.length)
    
    for (const p of products) {
        let desc = p.description
        const name = p.name.toLowerCase()
        
        if (!desc || desc.trim() === "" || desc.toLowerCase().includes("bientôt disponible") || desc.toLowerCase().includes("prochainement")) {
            if (name.includes("marque") || p.category === "BOOKMARK") {
                desc = "Marque-page artisanal et raffiné. L'accessoire indispensable pour tous les amoureux de lecture qui souhaitent conserver précieusement leur progression avec élégance et distinction. Fabriqué en matériaux durables pour résister à des années de lecture passionnée."
            } else if (name.includes("bibliothèque") || name.includes("meuble") || p.category === "LIBRARY") {
                desc = "Une bibliothèque d'exception, alliant esthétique contemporaine et robustesse. Conçue avec des finitions soignées pour sublimer vos livres préférés et habiller votre espace de lecture avec goût. Parfaite pour structurer vos plus beaux ouvrages."
            } else if (name.includes("usb") || name.includes("clé") || p.category === "USB") {
                desc = "Clé USB haute performance contenant une sélection riche et diversifiée de contenus éducatifs pour toute la famille. Prise en main ultra-rapide sans installation requise, idéale pour un apprentissage serein et sans distraction."
            } else {
                desc = "Produit de qualité supérieure conçu spécifiquement pour améliorer l'ergonomie et l'élégance de votre espace de travail. Une durabilité à toute épreuve alliée à un design contemporain épuré."
            }
            
            await prisma.extraProduct.update({
                where: { id: p.id },
                data: { description: desc }
            })
            console.log(`Updated product description for: ${p.name}`)
        }
    }
    console.log("Database update completed.")
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
