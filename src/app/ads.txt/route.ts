import { getSetting } from '@/lib/actions/site-settings'
import { NextResponse } from 'next/server'

export async function GET() {
    const publisherId = await getSetting('adsense_publisher_id')
    
    if (!publisherId) {
        return new NextResponse('# Google AdSense not configured', {
            headers: { 'Content-Type': 'text/plain' }
        })
    }

    const fullId = publisherId.startsWith('ca-pub-') ? publisherId : `ca-pub-${publisherId}`
    const content = `google.com, ${fullId}, DIRECT, f08c47fec0942fa0`

    return new NextResponse(content, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
    })
}
