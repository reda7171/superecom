import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('URL is required', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', blob.type);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Origin', '*');

        return new NextResponse(blob, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Error fetching image', { status: 500 });
    }
}
