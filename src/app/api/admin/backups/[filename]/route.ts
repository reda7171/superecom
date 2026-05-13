import { NextRequest, NextResponse } from 'next/server'
import { getBackupPath, deleteBackup } from '@/lib/admin/backup'
import { isAuthenticated } from '@/lib/actions/auth'
import { cookies } from 'next/headers'
import fs from 'fs'

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ filename: string }> }
) {
    const params = await props.params;
    try {
        const isAuth = await isAuthenticated()
        const cookieStore = await cookies()
        const role = cookieStore.get('admin-role')?.value

        if (!isAuth || role !== 'ADMIN') {
            return new NextResponse('Non autorisé', { status: 401 })
        }
        
        const filepath = getBackupPath(params.filename)
        if (!filepath) {
            return new NextResponse('Fichier non trouvé', { status: 404 })
        }
        
        const fileBuffer = fs.readFileSync(filepath)
        
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${params.filename}"`
            }
        })
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ filename: string }> }
) {
    const params = await props.params;
    try {
        const isAuth = await isAuthenticated()
        const cookieStore = await cookies()
        const role = cookieStore.get('admin-role')?.value

        if (!isAuth || role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }
        
        await deleteBackup(params.filename)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
