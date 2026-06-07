'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import ExcelJS from 'exceljs'
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
            return { success: false, message: 'Aucun fichier fourni' }
        }

        const arrayBuffer = await file.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer as any)

        const worksheet = workbook.worksheets[0]

        if (!worksheet) {
            return { success: false, message: 'Le fichier Excel est vide' }
        }

        // Extraire les headers depuis la première ligne
        const headers: string[] = []
        worksheet.getRow(1).eachCell((cell) => {
            headers.push(String(cell.value || ''))
        })

        const data: Record<string, any>[] = []
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return // ignorer l'en-tête
            const rowData: Record<string, any> = {}
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1]
                if (header) rowData[header] = cell.value
            })
            data.push(rowData)
        })

        if (!data || data.length === 0) {
            return { success: false, message: 'Le fichier Excel est vide' }
        }

        let imported = 0
        let failed = 0
        const errors: string[] = []

        for (let i = 0; i < data.length; i++) {
            const row = data[i]

            try {
                const titleStr = row['Nom'] || row.title || 'Livre sans nom'
                const authorStr = row['Marque'] || row.author || 'Auteur inconnu'
                const priceVal = row['Prix de vente'] || row.price || 0
                let imageStr = row['Image'] || row.image

                if (!imageStr) {
                    imageStr = ''
                } else {
                    imageStr = String(imageStr).trim()
                    if (!imageStr.startsWith('data:') && !imageStr.startsWith('http')) {
                        if (imageStr.startsWith('/9j/')) {
                            imageStr = 'data:image/jpeg;base64,' + imageStr
                        } else if (imageStr.startsWith('iVBOR')) {
                            imageStr = 'data:image/png;base64,' + imageStr
                        } else if (!imageStr.startsWith('/') && imageStr.length > 100) {
                            imageStr = 'data:image/jpeg;base64,' + imageStr
                        }
                    }
                }

                const descriptionStr = row.description || `Livre: ${titleStr} par ${authorStr}`
                const stockVal = row.stock ? parseInt(row.stock) : 0
                const parsedPrice = parseFloat(String(priceVal).replace(/[^0-9.]/g, '')) || 0

                if (row.isbn) {
                    const existing = await prisma.product.findUnique({
                        where: { isbn: String(row.isbn) }
                    })
                    if (existing) {
                        errors.push(`Ligne ${i + 2}: Le livre avec l'ISBN ${row.isbn} existe déjà.`)
                        failed++
                        continue
                    }
                }

                await prisma.product.create({
                    data: {
                        title: String(titleStr),
                        author: String(authorStr),
                        description: String(descriptionStr),
                        isbn: row.isbn ? String(row.isbn) : null,
                        price: parsedPrice,
                        stock: stockVal,
                        image: String(imageStr),
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

        revalidatePath('/admin/products')
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

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Products')

        worksheet.columns = [
            { header: 'Marque', key: 'Marque', width: 20 },
            { header: 'Nom', key: 'Nom', width: 30 },
            { header: 'Prix de vente', key: 'Prix de vente', width: 15 },
            { header: 'Image', key: 'Image', width: 50 },
        ]

        worksheet.addRow({
            Marque: 'James Clear',
            Nom: 'Atomic Habits',
            'Prix de vente': 180,
            Image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73',
        })

        const buffer = await workbook.xlsx.writeBuffer()
        return buffer
    } catch (error) {
        return null
    }
}

/**
 * Mettre à jour le stock depuis un fichier TSV (Nom\tstock)
 */
export async function updateStockFromTsv(formData: FormData): Promise<BulkImportResult> {
    try {
        await verifyAdmin()
        const file = formData.get('file') as File

        if (!file) {
            return { success: false, message: 'Aucun fichier fourni' }
        }

        const text = await file.text()
        const lines = text.split(/\r?\n/)
        
        if (lines.length <= 1) {
            return { success: false, message: 'Le fichier est vide ou invalide' }
        }

        let updated = 0
        let failed = 0
        const errors: string[] = []

        // Ignorer l'en-tête (Nom	stock)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const parts = line.split('\t')
            if (parts.length < 2) {
                errors.push(`Ligne ${i + 1}: Format invalide (manque tabulation entre Nom et Stock)`)
                failed++
                continue
            }

            const title = parts[0].trim()
            const stockStr = parts[1].trim()
            const stockValue = parseInt(stockStr)

            if (!title) {
                errors.push(`Ligne ${i + 1}: Nom manquant`)
                failed++
                continue
            }

            if (isNaN(stockValue)) {
                errors.push(`Ligne ${i + 1}: Valeur de stock invalide pour "${title}"`)
                failed++
                continue
            }

            // Recherche exacte du livre
            const product = await prisma.product.findFirst({
                where: { 
                    title: title.trim()
                }
            })

            if (!product) {
                errors.push(`Ligne ${i + 1}: Livre "${title}" introuvable`)
                failed++
                continue
            }

            await prisma.product.update({
                where: { id: product.id },
                data: { stock: stockValue }
            })

            updated++
        }

        revalidatePath('/admin/products')
        revalidatePath('/')

        return {
            success: true,
            message: `Mise à jour du stock terminée. ${updated} livre(s) mis à jour, ${failed} échec(s)`,
            imported: updated,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        }
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour du stock:', error)
        return {
            success: false,
            message: error.message || 'Une erreur est survenue lors de la mise à jour',
        }
    }
}
