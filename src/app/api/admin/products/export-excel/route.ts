import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { verifyAdmin } from '@/lib/actions/auth'

// GET /api/admin/products/export-excel — export tous les livres au format Excel
export async function GET(request: Request) {
    try {
        await verifyAdmin()

        const { searchParams } = new URL(request.url)
        const searchQuery = searchParams.get('search') || ''
        const filterParam = searchParams.get('filter') || ''

        const where: any = {
            ...(searchQuery && {
                OR: [
                    { title: { contains: searchQuery } },
                    { author: { contains: searchQuery } },
                    { category: { contains: searchQuery } }
                ]
            }),
            ...(filterParam === 'no-image' && {
                image: { in: ['', '/product-placeholder.png'] }
            }),
            ...(filterParam === 'out-of-stock' && {
                stock: { equals: 0 }
            }),
            ...(filterParam === 'in-stock' && {
                stock: { gt: 0 }
            }),
            ...(filterParam === 'active' && {
                active: true
            }),
            ...(filterParam === 'inactive' && {
                active: false
            }),
            ...(filterParam.startsWith('lang:') && {
                language: filterParam.split(':')[1]
            })
        }

        let orderBy: any = [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
        if (filterParam === 'price-asc') orderBy = [{ price: 'asc' }]
        else if (filterParam === 'price-desc') orderBy = [{ price: 'desc' }]
        else if (filterParam === 'stock-asc') orderBy = [{ stock: 'asc' }]
        else if (filterParam === 'stock-desc') orderBy = [{ stock: 'desc' }]
        else if (filterParam === 'title-asc') orderBy = [{ title: 'asc' }]
        else if (filterParam === 'title-desc') orderBy = [{ title: 'desc' }]

        // Récupérer tous les livres
        const products = await prisma.product.findMany({
            where,
            orderBy,
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Products')

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
        for (const product of products) {
            worksheet.addRow({
                author: product.author,
                title: product.title,
                price: product.price,
                image: product.image || '',
                isbn: (product as any).isbn || '',
                description: product.description || '',
                stock: product.stock,
                category: product.category || '',
                language: product.language,
                active: product.active ? 'oui' : 'non',
                createdAt: product.createdAt.toISOString().replace('T', ' ').substring(0, 19),
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
