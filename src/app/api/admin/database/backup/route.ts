import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/actions/auth'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

/**
 * API pour générer un backup SQL de la base de données
 * Nécessite mysql-client installé sur le serveur/conteneur
 */
export async function GET(req: NextRequest) {
    try {
        await verifyAdmin()

        const dbUrl = process.env.DATABASE_URL || ''
        
        let user, password, host, port, dbname;
        
        try {
            const url = new URL(dbUrl)
            user = url.username
            password = url.password
            host = url.hostname
            port = url.port || '3306'
            dbname = url.pathname.substring(1).split('?')[0] // Remove leading slash and query params
        } catch (e) {
            return NextResponse.json({ error: 'DATABASE_URL format invalide' }, { status: 500 })
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `backup_riwaya_${timestamp}.sql`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        const tempPath = path.join(uploadDir, filename)

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // On utilise spawn pour éviter les problèmes d'échappement du shell
        return new Promise<NextResponse>((resolve) => {
            const writeStream = fs.createWriteStream(tempPath)
            
            const mysqldump = spawn('mysqldump', [
                '--ssl-mode=DISABLED',
                '-h', host,
                '-P', port,
                '-u', user,
                `-p${password}`,
                dbname
            ])

            mysqldump.stdout.pipe(writeStream)

            let errorData = ''
            mysqldump.stderr.on('data', (data) => {
                errorData += data.toString()
            })

            mysqldump.on('close', (code) => {
                if (code !== 0) {
                    console.error('Mysqldump error:', errorData)
                    // Nettoyer le fichier vide/incomplet
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
                    
                    let errorMessage = 'Erreur lors de l\'exécution de mysqldump.'
                    const isWindows = process.platform === 'win32'
                    
                    if (errorData.includes('not recognized') || errorData.includes('ENOENT')) {
                        errorMessage += ' L\'utilitaire "mysqldump" est introuvable. ' + 
                            (isWindows 
                                ? 'Veuillez installer MySQL et ajouter le dossier "bin" à votre PATH.' 
                                : 'Veuillez installer "mysql-client" sur votre serveur.')
                    }

                    resolve(NextResponse.json({ 
                        error: errorMessage,
                        details: errorData || `Process exited with code ${code}`
                    }, { status: 500 }))
                    return
                }

                // Lire le fichier généré
                const fileBuffer = fs.readFileSync(tempPath)
                fs.unlinkSync(tempPath)

                resolve(new NextResponse(fileBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/sql',
                        'Content-Disposition': `attachment; filename="${filename}"`,
                    },
                }))
            })

            mysqldump.on('error', (err: any) => {
                console.error('Spawn error:', err)
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
                
                let errorMessage = 'Erreur lors du lancement de mysqldump.'
                if (err.code === 'ENOENT') {
                    errorMessage += ' L\'utilitaire "mysqldump" est introuvable.'
                }

                resolve(NextResponse.json({ 
                    error: errorMessage,
                    details: err.message
                }, { status: 500 }))
            })
        })

    } catch (error: any) {
        console.error('Backup API error:', error)
        return NextResponse.json({ error: error.message || 'Erreur lors du backup' }, { status: 500 })
    }
}
