'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import ExcelJS from 'exceljs'
import { verifyAdmin } from './auth'

export async function importOrdersFromExcel(formData: FormData) {
    try {
        await verifyAdmin()
        
        const file = formData.get('file') as File
        if (!file) return { success: false, error: 'Aucun fichier fourni' }
        
        const buffer = Buffer.from(await file.arrayBuffer())
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer as any)
        
        const worksheet = workbook.worksheets[0]
        if (!worksheet) return { success: false, error: 'Fichier Excel vide' }
        
        const rows: any[] = []
        let headers: any[] = []
        
        worksheet.eachRow((row, rowNumber) => {
            const rowValues = row.values as any[]
            if (rowNumber === 1) {
                headers = rowValues
            } else {
                const rowData: any = {}
                headers.forEach((header, index) => {
                    if (header) {
                        rowData[header.toString().trim()] = rowValues[index]
                    }
                })
                rows.push(rowData)
            }
        })
        
        let count = 0
        
        for (const r of rows) {
            const getVal = (key: string) => {
                const foundKey = Object.keys(r).find(k => k.toLowerCase().includes(key.toLowerCase()))
                return foundKey ? r[foundKey] : undefined
            }
            
            const fullName = getVal('nom') || 'Client Inconnu'
            const phone = getVal('num') || '0000000000'
            const city = getVal('ville') || 'Inconnue'
            const totalStr = getVal('total') || 0
            const total = parseFloat(totalStr.toString().replace(',', '.')) || 0
            
            const subtotalStr = getVal('prix product') || 0
            const subtotal = parseFloat(subtotalStr.toString().replace(',', '.')) || 0
            
            const shippingFeesStr = getVal('livraison') || 0
            const shippingFees = parseFloat(shippingFeesStr.toString().replace(',', '.')) || 0
            
            const methodStr = getVal('methode py') || ''
            const paymentMethod = methodStr.toString().toLowerCase().includes('cih') ? 'VIREMENT' : 'COD'
            
            const isPaid = getVal('paye')?.toString().toLowerCase() === 'ok'
            const status = isPaid ? 'DELIVERED' : 'PENDING'
            const booksTitles = getVal('livres') || ''
            const nbrLivreStr = getVal('nbr livre') || getVal('articles') || '1'
            const nbrLivre = parseInt(nbrLivreStr.toString(), 10) || 1
            const comment = `Importé (Anciennes commandes). Livres: ${booksTitles}`
            
            if (!getVal('nom') && !getVal('num') && !getVal('total')) continue; // Skip completely empty rows
            
            // Tentative de retrouver le livre par son titre pour avoir le costPrice
            let productId = null
            let bookCostPrice = 0
            
            if (booksTitles) {
                const product = await prisma.product.findFirst({
                    where: { 
                        title: { contains: booksTitles.toString().split(',')[0].trim() } 
                    },
                    select: { id: true, costPrice: true }
                })
                if (product) {
                    productId = product.id
                    bookCostPrice = product.costPrice
                }
            }

            await prisma.order.create({
                data: {
                    fullName: fullName.toString(),
                    phone: phone.toString(),
                    city: city.toString(),
                    address: city.toString(),
                    total,
                    subtotal,
                    shippingFees,
                    paymentMethod,
                    status,
                    comment,
                    items: {
                        create: [
                            {
                                type: 'BOOK',
                                productId: productId,
                                quantity: nbrLivre,
                                price: nbrLivre > 0 ? subtotal / nbrLivre : subtotal,
                                costPrice: bookCostPrice
                            }
                        ]
                    }
                }
            })
            count++
        }
        
        revalidatePath('/', 'layout')
        return { success: true, count }
    } catch (e: any) {
        console.error(e)
        return { success: false, error: e.message }
    }
}
