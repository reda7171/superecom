'use client'

import React, { useRef, useState, useEffect } from 'react'
import { X, Download, ImageIcon, Facebook, Instagram, Eye, Clock, Send, Music, Quote, Sparkles } from 'lucide-react'
import * as htmlToImage from 'html-to-image'
import { normalizeImage } from '@/lib/utils'

interface ProductDescriptionModalProps {
    isOpen: boolean
    onClose: () => void
    product: {
        id?: string
        title: string
        author: string
        description: string
        image: string
    } | null
    format?: 'post' | 'story'
}

export default function ProductDescriptionModal({ isOpen, onClose, product, format = 'post' }: ProductDescriptionModalProps) {
    const posterRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [theme, setTheme] = useState<'dark' | 'emerald' | 'gold' | 'purple'>('dark')
    const [bgImage, setBgImage] = useState<string | null>(null)
    const [bgOpacity, setBgOpacity] = useState(1)

    // Interactive States
    const [positions, setPositions] = useState({ product: { x: 0, y: 0 }, text: { x: 0, y: 0 }, bg: { x: 0, y: 0 } })
    const [dragging, setDragging] = useState<string | null>(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [imageScale, setImageScale] = useState(1.9)
    const [imageRotation, setImageRotation] = useState(51)
    const [imageOpacity, setImageOpacity] = useState(1)
    const [showCover, setShowCover] = useState(true)
    const [showShadow, setShowShadow] = useState(true)

    // Publication States
    const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok' | 'all'>('all')
    const [useDescription, setUseDescription] = useState<'short' | 'long'>('short')
    const [scheduleAt, setScheduleAt] = useState('')
    const [showPublishOptions, setShowPublishOptions] = useState(false)
    
    // Typography States
    const [fontSize, setFontSize] = useState(28)
    const [fontColor, setFontColor] = useState('#ffffff')
    const [fontFamily, setFontFamily] = useState('system-ui')
    
    const [editableTexts, setEditableTexts] = useState({
        title: product?.title || 'Titre',
        description: product?.description || 'Description...',
    })

    const handleTextChange = (key: string, value: string) => {
        setEditableTexts(prev => ({ ...prev, [key]: value }))
    }

    const handleMouseDown = (e: React.MouseEvent, key: string) => {
        if ((e.target as HTMLElement).isContentEditable || (e.target as HTMLElement).closest('[contenteditable="true"]')) return
        e.preventDefault()
        setDragging(key)
        const pos = positions[key as keyof typeof positions]
        setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y })
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging) return
            setPositions(prev => ({ ...prev, [dragging]: { x: e.clientX - offset.x, y: e.clientY - offset.y } }))
        }
        const handleMouseUp = () => setDragging(null)

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [dragging, offset])

    useEffect(() => {
        if (!isOpen) {
            setTheme('dark')
            setPositions({ product: { x: 0, y: 0 }, text: { x: 0, y: 0 }, bg: { x: 0, y: 0 } })
            setImageScale(1)
            setImageRotation(0)
            setShowCover(false)
            setShowShadow(true)
            setFontSize(28)
            setFontColor('#ffffff')
            setFontFamily('system-ui')
        } else if (product) {
            setEditableTexts({
                title: product.title,
                description: product.description || 'Une histoire captivante...'
            })
        }
    }, [isOpen, product])

    if (!isOpen || !product) return null

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
            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: 'transparent',
                cacheBust: true,
                skipFonts: false,
            })
            restoreImages(originals)
            const link = document.createElement('a')
            link.download = `description-${product.title.replace(/\s+/g, '-').toLowerCase()}-${format}.png`
            link.href = dataUrl
            link.click()
        } catch (error: any) {
            if (originals.length) restoreImages(originals)
            console.error('Erreur lors de la génération:', error)
            const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération de l\'image'
            alert(errorMsg)
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePreview = async () => {
        if (!posterRef.current) return
        let originals: { el: HTMLImageElement, src: string }[] = []
        try {
            setIsGenerating(true)
            originals = await patchImagesBase64(posterRef.current)
            await new Promise(resolve => setTimeout(resolve, 800))
            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: 'transparent',
                cacheBust: true,
                skipFonts: false,
            })
            restoreImages(originals)
            
            const newWindow = window.open()
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>Aperçu Description - SuperEcom</title>
                            <style>
                                body { margin: 0; display: flex; align-items: center; justify-content: center; background: #1a1a2e; min-height: 100vh; font-family: sans-serif; }
                                img { max-width: 90%; max-height: 90vh; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
                                .info { position: absolute; top: 20px; color: white; background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 99px; font-size: 12px; backdrop-blur: 5px; }
                            </style>
                        </head>
                        <body>
                            <div class="info">Aperçu Description (PNG 2x)</div>
                            <img src="${dataUrl}" />
                        </body>
                    </html>
                `)
            }
        } catch (error: any) {
            if (originals.length) restoreImages(originals)
            alert(error instanceof Error ? error.message : "Erreur lors de l'aperçu")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleQuickPublish = async () => {
        if (!product?.id || !posterRef.current) return alert('Erreur: ID du livre ou référence poster manquante')
        setIsPublishing(true)
        try {
            // 1. Capturer l'image de la description
            const originals = await patchImagesBase64(posterRef.current)
            await new Promise(resolve => setTimeout(resolve, 800))
            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: 'transparent',
                cacheBust: true,
            }).catch(err => {
                if (err instanceof Event) {
                    throw new Error("Une image n'a pas pu être chargée. La publication a échoué.")
                }
                throw err
            })
            restoreImages(originals)

            // 2. Convertir dataUrl en File pour l'upload
            const arr = dataUrl.split(',')
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            const blob = new Blob([u8arr], { type: mime })
            const file = new File([blob], `desc_publish_${product.id}.png`, { type: mime })

            // 3. Uploader l'image sur le serveur
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const uploadData = await uploadRes.json()
            
            if (!uploadData.success) {
                throw new Error(uploadData.error || "Échec de l'upload de la description")
            }

            // 4. Envoyer à n8n avec l'URL de la créative
            const res = await fetch('/api/n8n/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    format: format,
                    platform: platform === 'all' ? 'both' : platform,
                    useDescription: useDescription,
                    scheduleAt: scheduleAt || null,
                    customImageUrl: uploadData.url // Utiliser l'image qu'on vient d'uploader
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('✅ Description publiée avec succès sur FB et Instagram')
            } else {
                alert(`❌ Erreur: ${data.message || data.error}`)
            }
        } catch (error: any) {
            console.error('Erreur publication:', error)
            alert(`❌ Erreur technique: ${error.message || 'Inconnue'}`)
        } finally {
            setIsPublishing(false)
        }
    }


    const themes = {
        dark: {
            bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
            text: 'text-white',
            accent: 'text-gray-300'
        },
        emerald: {
            bg: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950',
            text: 'text-emerald-50',
            accent: 'text-emerald-200'
        },
        gold: {
            bg: 'bg-gradient-to-br from-amber-900 via-amber-800 to-orange-950',
            text: 'text-amber-50',
            accent: 'text-amber-200'
        },
        purple: {
            bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950',
            text: 'text-indigo-50',
            accent: 'text-indigo-200'
        }
    }

    const currentTheme = themes[theme]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black backdrop-blur-md">
            <div className="bg-white w-full h-full flex flex-col md:flex-row overflow-hidden shadow-2xl">
                
                {/* Left side: Preview Area */}
                <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto min-h-[400px]">
                    <div 
                        ref={posterRef}
                        className={`relative ${format === 'story' ? 'w-[360px] min-h-[640px]' : 'w-[450px] min-h-[562px]'} ${bgImage ? '' : currentTheme.bg} overflow-hidden flex flex-col items-center justify-center p-12 transition-all duration-300`}
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
                                    transform: `translate(${positions.bg.x}px, ${positions.bg.y}px) scale(1.1)`
                                }}
                                onMouseDown={(e) => handleMouseDown(e, 'bg')}
                            />
                        )}
                        {/* Decorative elements (Only if no custom bg) */}
                        {!bgImage && (
                            <>
                                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-black/40 blur-3xl pointer-events-none"></div>
                            </>
                        )}

                        {showCover && (
                            <div 
                                className="absolute cursor-move z-10 hover:ring-2 hover:ring-white/50 rounded-lg transition-shadow"
                                style={{ transform: `translate(${positions.product.x}px, ${positions.product.y}px) scale(${imageScale}) rotate(${imageRotation}deg)` }}
                                onMouseDown={(e) => handleMouseDown(e, 'product')}
                            >
                                <img 
                                    src={(() => {
                                        const img = normalizeImage(product.image);
                                        if (img.startsWith('http') && !img.includes(typeof window !== 'undefined' ? window.location.host : '')) {
                                            return `/api/proxy/image?url=${encodeURIComponent(img)}`;
                                        }
                                        return img;
                                    })() || '/product-placeholder.png'} 
                                    alt={product.title} 
                                    className="w-32 object-cover rounded-md"
                                    style={{ 
                                        boxShadow: showShadow ? '0 25px 50px -12px rgba(0,0,0,0.7)' : 'none',
                                        opacity: imageOpacity
                                    }}
                                    crossOrigin="anonymous"
                                />
                            </div>
                        )}

                        <div 
                            className="absolute cursor-move z-20 flex flex-col items-center justify-center text-center w-full px-12"
                            style={{ transform: `translate(${positions.text.x}px, ${positions.text.y}px)` }}
                            onMouseDown={(e) => handleMouseDown(e, 'text')}
                        >
                            <Quote className="w-12 h-12 text-white/20 mb-6 drop-shadow-md" />
                            <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleTextChange('description', e.currentTarget.textContent || '')}
                                dir="rtl"
                                className={`font-black leading-relaxed drop-shadow-xl outline-none mb-6 w-full`}
                                style={{ 
                                    fontSize: `${fontSize}px`, 
                                    color: fontColor,
                                    fontFamily: fontFamily,
                                    textRendering: 'optimizeLegibility',
                                    WebkitFontSmoothing: 'antialiased',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word'
                                }}
                            >
                                {editableTexts.description}
                            </p>
                            <h3 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleTextChange('title', e.currentTarget.textContent || '')}
                                className={`text-lg font-bold ${currentTheme.accent} opacity-80 uppercase outline-none whitespace-nowrap`}
                                style={{ 
                                    textRendering: 'optimizeLegibility',
                                    WebkitFontSmoothing: 'antialiased'
                                }}
                            >
                                {editableTexts.title}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Right side: Controls */}
                <div className="w-full md:w-[380px] bg-white border-l border-gray-200 p-8 flex flex-col relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-6 mt-2 flex items-center">
                        <Quote className="w-5 h-5 mr-2 text-indigo-600" />
                        Générateur Description
                    </h3>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Thème Sombre
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center justify-center px-4 py-3 rounded-xl border ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-900 to-black mr-2"></div>
                                    <span className="font-medium text-sm">Noir</span>
                                </button>
                                <button 
                                    onClick={() => setTheme('emerald')}
                                    className={`flex items-center justify-center px-4 py-3 rounded-xl border ${theme === 'emerald' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-900 to-emerald-950 mr-2"></div>
                                    <span className="font-medium text-sm">Émeraude</span>
                                </button>
                                <button 
                                    onClick={() => setTheme('gold')}
                                    className={`flex items-center justify-center px-4 py-3 rounded-xl border ${theme === 'gold' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-900 to-amber-950 mr-2"></div>
                                    <span className="font-medium text-sm">Or</span>
                                </button>
                                <button 
                                    onClick={() => setTheme('purple')}
                                    className={`flex items-center justify-center px-4 py-3 rounded-xl border ${theme === 'purple' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 mr-2"></div>
                                    <span className="font-medium text-sm">Violet</span>
                                </button>
                            </div>
                        </div>

                        {/* Background Image Upload */}
                        <div className="pt-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">
                                Image de Fond (Optionnelle)
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
                                            Réinitialiser le fond
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Typographie (Description)</h4>
                            
                            <div>
                                <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    <span>Taille de la police</span>
                                    <span>{fontSize}px</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="12" max="72" step="1" 
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Couleur du texte
                                </label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={fontColor}
                                        onChange={(e) => setFontColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <span className="text-sm font-medium text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">{fontColor.toUpperCase()}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Police (Font Family)
                                </label>
                                <select 
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                >
                                    <option value="system-ui">Système (Défaut)</option>
                                    <option value="'Tajawal', sans-serif">Tajawal (Arabe moderne)</option>
                                    <option value="'Cairo', sans-serif">Cairo (Arabe gras)</option>
                                    <option value="'Amiri', serif">Amiri (Arabe classique)</option>
                                    <option value="'Inter', sans-serif">Inter</option>
                                    <option value="Arial, sans-serif">Arial</option>
                                    <option value="Georgia, serif">Georgia</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image & Couverture</h4>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                <input 
                                    type="checkbox" 
                                    checked={showCover}
                                    onChange={(e) => setShowCover(e.target.checked)}
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-800">Ajouter la couverture</span>
                            </label>

                            {showCover && (
                                <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
                                    <div>
                                        <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            <span>Taille de l'image</span>
                                            <span>{Math.round(imageScale * 100)}%</span>
                                        </label>
                                        <input 
                                            type="range" 
                                            min="0.5" max="3" step="0.1" 
                                            value={imageScale}
                                            onChange={(e) => setImageScale(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            <span>Inclinaison</span>
                                            <span>{imageRotation}°</span>
                                        </label>
                                        <input 
                                            type="range" 
                                            min="-180" max="180" step="1" 
                                            value={imageRotation}
                                            onChange={(e) => setImageRotation(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            <span>Opacité de l'image</span>
                                            <span>{Math.round(imageOpacity * 100)}%</span>
                                        </label>
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.05" 
                                            value={imageOpacity}
                                            onChange={(e) => setImageOpacity(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={showShadow}
                                            onChange={(e) => setShowShadow(e.target.checked)}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Ombre portée</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                        <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col gap-3">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Publication n8n</h4>
                                <button 
                                    onClick={() => setShowPublishOptions(!showPublishOptions)}
                                    className="text-indigo-600 text-xs font-bold hover:underline"
                                >
                                    {showPublishOptions ? 'Masquer options' : 'Options avancées'}
                                </button>
                            </div>

                            {showPublishOptions && (
                                <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {/* Platform Selection */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Plateforme</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'facebook', label: 'FB' },
                                                { id: 'instagram', label: 'IG' },
                                                { id: 'tiktok', label: 'TK' },
                                                { id: 'all', label: 'All' }
                                            ].map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setPlatform(p.id as any)}
                                                    className={`py-2 rounded-lg text-xs font-bold border transition ${platform === p.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description Selection */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Texte Captions</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setUseDescription('short')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${useDescription === 'short' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                                            >
                                                Résumé
                                            </button>
                                            <button
                                                onClick={() => setUseDescription('long')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${useDescription === 'long' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                                            >
                                                Détails
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scheduling */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Programmer</label>
                                        <input 
                                            type="datetime-local"
                                            value={scheduleAt}
                                            onChange={(e) => setScheduleAt(e.target.value)}
                                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating || isPublishing}
                                    className="py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
                                >
                                    <Download className="w-5 h-5" />
                                    {isGenerating ? '...' : 'Télécharger'}
                                </button>
                                <button
                                    onClick={handlePreview}
                                    disabled={isGenerating || isPublishing}
                                    className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
                                >
                                    <Eye className="w-5 h-5" />
                                    Visualiser
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!posterRef.current || !product) return
                                        try {
                                            setIsGenerating(true)
                                            const originals = await patchImagesBase64(posterRef.current)
                                            await new Promise(resolve => setTimeout(resolve, 800))
                                            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                                                quality: 1,
                                                pixelRatio: 2,
                                                backgroundColor: 'transparent',
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
                                            const filename = `desc_${product.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`
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
                                                        type: 'DESCRIPTION',
                                                        productId: product.id
                                                    })
                                                })
                                                const assetData = await assetRes.json()
                                                if (assetData.success) {
                                                    alert('✅ Description sauvegardée dans le hub marketing')
                                                } else {
                                                    throw new Error(assetData.error || 'Erreur lors de l\'enregistrement en base')
                                                }
                                            } else {
                                                throw new Error(uploadData.error || 'Échec de l\'upload')
                                            }
                                        } catch (error: any) {
                                            console.error('Save error:', error)
                                            alert(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`)
                                        } finally {
                                            setIsGenerating(false)
                                        }
                                    }}
                                    disabled={isGenerating || isPublishing}
                                    className="col-span-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    {isGenerating ? 'Génération...' : 'Sauvegarder dans Marketing'}
                                </button>
                            </div>
                            
                            <button
                                onClick={handleQuickPublish}
                                disabled={isGenerating || isPublishing}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                {isPublishing ? 'Publication...' : scheduleAt ? `Programmer pour ${new Date(scheduleAt).toLocaleDateString()}` : 'Publier via n8n (Image en cours)'}
                            </button>
                        </div>
                </div>
            </div>
        </div>
    )
}
