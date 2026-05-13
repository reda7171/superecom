import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    const filePath = path.join(process.cwd(), 'src/app/[locale]/admin/books/Nom stock.tsv')
    if (!fs.existsSync(filePath)) {
        console.error('Fichier non trouvé:', filePath)
        return
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split(/\r?\n/)
    
    console.log(`Traitement de ${lines.length - 1} lignes...`)

    let updated = 0
    let failed = 0

    // Ignorer l'en-tête
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const [title, stockStr] = line.split('\t')
        if (!title || stockStr === undefined) {
            console.error(`Ligne ${i + 1}: Format invalide`)
            failed++
            continue
        }

        const stock = parseInt(stockStr.trim())
        if (isNaN(stock)) {
            console.error(`Ligne ${i + 1}: Stock invalide pour "${title}"`)
            failed++
            continue
        }

        try {
            const book = await prisma.book.findFirst({
                where: { 
                    title: title.trim()
                }
            })

            if (book) {
                await prisma.book.update({
                    where: { id: book.id },
                    data: { stock }
                })
                updated++
            } else {
                console.warn(`Ligne ${i + 1}: Livre "${title}" non trouvé`)
                failed++
            }
        } catch (err) {
            console.error(`Ligne ${i + 1}: Erreur lors de l'update de "${title}"`, err)
            failed++
        }
    }

    console.log(`Terminé !`)
    console.log(`Mis à jour: ${updated}`)
    console.log(`Échecs: ${failed}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
