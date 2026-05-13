'use server'

import fs from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

const messagesDir = path.join(process.cwd(), 'src', 'messages')

export async function getTranslationsData() {
    try {
        const fr = JSON.parse(await fs.readFile(path.join(messagesDir, 'fr.json'), 'utf-8'))
        const en = JSON.parse(await fs.readFile(path.join(messagesDir, 'en.json'), 'utf-8'))
        const ar = JSON.parse(await fs.readFile(path.join(messagesDir, 'ar.json'), 'utf-8'))
        return { fr, en, ar }
    } catch (e: any) {
        console.error(e)
        return { fr: {}, en: {}, ar: {} }
    }
}

export async function saveTranslationFile(lang: string, data: any) {
    if (!['fr', 'en', 'ar'].includes(lang)) return { success: false, error: 'Invalid language' };
    try {
        const filePath = path.join(messagesDir, `${lang}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
