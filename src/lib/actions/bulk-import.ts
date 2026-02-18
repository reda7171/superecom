'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { verifyAdmin } from './auth'

export type BulkImportResult = {
    success: boolean
    message: string
    imported?: number
    failed?: number
    errors?: string[]
}

/**
 * Importer des livres en masse depuis un fichier Excel
 */
export async function importBooksFromExcel(formData: FormData): Promise<BulkImportResult> {
    try {
        await verifyAdmin() // OWASP A01: Broken Access Control

        const file = formData.get('file') as File

        if (!file) {
            return {
                success: false,
                message: 'Aucun fichier fourni',
            }
        }

        // Lire le fichier Excel
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer)

        // Lire la première feuille
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convertir en JSON
        const data = XLSX.utils.sheet_to_json(worksheet)

        if (!data || data.length === 0) {
            return {
                success: false,
                message: 'Le fichier Excel est vide',
            }
        }

        let imported = 0
        let failed = 0
        const errors: string[] = []

        // Traiter chaque ligne
        for (let i = 0; i < data.length; i++) {
            const row: any = data[i]

            try {
                // Valider les champs requis
                if (!row.title || !row.author || !row.price || !row.stock || !row.description || !row.image) {
                    errors.push(`Ligne ${i + 2}: Champs manquants (title, author, price, stock, description, image requis)`)
                    failed++
                    continue
                }

                // Vérifier si le livre existe déjà (ISBN)
                if (row.isbn) {
                    const existing = await prisma.book.findUnique({
                        where: { isbn: String(row.isbn) }
                    })
                    if (existing) {
                        errors.push(`Ligne ${i + 2}: Le livre avec l'ISBN ${row.isbn} existe déjà.`)
                        failed++
                        continue
                    }
                }

                // Créer le livre
                await prisma.book.create({
                    data: {
                        title: String(row.title),
                        author: String(row.author),
                        description: String(row.description),
                        isbn: row.isbn ? String(row.isbn) : null,
                        price: parseFloat(row.price),
                        stock: parseInt(row.stock),
                        image: String(row.image),
                        category: row.category ? String(row.category) : null,
                        language: row.language ? String(row.language) : 'fr',
                        active: true,
                    },
                })

                imported++
            } catch (error) {
                errors.push(`Ligne ${i + 2}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
                failed++
            }
        }

        // Revalider les caches
        revalidatePath('/admin/books')
        revalidatePath('/')

        return {
            success: true,
            message: `Importation terminée. ${imported} livre(s) importé(s), ${failed} échec(s)`,
            imported,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        }
    } catch (error: any) {
        console.error('Erreur lors de l\'importation:', error)
        return {
            success: false,
            message: error.message || 'Une erreur est survenue lors de l\'importation',
        }
    }
}

/**
 * Générer un template Excel pour l'importation
 */
export async function generateExcelTemplate() {
    try {
        await verifyAdmin()

        const template = [
            {
                title: 'Atomic Habits',
                author: 'James Clear',
                description: 'Un guide facile et éprouvé pour créer de bonnes habitudes',
                isbn: '9780735211292',
                price: 180,
                stock: 50,
                category: 'Développement Personnel',
                language: 'en',
                image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73',
            },
        ]

        const worksheet = XLSX.utils.json_to_sheet(template)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Books')

        // Convertir en buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

        return excelBuffer
    } catch (error) {
        return null
    }
}
