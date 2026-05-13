import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import path from 'path'

import { verifyAdmin } from '@/lib/actions/auth'

export async function GET() {
    try {
        await verifyAdmin()
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filePath = 'C:\\Users\\HP\\Desktop\\Guide_jumia.xlsx'
    const workbook = new ExcelJS.Workbook()
    
    try {
        await workbook.xlsx.readFile(filePath)
        const result: any = []
        
        workbook.eachSheet((worksheet) => {
            const headers: any = []
            const rows: any = []
            
            const headerRow = worksheet.getRow(1)
            headerRow.eachCell((cell) => {
                headers.push(cell.value)
            })
            
            // On prend les 5 premières lignes de données pour comprendre le format
            for (let i = 2; i <= 6; i++) {
                const row = worksheet.getRow(i)
                const rowData: any = {}
                row.eachCell((cell, colNumber) => {
                    const header = headers[colNumber - 1]
                    if (header) {
                        rowData[header] = cell.value
                    }
                })
                if (Object.keys(rowData).length > 0) {
                    rows.push(rowData)
                }
            }
            
            result.push({
                name: worksheet.name,
                headers,
                sample: rows
            })
        })
        
        const brandsSheet = workbook.getWorksheet('Brands')
        let genericBrand = 'Generic'
        if (brandsSheet) {
            brandsSheet.eachRow((row) => {
                const val = row.getCell(1).value as string
                if (val && val.toLowerCase().includes('generic')) {
                    genericBrand = val
                }
            })
        }

        return new NextResponse(JSON.stringify({ sheets: result, genericBrand }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
