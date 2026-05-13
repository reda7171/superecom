'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Loader2, Volume2, VolumeX, Bookmark } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface ImmersivePdfReaderProps {
    pdfUrl: string
    title: string
    onClose: () => void
}

const Page = React.forwardRef<HTMLDivElement, { pageNumber: number, onCanvasMount: (el: HTMLCanvasElement | null) => void }>(
    (props, ref) => {
        return (
            <div className="bg-white shadow-xl flex items-center justify-center p-2" ref={ref}>
                <div className="relative w-full h-full border border-gray-100 rounded-sm overflow-hidden bg-white">
                    <canvas 
                        ref={props.onCanvasMount}
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 right-4 text-[10px] text-gray-300 font-serif">
                        {props.pageNumber}
                    </div>
                </div>
            </div>
        )
    }
)

Page.displayName = 'Page'

export default function ImmersivePdfReader({ pdfUrl, title, onClose }: ImmersivePdfReaderProps) {
    const t = useTranslations('DigitalBooks.Reader')
    const [numPages, setNumPages] = useState<number>(0)
    const [pages, setPages] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isMuted, setIsMuted] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [startPage, setStartPage] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const bookRef = useRef<any>(null)
    const flipSoundRef = useRef<HTMLAudioElement | null>(null)
    const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null)
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
    const renderedPages = useRef<Set<number>>(new Set())
    const renderTasks = useRef<Map<number, any>>(new Map())

    // Sound effect (Paper flip)
    useEffect(() => {
        flipSoundRef.current = new Audio('/sounds/page-flip.mp3') // Assume this file exists or will be added
        return () => {
            if (flipSoundRef.current) {
                flipSoundRef.current.pause()
                flipSoundRef.current = null
            }
        }
    }, [])

    // Fullscreen support
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error enabling fullscreen: ${err.message}`)
            })
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }

    const playFlipSound = useCallback(() => {
        if (!isMuted && flipSoundRef.current) {
            flipSoundRef.current.currentTime = 0
            flipSoundRef.current.play().catch(() => {})
        }
    }, [isMuted])

    const loadPdf = useCallback(async () => {
        try {
            setLoading(true)
            
            // Check for saved bookmark
            let initialPage = 0
            try {
                const saved = localStorage.getItem(`riwaya-bookmark-${title}`)
                if (saved) {
                    const parsed = parseInt(saved, 10)
                    if (!isNaN(parsed)) {
                        initialPage = parsed
                        setStartPage(parsed)
                        setCurrentPage(parsed)
                    }
                }
            } catch (err) {}

            const loadingTask = pdfjsLib.getDocument(pdfUrl)
            const pdf = await loadingTask.promise
            pdfDocRef.current = pdf
            setNumPages(pdf.numPages)
            
            // We'll prepare canvases for each page
            canvasRefs.current = new Array(pdf.numPages).fill(null)
            
            // Initially render first few pages to show something
            renderPage(initialPage + 1)
            if (initialPage + 2 <= pdf.numPages) renderPage(initialPage + 2)
            if (initialPage > 0) renderPage(initialPage)
            
            setLoading(false)
        } catch (error) {
            console.error('Error loading PDF:', error)
            setLoading(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfUrl, title])

    const renderPage = async (pageNumber: number) => {
        if (!pdfDocRef.current || renderedPages.current.has(pageNumber)) return
        
        // If a task is already running for this page, just wait for it
        if (renderTasks.current.has(pageNumber)) {
            return
        }
        
        // Mark as running BEFORE await to prevent race condition
        renderTasks.current.set(pageNumber, true)
        
        try {
            const page = await pdfDocRef.current.getPage(pageNumber)
            const canvas = canvasRefs.current[pageNumber - 1]
            if (!canvas) return

            const viewport = page.getViewport({ scale: 1.5 })
            const context = canvas.getContext('2d')
            if (!context) return

            canvas.height = viewport.height
            canvas.width = viewport.width

            const renderTask = page.render({
                canvasContext: context,
                viewport: viewport
            })
            
            renderTasks.current.set(pageNumber, renderTask)
            
            await renderTask.promise
            renderedPages.current.add(pageNumber)
        } catch (err: any) {
            if (err.name !== 'RenderingCancelledException') {
                console.error('Error rendering page:', err)
            }
        } finally {
            renderTasks.current.delete(pageNumber)
        }
    }

    useEffect(() => {
        loadPdf()
    }, [loadPdf])

    const onFlip = useCallback((e: any) => {
        const newPage = e.data
        setCurrentPage(newPage)
        playFlipSound()
        
        // Auto-save bookmark
        try {
            localStorage.setItem(`riwaya-bookmark-${title}`, newPage.toString())
        } catch (err) {}
        
        // Lazy render next/prev pages
        const nextPage = newPage + 1
        const prevPage = newPage - 1
        if (nextPage <= numPages) renderPage(nextPage)
        if (nextPage + 1 <= numPages) renderPage(nextPage + 1)
        if (prevPage >= 1) renderPage(prevPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numPages, playFlipSound, title])

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                <p className="text-white font-black uppercase tracking-widest text-xs">{t('Loading')}</p>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex flex-col overflow-hidden select-none">
            {/* Header */}
            <div className="h-20 bg-black flex items-center justify-between px-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-black font-black italic">R</div>
                    <div>
                        <h2 className="text-white font-black text-sm tracking-tight leading-none">{title}</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Riwaya Immersive Reader</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            try {
                                localStorage.setItem(`riwaya-bookmark-${title}`, currentPage.toString())
                                alert('Signet mémorisé avec succès !')
                            } catch(e) {}
                        }}
                        className="p-3 text-amber-400 hover:text-amber-300 transition-colors"
                        title="Ajouter un signet"
                    >
                        <Bookmark className="w-5 h-5 fill-amber-400/20" />
                    </button>
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 text-gray-400 hover:text-white transition-colors"
                        title="Désactiver le son"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 bg-white/5 hover:bg-red-500 transition-colors flex items-center justify-center rounded-xl text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Container for FlipBook */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative overflow-hidden bg-[url('/ui/reader-bg.jpg')] bg-cover bg-center bg-no-repeat">
                {/* Overlay for paper texture feel if background image missing */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none backdrop-blur-[2px]" />
                
                {/* FlipBook Component */}
                <div className="relative z-10 w-full h-full max-w-6xl flex items-center justify-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                    <HTMLFlipBook
                        width={450}
                        height={650}
                        size="stretch"
                        minWidth={280}
                        maxWidth={1000}
                        minHeight={380}
                        maxHeight={1400}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={onFlip}
                        className="demo-book"
                        style={{}}
                        startPage={startPage}
                        drawShadow={true}
                        flippingTime={1000}
                        usePortrait={true}
                        startZIndex={0}
                        autoSize={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                        ref={bookRef}
                    >
                        {Array.from({ length: numPages }).map((_, i) => (
                            <Page 
                                key={i} 
                                pageNumber={i + 1} 
                                onCanvasMount={(el: HTMLCanvasElement | null) => {
                                    canvasRefs.current[i] = el
                                    if (i < 2) renderPage(i + 1) // Pre-render core pages
                                }} 
                            />
                        ))}
                    </HTMLFlipBook>
                </div>

                {/* Navigation Arrows (Floating) */}
                <button 
                    onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                    className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-amber-400 hover:text-black transition-all flex items-center justify-center group z-20 backdrop-blur-md border border-white/5"
                >
                    <ChevronLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                    onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-amber-400 hover:text-black transition-all flex items-center justify-center group z-20 backdrop-blur-md border border-white/5"
                >
                    <ChevronRight className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Bottom Controls */}
            <div className="h-20 bg-black border-t border-white/5 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('Page')}</span>
                        <span className="text-white font-black text-xl tabular-nums">{currentPage + 1}</span>
                        <span className="text-gray-600 font-bold">/</span>
                        <span className="text-gray-400 font-bold">{numPages}</span>
                   </div>
                </div>
                
                <div className="hidden md:block">
                     <div className="w-96 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-amber-400 transition-all duration-300" 
                            style={{ width: `${((currentPage + 1) / numPages) * 100}%` }}
                        />
                     </div>
                </div>

                <button 
                    onClick={toggleFullscreen}
                    className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    ) : (
                        <Maximize2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{t('Fullscreen')}</span>
                </button>
            </div>

            {/* Custom Styles for Flipbook */}
            <style jsx global>{`
                .demo-book {
                    background-color: transparent;
                }
                canvas {
                    image-rendering: optimizeSpeed; /* Background rendering */
                }
            `}</style>
        </div>
    )
}
