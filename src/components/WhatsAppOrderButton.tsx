'use client'

interface Props {
    title: string
    price: number
    phone?: string // numéro depuis les settings
    type?: 'book' | 'pack'
}

export default function WhatsAppOrderButton({ title, price, phone, type = 'book' }: Props) {
    const phoneNumber = (phone || '212600000000').replace(/[\s+\-()]/g, '')

    // Message en Darija
    const message = type === 'pack'
        ? `Salam, bghit nchri had lpack: "${title}" b ${price} MAD. Wach kayn?`
        : `Salam, bghit had lktab: "${title}" b ${price} MAD. Wach kayn?`

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-5 px-8 rounded-full font-black text-xs uppercase tracking-[0.2em] bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 hover:bg-[#1ebe5d] hover:shadow-[#25D366]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C8.268 2 2 8.268 2 16c0 2.674.742 5.18 2.03 7.32L2 30l6.88-2.004A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 01-5.896-1.61l-.424-.252-4.088 1.19 1.22-3.976-.276-.436A11.56 11.56 0 014.4 16C4.4 9.594 9.594 4.4 16 4.4S27.6 9.594 27.6 16 22.406 27.6 16 27.6zm6.32-8.68c-.346-.174-2.05-1.012-2.368-1.128-.316-.116-.546-.174-.776.174-.23.348-.892 1.128-1.094 1.36-.202.23-.402.26-.748.086-.346-.174-1.46-.538-2.782-1.716-1.028-.916-1.722-2.048-1.924-2.394-.202-.348-.022-.536.152-.708.156-.156.346-.406.52-.61.172-.202.23-.348.346-.578.116-.23.058-.432-.028-.608-.086-.174-.776-1.876-1.064-2.568-.28-.676-.562-.584-.776-.594-.2-.01-.432-.012-.664-.012-.23 0-.604.086-.92.432-.316.346-1.208 1.182-1.208 2.882 0 1.7 1.238 3.344 1.41 3.574.172.23 2.436 3.72 5.9 5.216.826.356 1.47.568 1.972.728.828.264 1.582.226 2.178.138.664-.1 2.05-.838 2.34-1.648.29-.81.29-1.506.202-1.648-.086-.144-.316-.23-.662-.404z"/>
            </svg>
            Commander via WhatsApp
        </a>
    )
}
