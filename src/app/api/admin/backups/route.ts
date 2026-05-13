import { NextResponse } from 'next/server'
import { listBackups, createBackup } from '@/lib/admin/backup'
import { isAuthenticated } from '@/lib/actions/auth'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const isAuth = await isAuthenticated()
        const cookieStore = await cookies()
        const role = cookieStore.get('admin-role')?.value

        if (!isAuth || role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }
        
        const backups = await listBackups()
        return NextResponse.json({ success: true, backups })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST() {
    try {
        const isAuth = await isAuthenticated()
        const cookieStore = await cookies()
        const role = cookieStore.get('admin-role')?.value

        if (!isAuth || role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }
        
        const result = await createBackup()
        return NextResponse.json({ success: true, ...result })
    } catch (error: any) {
        console.error('API Backup POST Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
