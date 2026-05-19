'use client'

import React, { useRef, useState, useEffect } from 'react'
import { X, Download, ImageIcon, Sparkles, Facebook, Instagram, Phone, Loader2, Send, Clock, Music } from 'lucide-react'
import * as htmlToImage from 'html-to-image'
import { injectXMPToPNG } from '@/lib/pngXmpInjector'
import { normalizeImage } from '@/lib/utils'

interface Book {
    id: string
    title: string
    author: string
    price: number
    image?: string
}

interface PackCreativeModalProps {
    isOpen: boolean
    onClose: () => void
    pack: {
        id?: string
        name: string
        description?: string
        price: number
        isFreeDelivery?: boolean
        books: Book[]
        whatsappNumber?: string
    } | null
    format?: 'post' | 'story'
}

export default function PackCreativeModal({ isOpen, onClose, pack, format = 'post' }: PackCreativeModalProps) {
    const posterRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [theme, setTheme] = useState<'dark' | 'light' | 'orange' | 'magenta' | 'emerald' | 'gold' | 'purple'>('dark')
    const [isGeneratingNameFR, setIsGeneratingNameFR] = useState(false)
    const [isGeneratingNameAR, setIsGeneratingNameAR] = useState(false)
    const [isGeneratingDescFR, setIsGeneratingDescFR] = useState(false)
    const [isGeneratingDescAR, setIsGeneratingDescAR] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok' | 'all'>('all')
    const [scheduleAt, setScheduleAt] = useState('')
    const [caption, setCaption] = useState('')

    // State for draggable positions
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({
        badge: { x: 0, y: 0 },
        logo: { x: 0, y: 0 },
        footer: { x: 0, y: 0 },
        delivery: { x: 0, y: 0 },
        plus: { x: 0, y: 0 },
        title: { x: 0, y: 0 },
        description: { x: 0, y: 0 },
        limited: { x: 0, y: 0 },
        price: { x: 0, y: 160 },
        whatsapp: { x: 0, y: 220 },
        bg: { x: 0, y: 0 }
    })

    const [dragging, setDragging] = useState<string | null>(null)
    // Clé de l'élément texte en cours d'édition (double-clic)
    const [editingKey, setEditingKey] = useState<string | null>(null)
    // Multi-sélection
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
    // Textes libres ajoutés par l'utilisateur
    const [customTexts, setCustomTexts] = useState<{ id: string; text: string; size: number; color: string }[]>([])
    // Layout actuel des livres (cycle entre les dispositions)
    const [currentLayout, setCurrentLayout] = useState(0)
    const [imageScale, setImageScale] = useState(1)
    const [plusScale, setPlusScale] = useState(1)
    const [rotations, setRotations] = useState<Record<string, number>>({})
    const [shadows, setShadows] = useState<Record<string, boolean>>({})
    const [logoScale, setLogoScale] = useState(3)
    const [showLogo, setShowLogo] = useState(true)
    const [showFreeDelivery, setShowFreeDelivery] = useState(pack?.isFreeDelivery || false)
    const [showPlus, setShowPlus] = useState(false)
    const [showPrice, setShowPrice] = useState(true)
    const [showSolde, setShowSolde] = useState(true)
    const [showWhatsapp, setShowWhatsapp] = useState(true)
    const [whatsappScale, setWhatsappScale] = useState(1)
    const [showName, setShowName] = useState(true)
    const [showDescription, setShowDescription] = useState(true)
    const [layerOrder, setLayerOrder] = useState<string[]>([])
    const [bgImage, setBgImage] = useState<string | null>(null)
    const [bgOpacity, setBgOpacity] = useState(1)

    // State for editable texts
    const [editableTexts, setEditableTexts] = useState({
        badge: 'Pack Spécial',
        logo: 'RIWAYA',
        name: pack?.name || 'Nom du Pack',
        description: pack?.description || (pack?.books ? `${pack.books.length} Livres exceptionnels` : 'Livres exceptionnels'),
        limited: 'Offre Limitée',
        delivery_line1: 'Livraison',
        delivery_line2: 'Gratuite',
        price: pack?.price?.toString() || '0',
        oldPrice: pack?.price ? Math.round(pack.price * 1.3).toString() : '0',
        whatsapp: pack?.whatsappNumber || '+212 6XX XX XX XX'
    })

    // Refs pour positions (évite les re-renders pendant le drag)
    const positionsRef = useRef<Record<string, { x: number, y: number }>>({
        badge: { x: 0, y: 0 },
        logo: { x: 0, y: 0 },
        footer: { x: 0, y: 0 },
        delivery: { x: 0, y: 0 },
        plus: { x: 0, y: 0 },
        title: { x: 0, y: 0 },
        description: { x: 0, y: 0 },
        limited: { x: 0, y: 0 },
        price: { x: 0, y: 160 },
        whatsapp: { x: 0, y: 220 },
        bg: { x: 0, y: 0 }
    })
    // Refs pour accéder aux éléments DOM directement
    const dragElemsRef = useRef<Record<string, HTMLElement | null>>({})
    const dragKeyRef = useRef<string | null>(null)
    const dragStartRef = useRef({ mx: 0, my: 0, px: 0, py: 0 })
    // Positions initiales de tous les éléments sélectionnés au début du drag
    const groupStartRef = useRef<Record<string, { px: number, py: number }>>({})

    const handleTextChange = (key: string, value: string) => {
        setEditableTexts(prev => ({ ...prev, [key]: value }))
    }

    // Applique le transform sur l'élément DOM ciblé
    const applyTransform = (key: string, x: number, y: number) => {
        const el = dragElemsRef.current[key]
        if (!el) return
        const isTextCentered = ['title', 'description', 'limited', 'price', 'whatsapp'].includes(key)
        if (isTextCentered) {
            el.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`
        } else {
            el.style.transform = `translate(${x}px, ${y}px)`
        }
    }

    const handleMouseDown = (e: React.MouseEvent, key: string) => {
        if ((e.target as HTMLElement).isContentEditable || (e.target as HTMLElement).closest('[contenteditable="true"]')) return
        e.preventDefault()

        // Ctrl+clic = toggle sélection
        if (e.ctrlKey || e.metaKey) {
            setSelectedKeys(prev => {
                const next = new Set(prev)
                if (next.has(key)) next.delete(key)
                else next.add(key)
                return next
            })
            return
        }

        // Clic simple sans Ctrl = désélectionner tout sauf l'élément actuel
        setSelectedKeys(prev => {
            if (!prev.has(key)) return new Set([key])
            return prev // garde la sélection existante si l'élément est déjà dedans
        })

        if (key.startsWith('book_')) {
            const bookId = key.replace('book_', '')
            setLayerOrder(prev => {
                if (!prev.includes(bookId)) return prev
                const newOrder = prev.filter(id => id !== bookId)
                newOrder.push(bookId)
                return newOrder
            })
        }

        const pos = positionsRef.current[key] || { x: 0, y: 0 }
        dragKeyRef.current = key
        dragStartRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }

        // Sauvegarder positions initiales de tout le groupe sélectionné
        const currentSelected = selectedKeys.has(key) ? selectedKeys : new Set([key])
        groupStartRef.current = {}
        currentSelected.forEach(k => {
            const p = positionsRef.current[k] || { x: 0, y: 0 }
            groupStartRef.current[k] = { px: p.x, py: p.y }
        })

        setDragging(key)
    }

    const handleTouchStart = (e: React.TouchEvent, key: string) => {
        if ((e.target as HTMLElement).isContentEditable || (e.target as HTMLElement).closest('[contenteditable="true"]')) return
        e.preventDefault()

        const touch = e.touches[0]

        // Clic simple = désélectionner tout sauf l'élément actuel
        setSelectedKeys(prev => {
            if (!prev.has(key)) return new Set([key])
            return prev
        })

        if (key.startsWith('book_')) {
            const bookId = key.replace('book_', '')
            setLayerOrder(prev => {
                if (!prev.includes(bookId)) return prev
                const newOrder = prev.filter(id => id !== bookId)
                newOrder.push(bookId)
                return newOrder
            })
        }

        const pos = positionsRef.current[key] || { x: 0, y: 0 }
        dragKeyRef.current = key
        dragStartRef.current = { mx: touch.clientX, my: touch.clientY, px: pos.x, py: pos.y }

        const currentSelected = selectedKeys.has(key) ? selectedKeys : new Set([key])
        groupStartRef.current = {}
        currentSelected.forEach(k => {
            const p = positionsRef.current[k] || { x: 0, y: 0 }
            groupStartRef.current[k] = { px: p.x, py: p.y }
        })

        setDragging(key)
    }

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const key = dragKeyRef.current
            if (!key) return
            const { mx, my } = dragStartRef.current
            const dx = e.clientX - mx
            const dy = e.clientY - my

            // Déplacer tous les éléments du groupe
            Object.entries(groupStartRef.current).forEach(([k, { px, py }]) => {
                const x = px + dx
                const y = py + dy
                applyTransform(k, x, y)
                positionsRef.current[k] = { x, y }
            })
        }

        const onTouchMove = (e: TouchEvent) => {
            const key = dragKeyRef.current
            if (!key) return
            const touch = e.touches[0]
            const { mx, my } = dragStartRef.current
            const dx = touch.clientX - mx
            const dy = touch.clientY - my

            // Déplacer tous les éléments du groupe
            Object.entries(groupStartRef.current).forEach(([k, { px, py }]) => {
                const x = px + dx
                const y = py + dy
                applyTransform(k, x, y)
                positionsRef.current[k] = { x, y }
            })
        }

        const onMouseUp = () => {
            const key = dragKeyRef.current
            if (!key) return
            // Commit toutes les positions du groupe
            const updates: Record<string, { x: number, y: number }> = {}
            Object.keys(groupStartRef.current).forEach(k => {
                updates[k] = positionsRef.current[k]
            })
            setPositions(prev => ({ ...prev, ...updates }))
            dragKeyRef.current = null
            groupStartRef.current = {}
            setDragging(null)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onMouseUp)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onMouseUp)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedKeys])

    // Suppression des éléments sélectionnés via Delete / Backspace
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Delete' && e.key !== 'Backspace') return
            // Ne pas interférer avec l'édition de texte
            const active = document.activeElement
            if (active && (active.getAttribute('contenteditable') === 'true' || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return

            setSelectedKeys(prev => {
                if (prev.size === 0) return prev
                prev.forEach(key => {
                    // Textes libres → supprimer du state
                    if (key.startsWith('custom_')) {
                        const id = key.replace('custom_', '')
                        setCustomTexts(pt => pt.filter(t => `custom_${t.id}` !== key && t.id !== id))
                        delete dragElemsRef.current[key]
                        delete positionsRef.current[key]
                    }
                    // Éléments toggleables → désactiver
                    else if (key === 'logo') setShowLogo(false)
                    else if (key === 'delivery') setShowFreeDelivery(false)
                    else if (key === 'price') setShowPrice(false)
                    else if (key === 'plus') setShowPlus(false)
                    else if (key === 'whatsapp') setShowWhatsapp(false)
                    // Livres → impossible de supprimer (données pack)
                })
                return new Set()
            })
            e.preventDefault()
        }

        if (isOpen) window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    // Persist settings to localStorage
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('riwaya_pack_editor_settings')
            if (saved) {
                try {
                    const data = JSON.parse(saved)
                    if (data.positions) setPositions(prev => ({ ...prev, ...data.positions }))
                    if (data.theme) setTheme(data.theme)
                    if (data.imageScale) setImageScale(data.imageScale)
                    if (data.plusScale) setPlusScale(data.plusScale)
                    if (data.rotations) setRotations(data.rotations)
                    if (data.shadows) setShadows(data.shadows)
                    if (data.logoScale) setLogoScale(data.logoScale)
                    if (data.showLogo !== undefined) setShowLogo(data.showLogo)
                    if (data.layerOrder) setLayerOrder(data.layerOrder)
                    if (data.showPlus !== undefined) setShowPlus(data.showPlus)
                    if (data.showPrice !== undefined) setShowPrice(data.showPrice)
                    if (data.showWhatsapp !== undefined) setShowWhatsapp(data.showWhatsapp)
                    if (data.whatsappScale) setWhatsappScale(data.whatsappScale)
                    if (data.bgImage) setBgImage(data.bgImage)
                    if (data.bgOpacity !== undefined) setBgOpacity(data.bgOpacity)
                    if (data.whatsappNumber) setEditableTexts(prev => ({ ...prev, whatsapp: String(data.whatsappNumber) }))
                    else if (pack?.whatsappNumber) setEditableTexts(prev => ({ ...prev, whatsapp: String(pack.whatsappNumber) }))
                } catch (e) {
                    console.error('Error loading settings', e)
                }
            }
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen) {
            const settings = {
                positions,
                theme,
                imageScale,
                plusScale,
                rotations,
                shadows,
                logoScale,
                showLogo,
                showPlus,
                showPrice,
                showWhatsapp,
                whatsappScale,
                bgImage,
                bgOpacity,
                whatsappNumber: editableTexts.whatsapp,
                layerOrder
            }
            localStorage.setItem('riwaya_pack_editor_settings', JSON.stringify(settings))
        }
    }, [positions, theme, imageScale, plusScale, rotations, shadows, logoScale, showLogo, showPlus, showPrice, showWhatsapp, whatsappScale, editableTexts.whatsapp, isOpen])

    useEffect(() => {
        if (isOpen && pack?.books) {
            setLayerOrder(pack.books.map(b => b.id))
            const description = pack.description || `${pack.books.length} Livres exceptionnels`
            setEditableTexts(prev => ({
                ...prev,
                name: pack.name,
                description: description,
                price: pack.price.toString(),
                oldPrice: Math.round(pack.price * 1.3).toString()
            }))

            // Fetch site settings for WhatsApp phone number
            fetch('/api/admin/settings')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.settings?.contact_phone) {
                        setEditableTexts(prev => {
                            const saved = localStorage.getItem('riwaya_pack_editor_settings')
                            const hasSavedWhatsapp = saved && JSON.parse(saved).whatsappNumber
                            if (!hasSavedWhatsapp && !pack?.whatsappNumber) {
                                return { ...prev, whatsapp: data.settings.contact_phone }
                            }
                            return prev
                        })
                    }
                })
                .catch(console.error)

            const titles = pack.books.map(b => `• ${b.title}`).join('\n')
            const packUrl = pack.id ? `https://riwaya.store/fr/packs/${pack.id}` : 'https://riwaya.store/fr/packs'

            setCaption(
                `🎁 ${pack.name}\n\n` +
                `${description}\n\n` +
                `Livres inclus :\n${titles}\n\n` +
                `💰 ${pack.price} MAD\n\n` +
                `اطلب الآن 🛒 ${packUrl}\n\n` +
                `#riwaya #livres #packs #maroc #lecture #livresaddict #casablanca #rabat #booktokmaroc #culturemaroc #bibliophile #offre_speciale`
            )
        }
    }, [isOpen, pack?.name, pack?.books?.length, pack?.price, pack?.description, pack?.id])

    if (!isOpen || !pack) return null

    // Convertit une URL image en base64 via canvas pour contourner CORS
    const toBase64 = async (url: string): Promise<string> => {
        try {
            if (url.startsWith('data:')) return url;
            
            // Si c'est une URL externe, on passe par notre proxy pour éviter CORS
            let targetUrl = url;
            if (url.startsWith('http') && !url.includes(window.location.host)) {
                targetUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`;
            }

            const res = await fetch(targetUrl);
            if (!res.ok) throw new Error('Fetch failed');
            const blob = await res.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.error("Base64 conversion error:", err);
            return url;
        }
    }

    // Remplace les src des images du poster par leur équivalent base64
    const patchImagesBase64 = async (node: HTMLDivElement) => {
        const imgs = node.querySelectorAll('img')
        const originals: { el: HTMLImageElement, src: string }[] = []
        await Promise.all(Array.from(imgs).map(async (img) => {
            const original = img.src
            originals.push({ el: img, src: original })
            const b64 = await toBase64(original)
            img.src = b64
        }))
        return originals
    }

    const restoreImages = (originals: { el: HTMLImageElement, src: string }[]) => {
        originals.forEach(({ el, src }) => { el.src = src })
    }

    const handleDownload = async () => {
        if (!posterRef.current) return
        let originals: { el: HTMLImageElement, src: string }[] = []
        try {
            setIsGenerating(true)
            originals = await patchImagesBase64(posterRef.current)
            await new Promise(resolve => setTimeout(resolve, 800))

            let dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#000000'
            })

            restoreImages(originals)

            try {
                const keywords = ['Riwaya', 'Pack', pack.name, ...pack.books.map(b => b.title), ...pack.books.map(b => b.author)]
                dataUrl = injectXMPToPNG(dataUrl, pack.name, keywords.filter(Boolean))
            } catch (err) {
                console.error("XMP injection failed:", err)
            }

            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `pack_${pack.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            restoreImages(originals)
            console.error('Erreur lors de la génération:', error)
            alert('Une erreur est survenue lors de la création de l\'image.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePreview = async () => {
        if (!posterRef.current || !pack) return
        let originals: { el: HTMLImageElement, src: string }[] = []
        try {
            setIsGenerating(true)
            originals = await patchImagesBase64(posterRef.current)
            await new Promise(resolve => setTimeout(resolve, 800))

            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: currentTheme.bg.includes('gradient') ? undefined : '#000000',
                cacheBust: true,
            })
            restoreImages(originals)

            const baseUrl = window.location.origin
            const productUrl = `${baseUrl}/fr/packs`
            const text = caption || `${editableTexts.name}\n${editableTexts.description}`
            const tags = `#riwaya #pack #lecture #maroc #culture #promo`

            const newWindow = window.open()
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>Aperçu Publication Pack - ${pack.name}</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <style>
                                body { margin: 0; background: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; padding: 20px; }
                                .post-container { background: white; width: 100%; max-width: 500px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); overflow: hidden; }
                                .post-header { padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
                                .avatar { width: 40px; height: 40px; background: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
                                .author-info { flex: 1; }
                                .author-name { font-weight: 600; font-size: 15px; color: #050505; }
                                .post-time { font-size: 13px; color: #65676b; }
                                .post-text { padding: 4px 16px 12px; font-size: 15px; line-height: 1.4; color: #050505; white-space: pre-wrap; }
                                .post-image { width: 100%; display: block; border-top: 1px solid #ebedf0; border-bottom: 1px solid #ebedf0; }
                                .post-tags { padding: 8px 16px; color: #1877f2; font-size: 15px; }
                                .post-link { padding: 12px 16px; background: #f0f2f5; font-size: 13px; color: #65676b; border-top: 1px solid #ebedf0; }
                                .post-link a { color: #1877f2; text-decoration: none; font-weight: 600; }
                                .post-actions { padding: 4px 12px; border-top: 1px solid #ebedf0; display: flex; gap: 20px; }
                                .action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px; color: #65676b; font-weight: 600; font-size: 14px; border-radius: 4px; }
                                .preview-label { text-align: center; color: #65676b; font-size: 12px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
                            </style>
                        </head>
                        <body>
                            <div style="width: 100%; max-width: 500px;">
                                <div class="preview-label">Aperçu de la publication sociale (Pack)</div>
                                <div class="post-container">
                                    <div class="post-header">
                                        <div class="avatar">R</div>
                                        <div class="author-info">
                                            <div class="author-name">Riwaya</div>
                                            <div class="post-time">À l'instant • 🌐</div>
                                        </div>
                                    </div>
                                    <div class="post-text">${text}</div>
                                    <div style="position: relative;">
                                        <img class="post-image" src="${dataUrl}" />
                                    </div>
                                    <div class="post-tags">${tags}</div>
                                    <div class="post-link">
                                        🛍️ Voir les packs ici : <a href="${productUrl}" target="_blank">${productUrl}</a>
                                    </div>
                                    <div class="post-actions">
                                        <div class="action">👍 J'aime</div>
                                        <div class="action">💬 Commenter</div>
                                        <div class="action">↪️ Partager</div>
                                    </div>
                                </div>
                            </div>
                        </body>
                    </html>
                `)
            }
        } catch (error: any) {
            restoreImages(originals)
            alert(error instanceof Error ? error.message : "Erreur lors de l'aperçu")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleQuickPublish = async () => {
        if (!pack || !posterRef.current) return alert('Erreur: Pack ou référence poster manquante')
        setIsPublishing(true)
        let originals: { el: HTMLImageElement, src: string }[] = []
        try {
            // 1. Préparer l'image
            originals = await patchImagesBase64(posterRef.current)
            await new Promise(resolve => setTimeout(resolve, 800))
            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                cacheBust: true,
            })
            restoreImages(originals)

            // 2. Convertir en File
            const arr = dataUrl.split(',')
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) u8arr[n] = bstr.charCodeAt(n)
            const blob = new Blob([u8arr], { type: mime })
            const file = new File([blob], `pack_publish_${Date.now()}.png`, { type: mime })

            // 3. Upload
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const uploadData = await uploadRes.json()
            if (!uploadData.success) throw new Error(uploadData.error || "Échec de l'upload")

            // 4. Publish via n8n (on passe l'ID d'un des livres ou un flag pack)
            // Note: l'API publish actuelle attend bookId. On peut passer le premier livre du pack
            // ou adapter l'API si nécessaire. Pour l'instant on utilise le premier livre pour le contexte.
            const res = await fetch('/api/n8n/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packId: pack.id,
                    platform: platform === 'all' ? 'both' : platform,
                    customImageUrl: uploadData.url,
                    isPack: true,
                    packName: pack.name,
                    price: pack.price,
                    books: pack.books.map(b => b.title),
                    scheduleAt: scheduleAt || null,
                    customCaption: caption || `${editableTexts.name}\n${editableTexts.description}`
                })
            })
            const data = await res.json()
            if (data.success) alert(scheduleAt ? `📅 Publication programmée pour le ${new Date(scheduleAt).toLocaleString()}` : '✅ Pack envoyé à n8n pour publication immédiate')
            else alert(`❌ Erreur: ${data.message || data.error}`)
        } catch (error: any) {
            restoreImages(originals)
            console.error('Erreur publication pack:', error)
            alert(`❌ Erreur technique: ${error.message || 'Inconnue'}`)
        } finally {
            setIsPublishing(false)
        }
    }

    const handleShare = async (platform: 'facebook' | 'instagram') => {
        if (!posterRef.current || !pack) return
        let originals: { el: HTMLImageElement, src: string }[] = []
        try {
            setIsGenerating(true)
            originals = await patchImagesBase64(posterRef.current)
            await new Promise(resolve => setTimeout(resolve, 800))

            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#000000'
            })
            restoreImages(originals)

            // Safely convert dataUrl to Blob
            const arr = dataUrl.split(',')
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            const blob = new Blob([u8arr], { type: mime })
            const file = new File([blob], `pack_${pack.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`, { type: mime })

            // Try Web Share API first (Native sharing on Mobile / macOS)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: pack.name,
                    text: `Découvrez notre nouveau pack : ${pack.name} !`
                })
                return
            }

            // Fallback for Desktop: Copy to clipboard
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ])
                alert(`L'image a été copiée dans votre presse-papiers ! Vous allez être redirigé vers ${platform === 'facebook' ? 'Facebook' : 'Instagram'}. Il vous suffira de faire "Coller" (Ctrl+V) pour la publier.`)
            } catch (clipboardError) {
                console.warn('Clipboard write failed', clipboardError)
                alert(`Impossible de copier l'image automatiquement. L'API de partage n'est pas supportée par votre navigateur actuel.`)
                return
            }

            // Open social media for pasting
            if (platform === 'facebook') window.open('https://www.facebook.com', '_blank')
            if (platform === 'instagram') window.open('https://www.instagram.com', '_blank')

        } catch (err) {
            restoreImages(originals)
            console.error('Erreur technique lors du partage:', err)
            alert('Une erreur est survenue lors de la création de l\'image.')
        } finally {
            setIsGenerating(false)
        }
    }

    const themes = {
        dark: {
            bg: 'bg-gradient-to-br from-gray-900 via-slate-800 to-black',
            text: 'text-white',
            accent: 'text-amber-400',
            cardBg: 'bg-black/40',
            border: 'border-gray-600'
        },
        light: {
            bg: 'bg-gradient-to-br from-stone-50 via-gray-100 to-stone-200',
            text: 'text-gray-900',
            accent: 'text-blue-600',
            cardBg: 'bg-white/90',
            border: 'border-gray-300'
        },
        orange: {
            bg: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
            text: 'text-white',
            accent: 'text-yellow-200',
            cardBg: 'bg-black/30',
            border: 'border-orange-300'
        },
        magenta: {
            bg: 'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600',
            text: 'text-white',
            accent: 'text-pink-100',
            cardBg: 'bg-white/30',
            border: 'border-pink-300'
        },
        emerald: {
            bg: 'bg-gradient-to-br from-teal-400 via-emerald-500 to-green-700',
            text: 'text-white',
            accent: 'text-green-100',
            cardBg: 'bg-black/30',
            border: 'border-green-300'
        },
        gold: {
            bg: 'bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500',
            text: 'text-slate-900',
            accent: 'text-slate-800',
            cardBg: 'bg-white/80',
            border: 'border-amber-300'
        },
        purple: {
            bg: 'bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900',
            text: 'text-white',
            accent: 'text-violet-200',
            cardBg: 'bg-black/30',
            border: 'border-violet-400'
        }
    }

    const currentTheme = themes[theme]

    // Dispositions de livres prédéfinies
    const LAYOUTS = [
        { name: '\u00c9ventail', icon: '\uD83C\uDFB4' },
        { name: 'Rangée', icon: '\u2261' },
        { name: 'Grille', icon: '\u22ef' },
        { name: 'Cascade', icon: '\u2198' },
        { name: 'Pile', icon: '\u25A3' },
    ]

    const applyLayout = (layoutIdx: number) => {
        if (!pack?.books?.length) return
        const books = pack.books
        const n = books.length
        const newPositions: Record<string, { x: number; y: number }> = {}
        const newRotations: Record<string, number> = {}

        books.forEach((book, i) => {
            const key = `book_${book.id}`
            let x = 0, y = 0, rot = 0

            if (layoutIdx === 0) {
                // Éventail : léger chevauchement avec rotation
                x = (i - (n - 1) / 2) * 30
                y = Math.abs(i - (n - 1) / 2) * 10 - 10
                rot = (i - (n - 1) / 2) * 8
            } else if (layoutIdx === 1) {
                // Rangée horizontale
                const spacing = Math.min(100, 300 / n)
                x = (i - (n - 1) / 2) * spacing
                y = 0
                rot = (i % 2 === 0 ? 3 : -3)
            } else if (layoutIdx === 2) {
                // Grille
                const cols = Math.ceil(Math.sqrt(n))
                const col = i % cols
                const row = Math.floor(i / cols)
                const rows = Math.ceil(n / cols)
                x = (col - (cols - 1) / 2) * 110
                y = (row - (rows - 1) / 2) * 150
                rot = 0
            } else if (layoutIdx === 3) {
                // Cascade diagonale
                x = (i - (n - 1) / 2) * 25
                y = (i - (n - 1) / 2) * 25
                rot = -5 + i * 2
            } else if (layoutIdx === 4) {
                // Pile centrée
                x = (Math.random() - 0.5) * 20
                y = (Math.random() - 0.5) * 20
                rot = (Math.random() - 0.5) * 30
            }

            newPositions[key] = { x, y }
            newRotations[book.id] = rot

            // Appliquer DOM directement
            positionsRef.current[key] = { x, y }
            const el = dragElemsRef.current[key]
            if (el) {
                el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                el.style.transform = `translate(${x}px, ${y}px) scale(${imageScale}) rotate(${rot}deg)`
                setTimeout(() => { if (el) el.style.transition = '' }, 500)
            }
        })

        setPositions(prev => ({ ...prev, ...newPositions }))
        setRotations(newRotations)
        setCurrentLayout(layoutIdx)
    }

    const handleGenerateName = async (lang: 'fr' | 'ar') => {
        if (!pack?.books?.length) return;
        const setGenerating = lang === 'fr' ? setIsGeneratingNameFR : setIsGeneratingNameAR;
        setGenerating(true);

        try {
            const titles = pack.books.map(b => b.title).join(', ');
            const authors = Array.from(new Set(pack.books.map(b => b.author))).filter(Boolean).join(', ');

            const prompt = lang === 'fr'
                ? `Propose un nom très court et accrocheur (2 à 4 mots maximum) pour un pack de livres qui contient: ${titles}. Auteurs: ${authors}. Ne donne que le nom, pas de guillemets, pas de point.`
                : `اقترح اسماً قصيراً جداً وجذاباً (من كلمتين إلى 4 كلمات كحد أقصى) لمجموعة كتب تحتوي على: ${titles}. المؤلفون: ${authors}. أعطني الاسم فقط دون أي مقدمات أو علامات تنصيص.`;

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (data.text) handleTextChange('name', data.text.replace(/["'*]/g, '').trim());
        } catch (err) {
            console.error(err);
        }
        setGenerating(false);
    }

    const handleGenerateDesc = async (lang: 'fr' | 'ar') => {
        if (!pack?.books?.length) return;
        const setGenerating = lang === 'fr' ? setIsGeneratingDescFR : setIsGeneratingDescAR;
        setGenerating(true);

        try {
            const titles = pack.books.map(b => b.title).join(', ');
            const prompt = lang === 'fr'
                ? `Rédige une phrase très courte et ultra-accrocheuse (maximum 8 à 12 mots) pour faire la promotion d'un pack de livres contenant: ${titles}. N'utilise pas d'emojis, ne mets pas de guillemets, et donne juste la phrase.`
                : `اكتب جملة قصيرة جداً وجذابة (من 8 إلى 12 كلمة كحد أقصى) للترويج لـمجموعة من هذه الكتب: ${titles}. لا تستخدم إيموجي ولا علامات تنصيص وأعطني الجملة فقط.`;

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (data.text) handleTextChange('description', data.text.replace(/["'*]/g, '').trim());
        } catch (err) {
            console.error(err);
        }
        setGenerating(false);
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black backdrop-blur-md">
            <div className="bg-white w-full h-full flex flex-col md:flex-row overflow-hidden shadow-2xl">

                {/* Preview Area */}
                <div className="flex-1 bg-[#1a1c1e] flex flex-col items-center justify-start overflow-auto min-h-[400px]">
                    {/* Barre de layouts */}
                    <div className="flex items-center gap-2 py-3 px-4 w-full justify-center border-b border-white/5">
                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mr-2">Disposition</span>
                        {LAYOUTS.map((l, idx) => (
                            <button
                                key={idx}
                                onClick={() => applyLayout(idx)}
                                title={l.name}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentLayout === idx
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                {l.name}
                            </button>
                        ))}
                    </div>
                    {/* Poster */}
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-12 w-full">
                        <div
                            ref={posterRef}
                            className={`relative shrink-0 ${format === 'story' ? 'w-[360px] h-[640px]' : 'w-[500px] h-[500px]'} ${bgImage ? '' : currentTheme.bg} overflow-hidden flex flex-col p-8 transition-all duration-300`}
                            style={{ 
                                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                            }}
                            onClick={(e) => {
                                // Clic sur le fond = désélectionner tout
                                if (e.target === e.currentTarget) setSelectedKeys(new Set())
                            }}
                        >
                            {/* Custom Background Image Layer */}
                            {bgImage && (
                                <div 
                                    className={`absolute inset-0 z-0 cursor-move ${dragging === 'bg' ? '' : 'transition-transform'}`}
                                    style={{ 
                                        backgroundImage: `url(${bgImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        opacity: bgOpacity,
                                        transform: `translate(${positions.bg?.x || 0}px, ${positions.bg?.y || 0}px) scale(1.1)`, // Un léger scale pour éviter les bords blancs lors du drag
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'bg')}
                                    onTouchStart={(e) => handleTouchStart(e, 'bg')}
                                />
                            )}
                            {/* Decorative elements (Hidden if bgImage exists) */}
                            {!bgImage && (
                                <>
                                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                                    <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-black/20 blur-3xl pointer-events-none"></div>
                                </>
                            )}

                            {/* Top Bar Wrapper */}
                            <div className="flex justify-between items-start z-10 mb-8 select-none">
                                <div
                                    ref={el => { dragElemsRef.current['badge'] = el }}
                                    className={`${currentTheme.cardBg} px-4 py-1.5 rounded-full ${currentTheme.border} border backdrop-blur-md cursor-move`}
                                    style={{
                                        transform: `translate(${positionsRef.current.badge?.x || 0}px, ${positionsRef.current.badge?.y || 0}px)`,
                                        outline: selectedKeys.has('badge') ? '2px solid #3b82f6' : 'none',
                                        outlineOffset: '3px',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'badge')}
                                    onTouchStart={(e) => handleTouchStart(e, 'badge')}
                                >
                                    <p
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleTextChange('badge', e.currentTarget.textContent || '')}
                                        className={`text-[10px] font-black tracking-[0.2em] uppercase ${currentTheme.text} opacity-90 outline-none focus:ring-1 focus:ring-amber-400 rounded px-1`}
                                    >
                                        {editableTexts.badge}
                                    </p>
                                </div>
                                {showLogo && (
                                    <div
                                        ref={el => { dragElemsRef.current['logo'] = el }}
                                        className="flex flex-col items-end gap-1 cursor-move"
                                        style={{
                                            transform: `translate(${positionsRef.current.logo?.x || 0}px, ${positionsRef.current.logo?.y || 0}px)`,
                                            outline: selectedKeys.has('logo') ? '2px solid #3b82f6' : 'none',
                                            outlineOffset: '4px',
                                            touchAction: 'none'
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'logo')}
                                        onTouchStart={(e) => handleTouchStart(e, 'logo')}
                                    >
                                        <div
                                            className="opacity-90"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src="/logo.png"
                                                alt="Riwaya Logo"
                                                crossOrigin="anonymous"
                                                className="h-6 sm:h-8 object-contain filter brightness-0 invert transition-transform"
                                                style={{ transform: `scale(${logoScale})` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {showFreeDelivery && (
                                    <div
                                        ref={el => { dragElemsRef.current['delivery'] = el }}
                                        className="flex flex-col items-center select-none cursor-move"
                                        style={{
                                            transform: `translate(${positionsRef.current.delivery?.x || 0}px, ${positionsRef.current.delivery?.y || 0}px)`,
                                            outline: selectedKeys.has('delivery') ? '2px solid #3b82f6' : 'none',
                                            outlineOffset: '4px',
                                            touchAction: 'none'
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMouseDown(e, 'delivery');
                                        }}
                                        onTouchStart={(e) => {
                                            e.stopPropagation();
                                            handleTouchStart(e, 'delivery');
                                        }}
                                    >
                                        <span className="text-5xl mb-1 filter drop-shadow-2xl">🚚</span>
                                        <div className="flex flex-col items-center leading-tight">
                                            <span
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => handleTextChange('delivery_line1', e.currentTarget.textContent || '')}
                                                className="text-[8px] font-black uppercase tracking-[0.3em] text-white/50 outline-none"
                                            >
                                                {editableTexts.delivery_line1}
                                            </span>
                                            <span
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => handleTextChange('delivery_line2', e.currentTarget.textContent || '')}
                                                className="text-xs font-black uppercase tracking-widest text-green-400 outline-none"
                                            >
                                                {editableTexts.delivery_line2}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Books Visualization (Stacked) */}
                            <div className="flex-1 flex items-center justify-center relative z-10 pointer-events-none mx-auto w-full">
                                {pack.books.map((book, idx) => {
                                    const pos = positions[`book_${book.id}`] || { x: 0, y: 0 }
                                    // Slight offset in rotation for initial stacked look
                                    const rot = rotations[book.id] !== undefined ? rotations[book.id] : (idx * 4 - (pack.books.length * 2))
                                    const hasShadow = shadows[book.id] !== false

                                    // Determine z-index dynamically based on layerOrder
                                    const layerIndex = layerOrder.indexOf(book.id)
                                    const zIndex = (layerIndex !== -1 ? layerIndex : idx) + (dragging === `book_${book.id}` ? 50 : 0)

                                    return (
                                        <div
                                            key={book.id}
                                            ref={el => { dragElemsRef.current[`book_${book.id}`] = el }}
                                            className="absolute pointer-events-auto cursor-move"
                                            style={{
                                                zIndex,
                                                transform: `translate(${positionsRef.current[`book_${book.id}`]?.x || 0}px, ${positionsRef.current[`book_${book.id}`]?.y || 0}px) scale(${imageScale}) rotate(${rot}deg)`,
                                                width: '140px',
                                                outline: selectedKeys.has(`book_${book.id}`) ? '2px solid #3b82f6' : 'none',
                                                outlineOffset: '3px',
                                                touchAction: 'none'
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, `book_${book.id}`)}
                                            onTouchStart={(e) => handleTouchStart(e, `book_${book.id}`)}
                                        >
                                            <img
                                                src={(() => {
                                                    const img = normalizeImage(book.image);
                                                    if (img && img.startsWith('http') && !img.includes(typeof window !== 'undefined' ? window.location.host : '')) {
                                                        return `/api/proxy/image?url=${encodeURIComponent(img)}`;
                                                    }
                                                    return img || '/book-placeholder.png';
                                                })()}
                                                alt={book.title}
                                                crossOrigin="anonymous"
                                                className="w-full h-auto object-cover rounded-md border border-white/10"
                                                style={{ boxShadow: hasShadow ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none' }}
                                            />
                                        </div>
                                    )
                                })}

                                {showPlus && (
                                    <div
                                        ref={el => { dragElemsRef.current['plus'] = el }}
                                        className="absolute cursor-move select-none z-[60] flex items-center justify-center pointer-events-auto"
                                        style={{
                                            transform: `translate(${positionsRef.current.plus?.x || 0}px, ${positionsRef.current.plus?.y || 0}px) scale(${plusScale})`,
                                            color: currentTheme.text.includes('white') ? '#fff' : '#000',
                                            touchAction: 'none'
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'plus')}
                                        onTouchStart={(e) => handleTouchStart(e, 'plus')}
                                    >
                                        <span className="text-7xl font-black drop-shadow-2xl">+</span>
                                    </div>
                                )}
                            </div>

                            {/* Titre du pack — drag + double-clic pour éditer */}
                            {showName && (
                                <div
                                    ref={el => { dragElemsRef.current['title'] = el }}
                                    className="absolute z-20 cursor-move select-none w-fit max-w-[300px]"
                                    style={{ bottom: '120px', left: '50%', transform: `translate(calc(-50% + ${positionsRef.current.title?.x || 0}px), ${positionsRef.current.title?.y || 0}px)`, touchAction: 'none' }}
                                >
                                    <h2
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => { handleTextChange('name', e.currentTarget.textContent || ''); setEditingKey(null) }}
                                        id="editable-title"
                                        dir="auto"
                                        className={`text-3xl font-black leading-tight whitespace-normal ${currentTheme.text} outline-none focus:ring-1 focus:ring-white/20 px-1 text-center max-w-[300px] w-fit break-words`}
                                        style={{
                                            textRendering: 'optimizeLegibility',
                                            WebkitFontSmoothing: 'antialiased'
                                        }}
                                    >
                                        {editableTexts.name}
                                    </h2>
                                    {/* Overlay transparent — drag sur clic simple, édition sur double-clic */}
                                    {editingKey !== 'title' && (
                                        <div
                                            className="absolute inset-0 cursor-move z-10"
                                            onMouseDown={(e) => handleMouseDown(e, 'title')}
                                            onTouchStart={(e) => handleTouchStart(e, 'title')}
                                            onDoubleClick={() => {
                                                setEditingKey('title')
                                                setTimeout(() => document.getElementById('editable-title')?.focus(), 50)
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Description — drag + double-clic pour éditer */}
                            {showDescription && (
                                <div
                                    ref={el => { dragElemsRef.current['description'] = el }}
                                    className="absolute z-20 cursor-move select-none w-fit max-w-[300px]"
                                    style={{ bottom: '95px', left: '50%', transform: `translate(calc(-50% + ${positionsRef.current.description?.x || 0}px), ${positionsRef.current.description?.y || 0}px)`, touchAction: 'none' }}
                                >
                                    <p
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => { handleTextChange('description', e.currentTarget.textContent || ''); setEditingKey(null) }}
                                        id="editable-description"
                                        dir="auto"
                                        className="text-white/60 text-xs font-bold uppercase italic outline-none focus:text-white whitespace-normal text-center max-w-[300px] w-fit break-words"
                                        style={{
                                            textRendering: 'optimizeLegibility',
                                            WebkitFontSmoothing: 'antialiased'
                                        }}
                                    >
                                        {editableTexts.description}
                                    </p>
                                    {editingKey !== 'description' && (
                                        <div
                                            className="absolute inset-0 cursor-move z-10"
                                            onMouseDown={(e) => handleMouseDown(e, 'description')}
                                            onTouchStart={(e) => handleTouchStart(e, 'description')}
                                            onDoubleClick={() => {
                                                setEditingKey('description')
                                                setTimeout(() => document.getElementById('editable-description')?.focus(), 50)
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Offre Limitée — drag + double-clic pour éditer */}
                            <div
                                ref={el => { dragElemsRef.current['limited'] = el }}
                                className="absolute z-20 cursor-move select-none"
                                style={{ bottom: '68px', left: '50%', transform: `translate(calc(-50% + ${positionsRef.current.limited?.x || 0}px), ${positionsRef.current.limited?.y || 0}px)`, touchAction: 'none' }}
                            >
                                <p
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => { handleTextChange('limited', e.currentTarget.textContent || ''); setEditingKey(null) }}
                                    id="editable-limited"
                                    className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 outline-none whitespace-nowrap text-center"
                                >
                                    {editableTexts.limited}
                                </p>
                                {editingKey !== 'limited' && (
                                    <div
                                        className="absolute inset-0 cursor-move z-10"
                                        onMouseDown={(e) => handleMouseDown(e, 'limited')}
                                        onTouchStart={(e) => handleTouchStart(e, 'limited')}
                                        onDoubleClick={() => {
                                            setEditingKey('limited')
                                            setTimeout(() => document.getElementById('editable-limited')?.focus(), 50)
                                        }}
                                    />
                                )}
                            </div>

                            {/* Prix — drag + double-clic pour éditer */}
                            {showPrice && (
                                <div
                                    ref={el => { dragElemsRef.current['price'] = el }}
                                    className="absolute z-20 cursor-move select-none flex items-center justify-center gap-3"
                                    style={{ bottom: '24px', left: '50%', transform: `translate(calc(-50% + ${positionsRef.current.price?.x || 0}px), ${positionsRef.current.price?.y || 0}px)`, touchAction: 'none' }}
                                >
                                    {showSolde && (
                                        <div className="text-red-500 font-bold text-3xl line-through drop-shadow-md flex items-baseline gap-1 mt-1">
                                            <span
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => { handleTextChange('oldPrice', e.currentTarget.textContent || ''); setEditingKey(null) }}
                                                id="editable-oldPrice"
                                                className="outline-none"
                                            >
                                                {editableTexts.oldPrice}
                                            </span>
                                            <span className="text-lg">MAD</span>
                                        </div>
                                    )}
                                    <div className={`${currentTheme.accent} font-black text-5xl tracking-tighter flex items-center gap-2`}>
                                        <span
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => { handleTextChange('price', e.currentTarget.textContent || ''); setEditingKey(null) }}
                                            id="editable-price"
                                            className="outline-none"
                                        >
                                            {editableTexts.price}
                                        </span>
                                        <span className="text-xl">MAD</span>
                                    </div>
                                    {editingKey !== 'price' && editingKey !== 'oldPrice' && (
                                        <div
                                            className="absolute inset-0 cursor-move z-10"
                                            onMouseDown={(e) => handleMouseDown(e, 'price')}
                                            onTouchStart={(e) => handleTouchStart(e, 'price')}
                                            onDoubleClick={() => {
                                                setEditingKey('price')
                                                setTimeout(() => document.getElementById('editable-price')?.focus(), 50)
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* WhatsApp — drag + double-clic pour éditer */}
                            {showWhatsapp && (
                                <div
                                    ref={el => { dragElemsRef.current['whatsapp'] = el }}
                                    className="absolute z-20 cursor-move select-none flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full shadow-lg"
                                    style={{ bottom: '20px', left: '50%', transform: `translate(calc(-50% + ${positionsRef.current.whatsapp?.x || 0}px), ${positionsRef.current.whatsapp?.y || 0}px) scale(${whatsappScale})`, touchAction: 'none' }}
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    <span
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => { handleTextChange('whatsapp', e.currentTarget.textContent || ''); setEditingKey(null) }}
                                        id="editable-whatsapp"
                                        className="text-sm font-black outline-none"
                                    >
                                        {editableTexts.whatsapp}
                                    </span>
                                    {editingKey !== 'whatsapp' && (
                                        <div
                                            className="absolute inset-0 cursor-move z-10"
                                            onMouseDown={(e) => handleMouseDown(e, 'whatsapp')}
                                            onTouchStart={(e) => handleTouchStart(e, 'whatsapp')}
                                            onDoubleClick={() => {
                                                setEditingKey('whatsapp')
                                                setTimeout(() => document.getElementById('editable-whatsapp')?.focus(), 50)
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Textes libres */}
                            {customTexts.map((ct) => {
                                const ctKey = `custom_${ct.id}`
                                return (
                                    <div
                                        key={ct.id}
                                        ref={el => { dragElemsRef.current[ctKey] = el }}
                                        className="absolute z-20 cursor-move select-none"
                                        style={{
                                            top: '50%', left: '50%',
                                            transform: `translate(calc(-50% + ${positionsRef.current[ctKey]?.x || 0}px), calc(-50% + ${positionsRef.current[ctKey]?.y || 0}px))`,
                                            outline: selectedKeys.has(ctKey) ? '2px solid #3b82f6' : 'none',
                                            outlineOffset: '3px',
                                            touchAction: 'none'
                                        }}
                                    >
                                        <p
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const newText = e.currentTarget.textContent || ''
                                                setCustomTexts(prev => prev.map(t => t.id === ct.id ? { ...t, text: newText } : t))
                                                setEditingKey(null)
                                            }}
                                            id={`editable-${ctKey}`}
                                            className="outline-none whitespace-nowrap font-bold"
                                            style={{ fontSize: `${ct.size}px`, color: ct.color }}
                                        >
                                            {ct.text}
                                        </p>
                                        {editingKey !== ctKey && (
                                            <div
                                                className="absolute inset-0 cursor-move z-10"
                                                onMouseDown={(e) => handleMouseDown(e, ctKey)}
                                                onTouchStart={(e) => handleTouchStart(e, ctKey)}
                                                onDoubleClick={() => {
                                                    setEditingKey(ctKey)
                                                    setTimeout(() => document.getElementById(`editable-${ctKey}`)?.focus(), 50)
                                                }}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Controls Area */}
                <div className="w-full md:w-[400px] bg-white p-8 flex flex-col relative shrink-0">
                    <button
                        onClick={() => {
                            // Sauvegarder les positions depuis positionsRef (source de vérité DOM)
                            const finalPositions = { ...positionsRef.current }
                            const settings = {
                                positions: finalPositions,
                                theme, imageScale, plusScale, rotations, shadows,
                                logoScale, showLogo, showPlus, showPrice, layerOrder, customTexts
                            }
                            localStorage.setItem('riwaya_pack_editor_settings', JSON.stringify(settings))
                            onClose()
                        }}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h3 className="text-xl font-black text-black mb-2 mt-2 flex items-center gap-3">
                        <ImageIcon className="w-6 h-6 text-indigo-600" />
                        Générateur de Pack
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Personnalisez et téléchargez</p>

                    <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">

                        {/* Textes et Génération IA */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block ml-1">
                                Textes & Copywriting
                            </label>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Nom du pack</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleGenerateName('fr')}
                                                disabled={isGeneratingNameFR}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                            >
                                                {isGeneratingNameFR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} FR
                                            </button>

                                            {/* Arabic Button for Name */}
                                            <button
                                                onClick={() => handleGenerateName('ar')}
                                                disabled={isGeneratingNameAR}
                                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                            >
                                                {isGeneratingNameAR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AR
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={editableTexts.name}
                                        onChange={(e) => handleTextChange('name', e.target.value)}
                                        className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Ex: Pack Succès"
                                        dir="auto"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Description</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleGenerateDesc('fr')}
                                                disabled={isGeneratingDescFR}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                            >
                                                {isGeneratingDescFR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} FR
                                            </button>

                                            {/* Arabic Button for Description */}
                                            <button
                                                onClick={() => handleGenerateDesc('ar')}
                                                disabled={isGeneratingDescAR}
                                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                            >
                                                {isGeneratingDescAR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AR
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={editableTexts.description}
                                        onChange={(e) => handleTextChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                        placeholder="Description accrocheuse..."
                                        dir="auto"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block ml-1">
                                Style visuel
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(themes).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t as any)}
                                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all group ${theme === t ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`w-full h-12 rounded-xl mb-3 ${themes[t as keyof typeof themes].bg}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${theme === t ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                            {t}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background Image Upload */}
                        <div className="pt-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block ml-1">
                                Image de Fond (Personnalisée)
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onload = (ev) => setBgImage(ev.target?.result as string)
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                    <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 group-hover:text-indigo-600">
                                        {bgImage ? 'Changer le fond' : 'Uploader un fond'}
                                    </span>
                                </label>
                                {bgImage && (
                                    <>
                                        <div className="pt-2">
                                            <label className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                                <span>Opacité du fond</span>
                                                <span>{Math.round(bgOpacity * 100)}%</span>
                                            </label>
                                            <input 
                                                type="range" 
                                                min="0" max="1" step="0.05" 
                                                value={bgOpacity}
                                                onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => setBgImage(null)}
                                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition"
                                        >
                                            Réinitialiser (Thème)
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Taille des images
                            </label>
                            <input
                                type="range"
                                min="0.5" max="2" step="0.05"
                                value={imageScale}
                                onChange={(e) => setImageScale(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Options Avancées Section Header */}
                        <div className="py-4 px-8 bg-gray-50 border-y border-gray-100 -mx-8">
                            <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Options avancées
                            </h4>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                {pack.books.map((book, idx) => {
                                    const hasShadow = shadows[book.id] !== false
                                    return (
                                        <div key={book.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2">
                                                <span className="truncate max-w-[200px]">{book.title}</span>
                                                <span>{rotations[book.id] !== undefined ? rotations[book.id] : (idx % 2 === 0 ? -2 : 2)}°</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-180" max="180" step="1"
                                                value={rotations[book.id] !== undefined ? rotations[book.id] : (idx % 2 === 0 ? -2 : 2)}
                                                onChange={(e) => setRotations(prev => ({ ...prev, [book.id]: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-3"
                                            />
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasShadow}
                                                    onChange={(e) => setShadows(prev => ({ ...prev, [book.id]: e.target.checked }))}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <span className="text-[11px] font-medium text-gray-700">Afficher l'ombre</span>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Taille du logo
                            </label>
                            <input
                                type="range"
                                min="0.5" max="3" step="0.1"
                                value={logoScale}
                                onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                                disabled={!showLogo}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showLogo}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowLogo(checked)
                                        if (checked) {
                                            positionsRef.current['logo'] = { x: 0, y: 0 }
                                            if (dragElemsRef.current['logo']) dragElemsRef.current['logo']!.style.transform = 'translate(0px, 0px)'
                                            setPositions(prev => ({ ...prev, logo: { x: 0, y: 0 } }))
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Afficher le Logo</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showFreeDelivery}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowFreeDelivery(checked)
                                        if (checked) {
                                            positionsRef.current['delivery'] = { x: 0, y: 0 }
                                            if (dragElemsRef.current['delivery']) dragElemsRef.current['delivery']!.style.transform = 'translate(0px, 0px)'
                                            setPositions(prev => ({ ...prev, delivery: { x: 0, y: 0 } }))
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Livraison gratuite</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showName}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowName(checked)
                                        if (checked) {
                                            positionsRef.current['title'] = { x: 0, y: 0 }
                                            if (dragElemsRef.current['title']) dragElemsRef.current['title']!.style.transform = 'translate(calc(-50% + 0px), 0px)'
                                            setPositions(prev => ({ ...prev, title: { x: 0, y: 0 } }))
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Nom du pack</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showDescription}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowDescription(checked)
                                        if (checked) {
                                            positionsRef.current['description'] = { x: 0, y: 0 }
                                            if (dragElemsRef.current['description']) dragElemsRef.current['description']!.style.transform = 'translate(calc(-50% + 0px), 0px)'
                                            setPositions(prev => ({ ...prev, description: { x: 0, y: 0 } }))
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Description</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showPrice}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowPrice(checked)
                                        if (checked) {
                                            positionsRef.current['price'] = { x: 0, y: 0 }
                                            if (dragElemsRef.current['price']) dragElemsRef.current['price']!.style.transform = 'translate(calc(-50% + 0px), 0px)'
                                            setPositions(prev => ({ ...prev, price: { x: 0, y: 0 } }))
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Afficher le prix</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showSolde}
                                    onChange={(e) => setShowSolde(e.target.checked)}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Prix de Solde (Barré)</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showPlus}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowPlus(checked)
                                        if (checked) {
                                            positionsRef.current['plus'] = { x: 0, y: 0 }
                                            if (dragElemsRef.current['plus']) dragElemsRef.current['plus']!.style.transform = 'translate(0px, 0px)'
                                            setPositions(prev => ({ ...prev, plus: { x: 0, y: 0 } }))
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Symbole "+" (Promo)</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    checked={showWhatsapp}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowWhatsapp(checked)
                                        if (checked) {
                                            positionsRef.current['whatsapp'] = { x: 0, y: 0 }
                                            if (dragElemsRef.current['whatsapp']) dragElemsRef.current['whatsapp']!.style.transform = 'translate(calc(-50% + 0px), 0px)'
                                            setPositions(prev => ({ ...prev, whatsapp: { x: 0, y: 0 } }))
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Afficher WhatsApp</span>
                            </label>

                            {showWhatsapp && (
                                <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Numéro WhatsApp</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={editableTexts.whatsapp}
                                                onChange={(e) => handleTextChange('whatsapp', e.target.value)}
                                                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                placeholder="+212 6..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Taille</label>
                                        <input
                                            type="range"
                                            min="0.5" max="2" step="0.05"
                                            value={whatsappScale}
                                            onChange={(e) => setWhatsappScale(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                </div>
                            )}

                            {showPlus && (
                                <div className="px-1 -mt-1 mb-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Taille du +</label>
                                    <input
                                        type="range"
                                        min="0.5" max="3" step="0.1"
                                        value={plusScale}
                                        onChange={(e) => setPlusScale(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Textes libres */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Textes libres
                                </label>
                                <button
                                    onClick={() => {
                                        const id = `txt_${Date.now()}`
                                        setCustomTexts(prev => [...prev, { id, text: 'Nouveau texte', size: 20, color: '#ffffff' }])
                                        // Position initiale au centre
                                        positionsRef.current[`custom_${id}`] = { x: 0, y: 0 }
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                                >
                                    + Ajouter
                                </button>
                            </div>
                            <div className="space-y-3">
                                {customTexts.map((ct) => (
                                    <div key={ct.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-700 truncate max-w-[140px]">{ct.text}</span>
                                            <button
                                                onClick={() => {
                                                    setCustomTexts(prev => prev.filter(t => t.id !== ct.id))
                                                    delete dragElemsRef.current[`custom_${ct.id}`]
                                                    delete positionsRef.current[`custom_${ct.id}`]
                                                }}
                                                className="text-red-400 hover:text-red-600 text-xs font-black px-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <label className="text-[9px] text-gray-400 font-bold uppercase">Taille</label>
                                                <input
                                                    type="range" min="10" max="80" step="1"
                                                    value={ct.size}
                                                    onChange={(e) => setCustomTexts(prev => prev.map(t => t.id === ct.id ? { ...t, size: parseInt(e.target.value) } : t))}
                                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-gray-400 font-bold uppercase">Couleur</label>
                                                <input
                                                    type="color"
                                                    value={ct.color}
                                                    onChange={(e) => setCustomTexts(prev => prev.map(t => t.id === ct.id ? { ...t, color: e.target.value } : t))}
                                                    className="w-8 h-7 rounded cursor-pointer border border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {customTexts.length === 0 && (
                                    <p className="text-[10px] text-gray-400 text-center py-2">Aucun texte. Cliquez sur "+ Ajouter"</p>
                                )}
                            </div>
                        </div>

                        <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                            <div className="flex items-center gap-3 mb-2 text-indigo-700">
                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white">i</div>
                                <span className="text-[11px] font-black uppercase tracking-widest">Astuce</span>
                            </div>
                            <p className="text-[11px] font-bold text-indigo-700 leading-relaxed">
                                🖱️ Vous pouvez **glisser-déposer** les éléments et **cliquer sur les textes** pour les modifier directement !
                            </p>
                        </div>


                        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating || isPublishing}
                                    className="flex items-center justify-center gap-3 px-6 py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    Télécharger
                                </button>
                                <button
                                    onClick={handlePreview}
                                    disabled={isGenerating || isPublishing}
                                    className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    Visualiser
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!posterRef.current || !pack) return
                                        let originals: { el: HTMLImageElement, src: string }[] = []
                                        try {
                                            setIsGenerating(true)
                                            originals = await patchImagesBase64(posterRef.current)
                                            await new Promise(resolve => setTimeout(resolve, 800))
                                            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                                                quality: 1,
                                                pixelRatio: 2,
                                                backgroundColor: currentTheme.bg.includes('gradient') ? undefined : '#000000',
                                                cacheBust: true,
                                            })
                                            restoreImages(originals)

                                            const arr = dataUrl.split(',')
                                            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
                                            const bstr = atob(arr[1])
                                            let n = bstr.length
                                            const u8arr = new Uint8Array(n)
                                            while (n--) u8arr[n] = bstr.charCodeAt(n)
                                            const blob = new Blob([u8arr], { type: mime })
                                            const filename = `pack_${pack.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`
                                            const file = new File([blob], filename, { type: mime })

                                            const formData = new FormData()
                                            formData.append('file', file)
                                            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
                                            const uploadData = await uploadRes.json()

                                            if (uploadData.success) {
                                                const assetRes = await fetch('/api/admin/marketing/assets', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        name: uploadData.url.split('/').pop(),
                                                        url: uploadData.url,
                                                        type: 'PACK',
                                                        packId: pack.id
                                                    })
                                                })
                                                const assetData = await assetRes.json()
                                                if (assetData.success) {
                                                    alert('✅ Pack sauvegardé dans le hub marketing')
                                                } else {
                                                    throw new Error(assetData.error || 'Erreur lors de l\'enregistrement en base')
                                                }
                                            } else {
                                                throw new Error(uploadData.error || 'Échec de l\'upload')
                                            }
                                        } catch (error: any) {
                                            if (originals.length) restoreImages(originals)
                                            console.error('Save error:', error)
                                            alert(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`)
                                        } finally {
                                            setIsGenerating(false)
                                        }
                                    }}
                                    disabled={isGenerating || isPublishing}
                                    className="col-span-2 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {isGenerating ? 'Génération...' : 'Sauvegarder dans Marketing'}
                                </button>
                            </div>
                        </div>

                        {/* Publication n8n Section Header */}
                        <div className="py-4 px-8 bg-blue-50 border-y border-blue-100 -mx-8">
                            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Send className="w-3.5 h-3.5" /> Publication n8n
                            </h4>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                    Plateforme
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { val: 'facebook', label: 'Facebook', Icon: Facebook, color: 'blue' },
                                        { val: 'instagram', label: 'Instagram', Icon: Instagram, color: 'pink' },
                                        { val: 'tiktok', label: 'TikTok', Icon: Music, color: 'black' },
                                        { val: 'all', label: 'Toutes', Icon: Send, color: 'indigo' },
                                    ] as const).map(({ val, label, Icon, color }) => {
                                        const getPlatformClass = (v: string, c: string) => {
                                            if (platform !== v) return 'border-gray-100 text-gray-500 hover:bg-gray-50'
                                            const colorClass = c === 'black' ? 'slate-900' : c + '-500'
                                            const bgClass = c === 'black' ? 'slate-900' : c + '-50'
                                            const textClass = c === 'black' ? 'white' : c + '-700'
                                            return `border-${colorClass} bg-${bgClass} text-${textClass} ring-1 ring-${colorClass}`
                                        }

                                        return (
                                            <button
                                                key={val}
                                                onClick={() => setPlatform(val)}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition ${getPlatformClass(val, color)}`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Caption Editor */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Texte du Post (Caption)
                                </label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    placeholder="Écrivez la légende du pack ici..."
                                />
                                <p className="text-[9px] text-gray-400 mt-1 italic ml-1">Ce texte sera utilisé pour la publication et l'aperçu.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Programmer (Optionnel)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduleAt}
                                    onChange={e => setScheduleAt(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={handleQuickPublish}
                                disabled={isGenerating || isPublishing}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-200 active:scale-95"
                            >
                                {isPublishing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                )}
                                {isPublishing ? 'Envoi...' : scheduleAt ? 'Programmer Publication' : 'Publier via n8n'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <button
                                onClick={() => handleShare('facebook')}
                                disabled={isGenerating || isPublishing}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white font-bold text-[10px] rounded-xl hover:bg-[#166FE5] transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Facebook className="w-3.5 h-3.5" />
                                Facebook
                            </button>
                            <button
                                onClick={() => handleShare('instagram')}
                                disabled={isGenerating || isPublishing}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white font-bold text-[10px] rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Instagram className="w-3.5 h-3.5" />
                                Instagram
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
