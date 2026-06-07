import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/actions/auth'
import ExcelJS from 'exceljs'
import { generateText } from '@/lib/gemini'

export async function POST(req: Request) {
    try {
        const isAuth = await isAuthenticated()
        if (!isAuth) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { ids } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse('Bad Request', { status: 400 })
        }

        const products = await prisma.product.findMany({
            where: {
                id: { in: ids }
            }
        })

        // Transcription des titres arabes via Gemini
        const transliterations: Record<string, string> = {}
        const arabicBooks = products.filter(b => /[\u0600-\u06FF]/.test(b.title))
        
        if (arabicBooks.length > 0) {
            const prompt = `Transliterate these Arabic product titles into Latin characters (Transcription style used in Morocco/Maghreb, e.g., using numbers for some letters like 3, 7, 9 if common, or standard transcription). 
            Return ONLY a JSON object where keys are the original titles and values are the transliterated versions.
            Titles: ${JSON.stringify(arabicBooks.map(b => b.title))}`
            
            const aiResult = await generateText(prompt)
            if (aiResult) {
                try {
                    // Nettoyer le résultat AI (enlever les blocs de code markdown si présents)
                    const cleanJson = aiResult.replace(/```json|```/g, '').trim()
                    const parsed = JSON.parse(cleanJson)
                    Object.assign(transliterations, parsed)
                } catch (e) {
                    console.error("Erreur parsing Gemini transliteration:", e)
                }
            }
        }

        const columns = [
            'Name', 'Name_AR', 'Name_FR', 'Description', 'Description_AR', 'Description_FR', 
            'SellerSKU', 'ParentSKU', 'Brand', 'PrimaryCategory', 'AdditionalCategory', 'GTIN_Barcode', 'Price_MAD', 
            'Sale_Price_MAD', 'Sale_Price_Start_At', 'Sale_Price_End_At', 'Stock', 'isbn', 'pages', 
            'variation', 'age_range', 'author', 'book_type', 'certifications', 'color', 'color_AR', 
            'color_FR', 'color_family', 'genre', 'language', 'main_material', 'manufacturer_txt', 
            'material_family', 'model', 'note', 'package_content', 'package_content_AR', 
            'package_content_FR', 'product_line', 'product_measures', 'product_warranty', 
            'product_weight', 'production_country', 'short_description', 'short_description_AR', 
            'short_description_FR', 'warranty_address', 'warranty_duration', 'warranty_type', 
            'year_of_publication', 'youtube_id', 'MainImage', 'Image2', 'Image3', 'Image4', 'Image5', 
            'Image6', 'Image7', 'Image8'
        ]

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Upload Template')

        // Configurer les colonnes
        worksheet.columns = columns.map(col => ({ header: col, key: col, width: 20 }))

        // Style de l'en-tête
        worksheet.getRow(1).font = { bold: true }

        for (const product of products) {
            const rowData: any = {}
            const hasArabic = /[\u0600-\u06FF]/.test(product.title)
            const transliterated = transliterations[product.title] || product.title
            
            for (const col of columns) {
                let val: any = ''
                
                switch (col) {
                    case 'Name':
                        val = hasArabic ? transliterated : product.title
                        break
                    case 'Name_FR':
                    case 'Name_EN':
                        val = hasArabic ? transliterated : product.title
                        break
                    case 'Name_AR':
                        val = hasArabic ? product.title : ''
                        break
                    case 'Description':
                    case 'Description_FR':
                    case 'short_description':
                    case 'short_description_FR':
                        val = product.longDescription || product.description
                        break
                    case 'SellerSKU':
                    case 'ParentSKU':
                        val = product.id.substring(0, 8).toUpperCase()
                        break
                    case 'Brand':
                        val = '1015941 - Products'
                        break
                    case 'PrimaryCategory':
                        val = '1000203 - Products, Movies and Music / Bestselling Products'
                        break
                    case 'GTIN_Barcode':
                    case 'isbn':
                        val = product.isbn || ''
                        break
                    case 'Price_MAD':
                        val = product.price
                        break
                    case 'Stock':
                        val = product.stock
                        break
                    case 'author':
                        val = product.author
                        break
                    case 'language':
                        val = product.language === 'ar' ? 'Arabic' : product.language === 'en' ? 'English' : 'French'
                        break
                    case 'book_type':
                        val = 'Paperback'
                        break
                    case 'variation':
                        val = '...'
                        break
                    case 'age_range':
                        val = '18 Years +'
                        break
                    case 'production_country':
                        val = 'Morocco'
                        break
                    case 'main_material':
                        val = 'Paper'
                        break
                    case 'product_weight':
                        val = '0.5'
                        break
                    case 'package_content':
                        val = '1 Product'
                        break
                    case 'warranty_type':
                        val = 'Replacement by Vendor'
                        break
                    case 'MainImage':
                        val = product.image
                        if (val && !val.startsWith('http')) {
                            val = `${process.env.NEXT_PUBLIC_APP_URL || 'https://superEcom.ma'}${val.startsWith('/') ? '' : '/'}${val}`
                        }
                        break
                }
                rowData[col] = val
            }
            worksheet.addRow(rowData)
        }

        const buffer = await workbook.xlsx.writeBuffer()

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="jumia_export_${new Date().toISOString().split('T')[0]}.xlsx"`
            }
        })

    } catch (error) {
        console.error('Jumia Export Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}


