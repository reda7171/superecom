'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeImage } from '@/lib/utils'

interface OrbitBook {
  id: string
  title: string
  image: string
  price: number
  author?: string
}

interface CosmosBooksProps {
  books: OrbitBook[]
  centerBook: OrbitBook
  locale: string
  autoRotateCenter?: boolean
  autoRotateInterval?: number
}

// Dimensions canvas rectangulaires (paysage) — moins d'espace vertical
const CANVAS_W = 700
const CANVAS_H = 560

// Orbites : rayon, vitesse, sens
const ORBITS = [
  { radius: 150, speed: 0.0004, direction: 1 },
  { radius: 225, speed: 0.00025, direction: -1 },
  { radius: 295, speed: 0.00015, direction: 1 },
]

// Taille cartes selon orbite (profondeur)
const BOOK_SIZE = [80, 64, 52]

// Seuil de proximité pour détecter le drop (px canvas)
const DROP_RADIUS = 55

export default function CosmosBooks({
  books,
  centerBook: initialCenter,
  locale,
  autoRotateCenter = true,
  autoRotateInterval = 6000,
}: CosmosBooksProps) {
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const anglesRef = useRef<number[]>([])
  const pausedRef = useRef<Set<number>>(new Set())
  const lastTimeRef = useRef<number>(0)

  const [centerBook, setCenterBook] = useState<OrbitBook>(initialCenter)
  const [orbitOrder, setOrbitOrder] = useState<OrbitBook[]>([])
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [centerHovered, setCenterHovered] = useState(false)
  const [bookPositions, setBookPositions] = useState<
    { x: number; y: number; size: number; bookIdx: number }[]
  >([])
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const handleImageError = (id: string) => {
    setFailedImages(prev => new Set(prev).add(id))
  }

  // Drag state
  const [dragging, setDragging] = useState<{
    idx: number | 'center'
    book: OrbitBook
    ghostX: number
    ghostY: number
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<number | 'center' | null>(null)
  const [swapFlash, setSwapFlash] = useState<number | 'center' | null>(null)

  // Initialiser l'ordre des livres en orbite
  useEffect(() => {
    const orbit = books.filter(b => b.id !== centerBook.id).slice(0, 8)
    setOrbitOrder(orbit)
    anglesRef.current = orbit.map((_, i) => (i / orbit.length) * Math.PI * 2)
  }, [books, centerBook.id])

  // Auto-rotation du livre central (désactivée pendant le drag)
  useEffect(() => {
    if (!autoRotateCenter || dragging || books.length <= 1) return
    const interval = setInterval(() => {
      setCenterBook(prev => {
        const allIds = books.map(b => b.id)
        const idx = allIds.indexOf(prev.id)
        const next = books[(idx + 1) % books.length]
        return next
      })
    }, autoRotateInterval)
    return () => clearInterval(interval)
  }, [autoRotateCenter, autoRotateInterval, books, dragging])

  // Animation loop (canvas + positions)
  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dt = Math.min(timestamp - lastTimeRef.current, 50) // cap dt
      lastTimeRef.current = timestamp

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Orbites pointillées
      ORBITS.forEach(orbit => {
        ctx.beginPath()
        ctx.ellipse(cx, cy, orbit.radius, orbit.radius * 0.6, 0, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0,0,0,0.07)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 8])
        ctx.stroke()
        ctx.setLineDash([])
      })

      const positions: typeof bookPositions = []
      orbitOrder.forEach((_, i) => {
        const orbitIdx = i % ORBITS.length
        const orbit = ORBITS[orbitIdx]
        if (!pausedRef.current.has(i)) {
          anglesRef.current[i] = (anglesRef.current[i] || 0) + orbit.speed * orbit.direction * dt
        }
        const angle = anglesRef.current[i] || 0
        // ellipse : ry = rx * 0.55 pour rester dans la hauteur
        const x = cx + Math.cos(angle) * orbit.radius
        const y = cy + Math.sin(angle) * orbit.radius * 0.55
        const size = BOOK_SIZE[orbitIdx]
        positions.push({ x, y, size, bookIdx: i })
      })

      setBookPositions(positions)
      animRef.current = requestAnimationFrame(draw)
    },
    [orbitOrder]
  )

  useEffect(() => {
    lastTimeRef.current = performance.now()
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  // --- Drag & Drop via Pointer Events ---

  const getWrapperRect = () => wrapperRef.current?.getBoundingClientRect()

  // Trouver la cible la plus proche du point (px, py) en coordonnées canvas
  const findDropTarget = useCallback(
    (canvasX: number, canvasY: number, dragFrom: number | 'center') => {
      const cx = CANVAS_W / 2
      const cy = CANVAS_H / 2
      const distCenter = Math.hypot(canvasX - cx, canvasY - cy)

      // Centre comme cible
      if (distCenter < DROP_RADIUS + 30 && dragFrom !== 'center') return 'center'

      // Livres en orbite comme cible
      let closest: number | null = null
      let minDist = DROP_RADIUS
      bookPositions.forEach(({ x, y, bookIdx }) => {
        if (bookIdx === dragFrom) return
        const d = Math.hypot(canvasX - x, canvasY - y)
        if (d < minDist) {
          minDist = d
          closest = bookIdx
        }
      })
      return closest
    },
    [bookPositions]
  )

  const startDrag = (
    e: React.PointerEvent,
    idx: number | 'center',
    book: OrbitBook
  ) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pausedRef.current.add(idx as number)
    const rect = getWrapperRect()
    if (!rect) return
    setDragging({
      idx,
      book,
      ghostX: e.clientX - rect.left,
      ghostY: e.clientY - rect.top,
    })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const rect = getWrapperRect()
    if (!rect) return
    const ghostX = e.clientX - rect.left
    const ghostY = e.clientY - rect.top
    setDragging(prev => prev ? { ...prev, ghostX, ghostY } : null)

    // Coordonnées canvas depuis le pointer
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    const cx = ghostX * scaleX
    const cy = ghostY * scaleY
    setDropTarget(findDropTarget(cx, cy, dragging.idx))
  }

  const onPointerUp = () => {
    if (!dragging) return
    pausedRef.current.delete(dragging.idx as number)

    if (dropTarget !== null) {
      // Flash d'animation swap
      setSwapFlash(dropTarget)
      setTimeout(() => setSwapFlash(null), 500)

      if (dropTarget === 'center') {
        // Échange livre orbite ↔ livre central
        const oldCenter = centerBook
        setCenterBook(dragging.book)
        setOrbitOrder(prev => {
          const next = [...prev]
          const i = dragging.idx as number
          next[i] = oldCenter
          return next
        })
      } else if (dragging.idx === 'center') {
        // Échange livre central ↔ livre orbite
        const oldOrbit = orbitOrder[dropTarget]
        setCenterBook(oldOrbit)
        setOrbitOrder(prev => {
          const next = [...prev]
          next[dropTarget] = dragging.book
          return next
        })
      } else {
        // Échange deux livres en orbite : on swap leurs angles
        const a = anglesRef.current[dragging.idx as number]
        const b = anglesRef.current[dropTarget]
        anglesRef.current[dragging.idx as number] = b
        anglesRef.current[dropTarget] = a
        setOrbitOrder(prev => {
          const next = [...prev]
          const tmp = next[dragging.idx as number]
          next[dragging.idx as number] = next[dropTarget]
          next[dropTarget] = tmp
          return next
        })
      }
    }

    setDragging(null)
    setDropTarget(null)
  }

  const handleClick = (book: OrbitBook) => {
    if (dragging) return
    router.push(`/${locale}/books/${book.id}`)
  }

  const ghostSize = 80

  return (
    <div
      ref={wrapperRef}
      className="cosmos-wrapper relative mx-auto select-none"
      style={{ width: CANVAS_W, height: CANVAS_H, maxWidth: '100%' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Glow cosmique */}
      <div className="cosmos-glow" />

      {/* Canvas orbites */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Livre central */}
      <div
        className={`cosmos-center${dropTarget === 'center' ? ' cosmos-drop-target' : ''}`}
        onMouseEnter={() => !dragging && setCenterHovered(true)}
        onMouseLeave={() => setCenterHovered(false)}
        onClick={() => handleClick(centerBook)}
        onPointerDown={e => startDrag(e, 'center', centerBook)}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${centerHovered && !dragging ? 1.05 : 1})`,
          zIndex: dragging?.idx === 'center' ? 0 : 1,
          cursor: dragging ? 'grabbing' : 'grab',
          opacity: dragging?.idx === 'center' ? 0.35 : 1,
          transition: 'transform 0.3s ease, opacity 0.2s',
        }}
      >
        <div className={`cosmos-center-card${swapFlash === 'center' ? ' cosmos-swap-flash' : ''}`}>
          <div className="cosmos-center-img-wrap">
            {failedImages.has(centerBook.id) ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center p-6 text-center border-2 border-gray-200 rounded-xl">
                <span className="text-sm font-black text-gray-400">{centerBook.title}</span>
              </div>
            ) : (
              <img 
                src={normalizeImage(centerBook.image)} 
                alt={centerBook.title} 
                className="w-full h-full object-cover" 
                onError={() => handleImageError(centerBook.id)} 
                fetchPriority="high"
                decoding="sync"
                loading="eager"
              />
            )}
          </div>
        </div>
        {centerHovered && !dragging && (
          <div className="cosmos-book-tooltip">
            <p className="cosmos-tooltip-title">{centerBook.title}</p>
            <p className="cosmos-tooltip-price">{centerBook.price} MAD</p>
          </div>
        )}
        <div className="cosmos-center-pulse" style={{ pointerEvents: 'none' }} />
      </div>

      {/* Livres en orbite */}
      {bookPositions.map(({ x, y, size, bookIdx }) => {
        const book = orbitOrder[bookIdx]
        if (!book || failedImages.has(book.id)) return null
        const isHovered = hoveredIdx === bookIdx
        const isDragging = dragging?.idx === bookIdx
        const isTarget = dropTarget === bookIdx
        const orbitIdx = bookIdx % ORBITS.length
        const depth = 1 - orbitIdx * 0.12
        const relX = (x / CANVAS_W) * 100
        const relY = (y / CANVAS_H) * 100

        return (
          <div
            key={book.id}
            onMouseEnter={() => !dragging && setHoveredIdx(bookIdx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => handleClick(book)}
            onPointerDown={e => startDrag(e, bookIdx, book)}
            style={{
              position: 'absolute',
              left: `${relX}%`,
              top: `${relY}%`,
              width: size,
              height: size * 1.35,
              transform: `translate(-50%, -50%) scale(${isTarget ? 1.3 : isHovered ? 1.2 : depth})`,
              filter: isTarget
                ? 'drop-shadow(0 0 18px rgba(250,200,50,0.8))'
                : isHovered
                ? 'drop-shadow(0 0 12px rgba(0,0,0,0.4))'
                : `blur(${orbitIdx * 0.3}px) drop-shadow(0 2px 6px rgba(0,0,0,0.18))`,
              zIndex: isTarget ? 40 : isHovered ? 30 : 10 + orbitIdx,
              opacity: isDragging ? 0.3 : 1,
              transition: 'transform 0.25s ease, filter 0.25s ease, opacity 0.2s',
              cursor: dragging ? 'grabbing' : 'grab',
              outline: isTarget ? '2px dashed #f5c842' : 'none',
              borderRadius: 10,
            }}
          >
            <div style={{ width: size, height: size * 1.35, position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
              <img 
                src={normalizeImage(book.image)} 
                alt={book.title} 
                className="w-full h-full object-cover" 
                onError={() => handleImageError(book.id)} 
                loading="eager"
              />
            </div>
            {/* Flash swap */}
            {swapFlash === bookIdx && <div className="cosmos-swap-overlay" />}
            {/* Tooltip */}
            {isHovered && !dragging && (
              <div className="cosmos-book-tooltip">
                <p className="cosmos-tooltip-title">{book.title}</p>
                <p className="cosmos-tooltip-price">{book.price} MAD</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Ghost card qui suit le curseur pendant le drag */}
      {dragging && (
        <div
          style={{
            position: 'absolute',
            left: dragging.ghostX,
            top: dragging.ghostY,
            width: ghostSize,
            height: ghostSize * 1.35,
            transform: 'translate(-50%, -50%) scale(1.1) rotate(6deg)',
            pointerEvents: 'none',
            zIndex: 100,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
            border: '2px solid #000',
          }}
        >
          {failedImages.has(dragging.book.id) ? (
             <div className="w-full h-full bg-gray-100 flex items-center justify-center p-2 text-center">
               <span className="text-[10px] font-black text-gray-400 line-clamp-3">{dragging.book.title}</span>
             </div>
          ) : (
            <img 
              src={normalizeImage(dragging.book.image)} 
              alt={dragging.book.title} 
              className="w-full h-full object-cover" 
            />
          )}
        </div>
      )}

      <style jsx>{`
        .cosmos-wrapper { background: transparent; touch-action: none; }
        .cosmos-glow {
          position: absolute; inset: 0; border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(250,240,210,0.6) 0%, rgba(255,255,255,0) 70%);
          pointer-events: none;
        }
        .cosmos-center { position: absolute; }
        .cosmos-center-card {
          width: 180px; background: white; border-radius: 24px; overflow: hidden;
          border: 2px solid #000; box-shadow: 0 24px 70px rgba(0,0,0,0.22);
          position: relative; z-index: 2;
        }
        .cosmos-center-img-wrap { position: relative; width: 180px; height: 240px; }
        .cosmos-drop-target .cosmos-center-card {
          outline: 2px dashed #f5c842;
          box-shadow: 0 0 24px rgba(250,200,50,0.5);
        }
        .cosmos-center-pulse {
          position: absolute; inset: -20px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(250,200,50,0.15), transparent 70%);
          animation: pulse-ring 3s ease-in-out infinite; z-index: 1;
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .cosmos-swap-flash {
          animation: swap-flash 0.45s ease;
        }
        @keyframes swap-flash {
          0% { box-shadow: 0 0 0 0 rgba(250,200,50,0.9); }
          50% { box-shadow: 0 0 40px 20px rgba(250,200,50,0.5); }
          100% { box-shadow: 0 24px 70px rgba(0,0,0,0.22); }
        }
        .cosmos-swap-overlay {
          position: absolute; inset: 0; border-radius: 10;
          background: rgba(250,200,50,0.3);
          animation: fade-overlay 0.45s ease forwards;
          pointer-events: none;
        }
        @keyframes fade-overlay {
          0% { opacity: 1; } 100% { opacity: 0; }
        }
        .cosmos-book-tooltip {
          position: absolute; bottom: calc(100% + 8px); left: 50%;
          transform: translateX(-50%); background: #000; color: #fff;
          padding: 6px 10px; border-radius: 8px; white-space: nowrap;
          pointer-events: none; z-index: 50;
        }
        .cosmos-tooltip-title {
          font-size: 10px; font-weight: 900; margin: 0;
          max-width: 120px; overflow: hidden; text-overflow: ellipsis;
        }
        .cosmos-tooltip-price { font-size: 9px; font-weight: 700; margin: 2px 0 0; color: #f5c842; }
      `}</style>
    </div>
  )
}
