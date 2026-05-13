'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Clock, Facebook, Instagram, FileText, AlignLeft, Music, ImageIcon, Quote, Download, Eye } from 'lucide-react'
import * as htmlToImage from 'html-to-image'
import { normalizeImage } from '@/lib/utils'

interface Book {
    id: string
    title: string
    author: string
    image: string
    description: string
    longDescription?: string | null
}

interface N8nPublishModalProps {
    isOpen: boolean
    onClose: () => void
    book: Book | null
    format: 'post' | 'story'
}

export default function N8nPublishModal({ isOpen, onClose, book, format }: N8nPublishModalProps) {
    const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok' | 'all'>('all')
    const [useDescription, setUseDescription] = useState<'short' | 'long'>('short')
    const [scheduleAt, setScheduleAt] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    // Visual Construction States
    const posterRef = useRef<HTMLDivElement>(null)
    const [theme, setTheme] = useState<'dark' | 'emerald' | 'gold' | 'purple'>('dark')
    const [useCustomCreative, setUseCustomCreative] = useState(true)
    const [editableTexts, setEditableTexts] = useState({
        title: book?.title || '',
        description: book?.description || ''
    })
    const [positions, setPositions] = useState({ text: { x: 0, y: 0 }, book: { x: 0, y: 0 } })
    const [dragging, setDragging] = useState<string | null>(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (isOpen && book) {
            setEditableTexts({
                title: book.title,
                description: book.description
            })
        }
    }, [isOpen, book])

    const handleMouseDown = (e: React.MouseEvent, key: string) => {
        if ((e.target as HTMLElement).isContentEditable) return
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

    if (!isOpen || !book) return null

    const handlePublish = async () => {
        setLoading(true)
        setResult(null)
        try {
            let customImageUrl = undefined

            // Si on utilise la créative personnalisée, on la capture et on l'upload d'abord
            if (useCustomCreative && posterRef.current) {
                const dataUrl = await htmlToImage.toPng(posterRef.current, {
                    quality: 1,
                    pixelRatio: 2,
                    backgroundColor: 'transparent'
                })

                const arr = dataUrl.split(',')
                const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
                const bstr = atob(arr[1])
                let n = bstr.length
                const u8arr = new Uint8Array(n)
                while (n--) u8arr[n] = bstr.charCodeAt(n)
                const blob = new Blob([u8arr], { type: mime })
                const file = new File([blob], `n8n_creative_${book.id}.png`, { type: mime })

                const formData = new FormData()
                formData.append('file', file)
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })
                const uploadData = await uploadRes.json()
                if (uploadData.success) {
                    customImageUrl = uploadData.url
                }
            }

            const res = await fetch('/api/n8n/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: (book as any).author ? book.id : undefined,
                    packId: !(book as any).author ? book.id : undefined,
                    format,
                    platform: platform === 'all' ? 'both' : platform,
                    useDescription,
                    scheduleAt: scheduleAt || null,
                    customImageUrl
                })
            })
            const data = await res.json()
            setResult(data)
        } catch (error: any) {
            setResult({ error: error.message || 'Erreur réseau' })
        } finally {
            setLoading(false)
        }
    }

    const handlePreview = async () => {
        if (!posterRef.current) return
        try {
            setIsGenerating(true)
            await new Promise(resolve => setTimeout(resolve, 500))
            const dataUrl = await htmlToImage.toPng(posterRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: 'transparent',
            })
            
            const newWindow = window.open()
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head><title>Aperçu n8n - Riwaya</title></head>
                        <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;min-height:100vh;">
                            <img src="${dataUrl}" style="max-width:95%;max-height:95vh;border-radius:12px;box-shadow:0 0 50px rgba(255,255,255,0.1);" />
                        </body>
                    </html>
                `)
            }
        } catch {
            alert("Erreur aperçu")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleClose = () => {
        setResult(null)
        setScheduleAt('')
        setPlatform('all')
        setUseDescription('short')
        onClose()
    }

    // Aperçu du texte qui sera publié
    const previewText = useDescription === 'long'
        ? (book.longDescription || book.description)
        : book.description

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Send className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Publier via n8n</h3>
                            <p className="text-xs text-gray-500">{book.title} — {format === 'post' ? 'Post' : 'Story'}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row max-h-[85vh]">
                    {/* Left side: Creative Builder */}
                    <div className="flex-1 bg-gray-100 p-6 flex flex-col items-center justify-center overflow-auto border-r border-gray-100">
                        <div className="mb-4 flex gap-4 w-full justify-center">
                            <button 
                                onClick={() => setUseCustomCreative(false)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${!useCustomCreative ? 'bg-black text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                            >
                                Couverture Simple
                            </button>
                            <button 
                                onClick={() => setUseCustomCreative(true)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${useCustomCreative ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                            >
                                Image de Construction
                            </button>
                        </div>

                        {useCustomCreative ? (
                            <div 
                                ref={posterRef}
                                className={`relative ${format === 'story' ? 'w-[280px] h-[500px]' : 'w-[350px] h-[437px]'} shadow-2xl overflow-hidden rounded-xl bg-gradient-to-br transition-all duration-500 ${
                                    theme === 'dark' ? 'from-slate-900 to-black text-white' :
                                    theme === 'emerald' ? 'from-emerald-900 to-green-950 text-white' :
                                    theme === 'gold' ? 'from-amber-900 to-orange-950 text-white' :
                                    'from-indigo-900 to-purple-900 text-white'
                                }`}
                            >
                                <div className="absolute inset-0 bg-white/5 blur-3xl pointer-events-none"></div>
                                
                                <div 
                                    className="absolute z-10 cursor-move p-4 text-center w-full"
                                    style={{ transform: `translate(${positions.text.x}px, ${positions.text.y}px)` }}
                                    onMouseDown={(e) => handleMouseDown(e, 'text')}
                                >
                                    <Quote className="w-8 h-8 text-white/20 mb-2 mx-auto" />
                                    <p 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => setEditableTexts(prev => ({ ...prev, description: e.currentTarget.textContent || '' }))}
                                        className="text-lg font-bold leading-tight outline-none mb-2"
                                        dir="rtl"
                                    >
                                        {editableTexts.description}
                                    </p>
                                    <p 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => setEditableTexts(prev => ({ ...prev, title: e.currentTarget.textContent || '' }))}
                                        className="text-xs font-bold opacity-60 uppercase tracking-widest outline-none"
                                    >
                                        {editableTexts.title}
                                    </p>
                                </div>

                                <div 
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-move z-10"
                                    style={{ transform: `translate(${positions.book.x - (350/2) + 175}px, ${positions.book.y}px)` }}
                                    onMouseDown={(e) => handleMouseDown(e, 'book')}
                                >
                                    <img 
                                        src={(() => {
                                            const img = normalizeImage(book.image);
                                            if (img.startsWith('http') && !img.includes(typeof window !== 'undefined' ? window.location.host : '')) {
                                                return `/api/proxy/image?url=${encodeURIComponent(img)}`;
                                            }
                                            return img;
                                        })() || '/book-placeholder.png'} 
                                        className="w-24 h-auto rounded shadow-2xl" 
                                        alt=""
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-[300px] h-[450px] shadow-2xl rounded-xl overflow-hidden">
                                <img 
                                    src={(() => {
                                        const img = normalizeImage(book.image);
                                        if (img.startsWith('http') && !img.includes(typeof window !== 'undefined' ? window.location.host : '')) {
                                            return `/api/proxy/image?url=${encodeURIComponent(img)}`;
                                        }
                                        return img;
                                    })() || '/book-placeholder.png'} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                    crossOrigin="anonymous"
                                />
                            </div>
                        )}

                        {useCustomCreative && (
                            <div className="mt-4 flex gap-2">
                                {(['dark', 'emerald', 'gold', 'purple'] as const).map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`w-8 h-8 rounded-full border-2 transition ${theme === t ? 'border-white ring-2 ring-indigo-500' : 'border-transparent'} ${
                                            t === 'dark' ? 'bg-slate-900' : t === 'emerald' ? 'bg-emerald-800' : t === 'gold' ? 'bg-amber-700' : 'bg-indigo-800'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                        <p className="mt-2 text-[10px] text-gray-400 italic">Glissez les éléments et cliquez pour éditer le texte</p>
                    </div>

                    {/* Right side: Options */}
                    <div className="w-full lg:w-[350px] p-6 space-y-5 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plateforme</label>
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    { val: 'facebook', label: 'Facebook', Icon: Facebook, color: 'blue' },
                                    { val: 'instagram', label: 'Instagram', Icon: Instagram, color: 'pink' },
                                    { val: 'tiktok', label: 'TikTok', Icon: Music, color: 'black' },
                                    { val: 'all', label: 'Toutes', Icon: Send, color: 'gray' },
                                ] as const).map(({ val, label, Icon, color }) => (
                                    <button
                                        key={val}
                                        onClick={() => setPlatform(val)}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition
                                            ${platform === val
                                                ? `border-${color === 'black' ? 'slate-900' : color + '-500'} bg-${color === 'black' ? 'slate-900' : color + '-50'} text-${color === 'black' ? 'white' : color + '-700'} ring-1 ring-${color === 'black' ? 'slate-900' : color + '-500'}`
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description à utiliser */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Texte n8n (Captions)</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setUseDescription('short')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition
                                        ${useDescription === 'short' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Résumé
                                </button>
                                <button
                                    onClick={() => setUseDescription('long')}
                                    disabled={!book.longDescription}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed
                                        ${useDescription === 'long' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <AlignLeft className="w-4 h-4" />
                                    Détails
                                </button>
                            </div>
                        </div>

                        {/* Programmation */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                <Clock className="inline w-3 h-3 mr-1" />
                                Programmer
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduleAt}
                                onChange={e => setScheduleAt(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Résultat */}
                        {result && (
                            <div className={`p-3 rounded-xl text-sm font-medium ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {result.success ? '✅ ' : '❌ '}{result.message || result.error}
                            </div>
                        )}

                        <div className="flex flex-col gap-2 pt-4">
                            <button
                                onClick={handlePreview}
                                disabled={isGenerating || loading}
                                className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black transition active:scale-95 disabled:opacity-50"
                            >
                                <Eye className="w-4 h-4" />
                                {isGenerating ? 'Génération...' : 'Visualiser'}
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-xl"
                            >
                                <Send className="w-5 h-5" />
                                {loading ? 'Envoi en cours...' : scheduleAt ? 'Programmer Publication' : 'Envoyer à n8n maintenant'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
