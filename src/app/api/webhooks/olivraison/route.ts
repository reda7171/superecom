import { NextResponse } from 'next/server';

// Route désactivée - migration vers WithYou terminée
export async function GET() {
    return NextResponse.json({ status: 'deprecated', message: 'Use WithYou instead' });
}
