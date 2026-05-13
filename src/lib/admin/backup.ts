import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)
const BACKUP_DIR = path.join(process.cwd(), 'backups')

export interface BackupFile {
    name: string
    size: number
    createdAt: Date
}

/**
 * Assure que le dossier de backup existe
 */
function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }
}

/**
 * Parse DATABASE_URL pour extraire les infos MySQL
 */
function parseDatabaseUrl(url: string) {
    // mysql://user:pass@host:port/db
    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
    const match = url.match(regex)
    if (!match) throw new Error('Format DATABASE_URL invalide')
    
    return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: match[4],
        database: match[5].split('?')[0] // Remove query parameters
    }
}

/**
 * Génère un dump SQL
 */
export async function createBackup() {
    ensureBackupDir()
    
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) throw new Error('DATABASE_URL manquante')
    
    const config = parseDatabaseUrl(dbUrl)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup_${timestamp}.sql`
    const filepath = path.join(BACKUP_DIR, filename)
    
    // Commande mysqldump
    // --column-statistics=0 est souvent nécessaire pour les versions récentes de mysql client vs serveurs anciens
    const command = `mysqldump -h ${config.host} -P ${config.port} -u ${config.user} -p${config.password} ${config.database} > "${filepath}"`
    
    try {
        await execAsync(command)
        return { filename, filepath }
    } catch (error: any) {
        console.error('Erreur mysqldump:', error)
        throw new Error(`Erreur lors de la génération du dump : ${error.message}`)
    }
}

/**
 * Liste les backups existants
 */
export async function listBackups(): Promise<BackupFile[]> {
    ensureBackupDir()
    const files = fs.readdirSync(BACKUP_DIR)
    
    return files
        .filter(f => f.endsWith('.sql'))
        .map(f => {
            const stats = fs.statSync(path.join(BACKUP_DIR, f))
            return {
                name: f,
                size: stats.size,
                createdAt: stats.birthtime
            }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Supprime un backup
 */
export async function deleteBackup(filename: string) {
    const filepath = path.join(BACKUP_DIR, filename)
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
    }
}

/**
 * Récupère le chemin d'un backup pour téléchargement
 */
export function getBackupPath(filename: string) {
    const filepath = path.join(BACKUP_DIR, filename)
    if (fs.existsSync(filepath)) {
        return filepath
    }
    return null
}
