import { NextResponse, NextRequest } from 'next/server'
import { verifyAdmin } from '@/lib/actions/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        await verifyAdmin()

        let assets: any[] = []
        let tableExists = true

        // On tente de récupérer depuis la base de données
        try {
            assets = await prisma.marketingAsset.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            })

            // Réparation automatique des IDs manquants pour les anciens assets
            const needsRepair = assets.filter(a => !a.productId && !a.packId)
            if (needsRepair.length > 0) {
                const [allBooks, allPacks] = await Promise.all([
                    prisma.product.findMany({ select: { id: true, title: true } }),
                    prisma.pack.findMany({ select: { id: true, name: true } })
                ])
                const getSlug = (text: string) => text.replace(/[^a-z0-9]/gi, '_').toLowerCase()

                for (const asset of needsRepair) {
                    const nameParts = asset.name.split('_')
                    if (nameParts.length >= 3) {
                        const slug = nameParts.slice(1, -1).join('_')
                        let productId = null
                        let packId = null

                        if (asset.type === 'PACK') {
                            packId = allPacks.find(p => getSlug(p.name) === slug)?.id || null
                        } else {
                            productId = allBooks.find(b => getSlug(b.title) === slug)?.id || null
                        }

                        if (productId || packId) {
                            await prisma.marketingAsset.update({
                                where: { id: asset.id },
                                data: { productId, packId }
                            })
                            // Mettre à jour l'objet en mémoire pour le retour immédiat
                            asset.productId = productId
                            asset.packId = packId
                        }
                    }
                }
            }
        } catch (dbError) {
            console.error('Database query failed, probably table missing:', dbError)
            tableExists = false
        }

        // Si la table n'existe pas ou qu'elle est vide, on scanne le disque
        if (!tableExists || assets.length === 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
            try {
                const files = await fs.readdir(uploadDir)
                const marketingFiles = files.filter(file => 
                    file.startsWith('creative_') || 
                    file.startsWith('pack_') || 
                    file.startsWith('desc_')
                )

                if (marketingFiles.length > 0) {
                    const diskAssets = []
                    
                    // Pré-charger les livres et packs pour le matching (plus efficace qu'une requête par fichier)
                    const [allBooks, allPacks] = await Promise.all([
                        prisma.product.findMany({ select: { id: true, title: true } }),
                        prisma.pack.findMany({ select: { id: true, name: true } })
                    ])

                    const getSlug = (text: string) => text.replace(/[^a-z0-9]/gi, '_').toLowerCase()

                    for (const file of marketingFiles) {
                        let type = 'CREATIVE'
                        if (file.startsWith('pack_')) type = 'PACK'
                        if (file.startsWith('desc_')) type = 'DESCRIPTION'

                        // Tenter de retrouver l'ID
                        let productId = null
                        let packId = null
                        const nameParts = file.split('_')
                        if (nameParts.length >= 3) {
                            const slug = nameParts.slice(1, -1).join('_')
                            if (type === 'PACK') {
                                packId = allPacks.find(p => getSlug(p.name) === slug)?.id || null
                            } else {
                                productId = allBooks.find(b => getSlug(b.title) === slug)?.id || null
                            }
                        }

                        const stats = await fs.stat(path.join(uploadDir, file))
                        
                        const assetData = {
                            name: file,
                            url: `/uploads/products/${file}`,
                            type,
                            productId,
                            packId,
                            createdAt: stats.mtime
                        }
                        diskAssets.push(assetData)

                        // Si la table existe mais était vide, on synchronise avec les IDs trouvés
                        if (tableExists) {
                            try {
                                await prisma.marketingAsset.upsert({
                                    where: { name: file },
                                    update: { 
                                        url: assetData.url, 
                                        type,
                                        productId,
                                        packId
                                    },
                                    create: { 
                                        name: file, 
                                        url: assetData.url, 
                                        type,
                                        productId,
                                        packId
                                    }
                                })
                            } catch (e) {
                                console.error('Sync failed for', file, e)
                            }
                        }
                    }
                    
                    // Si on a récupéré du disque, on trie et on utilise ces données
                    if (assets.length === 0) {
                        assets = diskAssets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    }
                }
            } catch (e) {
                console.error('Filesystem scan failed:', e)
            }
        }

        return NextResponse.json({ success: true, assets })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await verifyAdmin()
        const { name, url, type, productId, packId } = await request.json()

        if (!name || !url) {
            return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 })
        }

        const asset = await prisma.marketingAsset.upsert({
            where: { name },
            update: { 
                url, 
                type: type || 'CREATIVE',
                productId,
                packId
            },
            create: { 
                name, 
                url, 
                type: type || 'CREATIVE',
                productId,
                packId
            }
        })

        return NextResponse.json({ success: true, asset })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
