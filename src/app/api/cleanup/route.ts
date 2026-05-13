import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

import { verifyAdmin } from '@/lib/actions/auth';

export async function POST() {
    try {
        await verifyAdmin();
        
        const p1 = path.join(process.cwd(), 'src/app/api/temp-seed-reviews');
        const p2 = path.join(process.cwd(), 'src/app/api/temp-debug-images');
        
        if (fs.existsSync(p1)) fs.rmSync(p1, { recursive: true, force: true });
        if (fs.existsSync(p2)) fs.rmSync(p2, { recursive: true, force: true });
        
        return NextResponse.json({ success: true, message: "Cleaned up" });
    } catch (error: any) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
