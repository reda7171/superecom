import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const requestId = req.nextUrl.searchParams.get('requestId')

    if (!requestId) {
        return NextResponse.json({ error: 'requestId required' }, { status: 400 })
    }

    const stream = new ReadableStream({
        async start(controller) {
            let isClosed = false
            const encoder = new TextEncoder()

            const pushMessage = (data: any) => {
                if (!isClosed) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
                }
            }

            const interval = setInterval(async () => {
                if (isClosed) return
                try {
                    const request = await prisma.adminAuthRequest.findUnique({
                        where: { id: requestId },
                        select: { status: true }
                    })
                    if (request) {
                        pushMessage({ status: request.status })
                        if (request.status === 'APPROVED' || request.status === 'REJECTED') {
                            clearInterval(interval)
                            if (!isClosed) {
                                controller.close()
                                isClosed = true
                            }
                        }
                    }
                } catch (e) {
                    console.error('SSE Error', e)
                }
            }, 2000)

            // Keep-alive heartbeat
            const keepAlive = setInterval(() => {
                if (!isClosed) {
                    controller.enqueue(encoder.encode(': keepalive\n\n'))
                }
            }, 15000)

            req.signal.addEventListener('abort', () => {
                isClosed = true
                clearInterval(interval)
                clearInterval(keepAlive)
            })
        }
    })

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive'
        }
    })
}
