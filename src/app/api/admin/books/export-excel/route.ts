import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { verifyAdmin } from '@/lib/actions/auth'

// GET /api/admin/books/export-excel — export tous les livres au format Excel
export async function GET() {
    try {
        await verifyAdmin()

        // Récupérer tous les livres
        const books = await prisma.book.findMany({
            orderBy: { createdAt: 'desc' },
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Books')

        // Colonnes identiques au template d'import + colonnes supplémentaires
        worksheet.columns = [
            { header: 'Marque', key: 'author', width: 25 },
            { header: 'Nom', key: 'title', width: 35 },
            { header: 'Prix de vente', key: 'price', width: 15 },
            { header: 'Image', key: 'image', width: 60 },
            { header: 'isbn', key: 'isbn', width: 20 },
            { header: 'description', key: 'description', width: 50 },
            { header: 'stock', key: 'stock', width: 10 },
            { header: 'category', key: 'category', width: 20 },
            { header: 'language', key: 'language', width: 12 },
            { header: 'active', key: 'active', width: 10 },
            { header: 'createdAt', key: 'createdAt', width: 22 },
        ]

        // Style de l'en-tête
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9E1F2' },
        }

        // Remplir les données
        for (const book of books) {
            worksheet.addRow({
                author: book.author,
                title: book.title,
                price: book.price,
                image: book.image || '',
                isbn: (book as any).isbn || '',
                description: book.description || '',
                stock: book.stock,
                category: book.category || '',
                language: book.language,
                active: book.active ? 'oui' : 'non',
                createdAt: book.createdAt.toISOString().replace('T', ' ').substring(0, 19),
            })
        }

        const buffer = await workbook.xlsx.writeBuffer()

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="livres_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
            },
        })
    } catch (error) {
        console.error('Erreur export Excel:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
