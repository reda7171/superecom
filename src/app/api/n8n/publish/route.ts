import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/actions/site-settings'
import { sendTelegramMessage } from '@/lib/telegram'

import { verifyAdmin } from '@/lib/actions/auth'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
    try {
        // OWASP A01: Broken Access Control - Authentification Admin Obligatoire
        try {
            await verifyAdmin()
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // OWASP A04: Rate Limiting
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`n8n_publish_${ip}`, { limit: 5, windowMs: 60000 })
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        const body = await req.json()
        const { bookId, packId, format, scheduleAt, platform, useDescription, customImageUrl } = body

        // URL du webhook n8n (Priorité à la DB, puis .env)
        const dbWebhookUrl = await getSetting('n8n_webhook_url')
        const N8N_WEBHOOK_URL = dbWebhookUrl || process.env.N8N_WEBHOOK_URL

        if (!N8N_WEBHOOK_URL) {
            return NextResponse.json({ error: 'N8N_WEBHOOK_URL non configuré' }, { status: 500 })
        }

        let item: any = null;
        let itemType: 'BOOK' | 'PACK' | 'OTHER' = 'OTHER';

        if (bookId) {
            item = await prisma.book.findUnique({ where: { id: bookId } })
            itemType = 'BOOK';
        } else if (packId) {
            item = await prisma.pack.findUnique({ where: { id: packId } })
            itemType = 'PACK';
        } else if (body.isPack) {
            itemType = 'PACK';
        }

        // Si pas de livre/pack et pas d'image custom, on arrête
        if (!item && !customImageUrl) {
            return NextResponse.json({ error: 'bookId, packId ou image requis' }, { status: 400 })
        }

        // Jeton d'accès Facebook, IG et TikTok (Stocké en DB via l'admin)
        const facebookAccessToken = await getSetting('facebook_access_token')
        const instagramAccountId = await getSetting('instagram_account_id')
        const tiktokAccessToken = await getSetting('tiktok_access_token')
        const tiktokCreatorId = await getSetting('tiktok_creator_id')
        const tiktokAppId = await getSetting('tiktok_app_id')
        const tiktokClientSecret = await getSetting('tiktok_client_secret')

        // URL publique (Facebook doit pouvoir accéder à l'image)
        let host = req.headers.get('host') || '';
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

        // Déterminer le protocole
        const protocol = (host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(host)) ? 'http' : 'https';

        // Logique de résolution de baseUrl pour éviter 'localhost' (inaccessible par Meta)
        const isLocal = (url: string) => !url || url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0');

        if (isLocal(baseUrl)) {
            if (!isLocal(host)) {
                baseUrl = `${protocol}://${host}`;
            } else {
                const port = host.split(':')[1] || '3000';
                baseUrl = `${protocol}://167.86.108.246${port ? `:${port}` : ''}`; 
            }
        }
        
        baseUrl = baseUrl.replace(/\/$/, '');

        let imageUrl = customImageUrl || item?.image || '';
        
        if (imageUrl && (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1'))) {
            try {
                const urlObj = new URL(imageUrl);
                imageUrl = urlObj.pathname + urlObj.search;
            } catch (e) {
                // Ignore
            }
        }

        if (imageUrl.startsWith('data:image')) {
            return NextResponse.json({ 
                error: "L'image de cet élément est au format Base64. Facebook ne supporte pas ce format. Veuillez uploader une image réelle." 
            }, { status: 400 });
        }

        if (imageUrl && !imageUrl.startsWith('http')) {
            const imagePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
            imageUrl = `${baseUrl}${imagePath}`;
        }

        // --- PROXY HTTPS POUR META (Instagram/Facebook) ---
        // Instagram/Facebook exigent HTTPS. On utilise wsrv.nl comme proxy gratuit
        // Cela règle aussi le problème du format .webp non supporté par IG.
        if (imageUrl && (platform === 'instagram' || platform === 'facebook' || platform === 'both' || platform === 'all')) {
            imageUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&output=jpg&q=85`;
            console.log('[N8N PUBLISH] Using Proxy URL for Meta:', imageUrl);
        }

        const title = body.packName || body.title || (item ? (itemType === 'BOOK' ? item.title : item.name) : 'Riwaya');
        const price = body.price || item?.price || 0;

        // Construire le payload envoyé à n8n
        const payload = {
            itemId: item?.id || 'marketing',
            itemType,
            title: title,
            author: itemType === 'BOOK' ? item?.author : 'Riwaya',
            price: price,
            category: itemType === 'BOOK' ? item?.category : 'Promotion',
            language: itemType === 'BOOK' ? item?.language : 'fr',
            image: imageUrl,
            isPack: itemType === 'PACK',
            booksList: body.books || (itemType === 'PACK' ? (item as any).books?.map((b: any) => b.book?.title || b.title) : []),
            bookUrl: itemType === 'BOOK' ? `${baseUrl}/fr/books/${item.id}` : '',
            packUrl: itemType === 'PACK' ? `${baseUrl}/fr/packs` : '',
            itemUrl: item ? (itemType === 'BOOK' ? `${baseUrl}/fr/books/${item.id}` : `${baseUrl}/fr/packs`) : baseUrl,
            // Texte à publier avec lien intégré
            caption: body.customCaption || (itemType === 'BOOK' ? (item?.description || title) : (item?.description ? `${title}\n\n${item.description}` : title)),
            description: body.customCaption || item?.description || '',
            longDescription: item?.longDescription || '',
            format,
            platform,
            scheduleAt: scheduleAt || null,
            source: 'riwaya-admin',
            facebook_access_token: facebookAccessToken,
            instagram_account_id: instagramAccountId,
            tiktok_access_token: tiktokAccessToken,
            tiktok_creator_id: tiktokCreatorId,
            tiktok_app_id: tiktokAppId,
            tiktok_client_secret: tiktokClientSecret
        }

        // Envoyer au webhook n8n
        console.log('[N8N PUBLISH] Sending payload to:', N8N_WEBHOOK_URL);
        
        // Timeout de 10 secondes pour éviter de bloquer le serveur
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        let n8nRes;
        try {
            n8nRes = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            })
        } catch (fetchError: any) {
            console.error('[N8N PUBLISH] Fetch failed:', fetchError);
            if (fetchError.name === 'AbortError') {
                return NextResponse.json({ error: 'Le serveur n8n ne répond pas (Timeout 10s)' }, { status: 504 })
            }
            return NextResponse.json({ 
                error: `Impossible de contacter n8n (${N8N_WEBHOOK_URL}). Vérifiez que le serveur n8n est allumé et accessible.`,
                details: fetchError.message 
            }, { status: 502 })
        } finally {
            clearTimeout(timeoutId);
        }

        if (!n8nRes.ok) {
            const errText = await n8nRes.text()
            console.error('[N8N PUBLISH] n8n error response:', errText);
            return NextResponse.json({ error: `n8n a retourné une erreur: ${errText}` }, { status: 502 })
        }

        const n8nData = await n8nRes.json().catch(() => ({}))

        // Envoyer la notification Telegram
        const platformLabel = platform === 'all' 
            ? 'toutes les plateformes' 
            : platform === 'tiktok' 
                ? 'TikTok' 
                : platform === 'both' || platform === 'all' 
                    ? 'Facebook & Instagram' 
                    : platform.charAt(0).toUpperCase() + platform.slice(1);

        const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const messageText = scheduleAt 
            ? `📅 <b>Publication Programmée</b>\n\nUn post pour <b>${safeTitle}</b> a été programmé sur <b>${platformLabel}</b> via n8n.\n🕒 <b>Date:</b> ${new Date(scheduleAt).toLocaleString('fr-FR')}`
            : `🚀 <b>Nouvelle Publication</b>\n\nUn post pour <b>${safeTitle}</b> a été envoyé à n8n pour publication immédiate sur <b>${platformLabel}</b>.`;
            
        sendTelegramMessage(messageText).catch(console.error);

        return NextResponse.json({
            success: true,
            message: scheduleAt ? `Programmé pour ${scheduleAt}` : 'Envoyé à n8n pour publication',
            n8n: n8nData
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur interne'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
