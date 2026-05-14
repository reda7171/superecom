import { withyouService } from '@/lib/delivery/withyou';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const testData = {
            villedest: "Rabat",
            nomdest: "Test User",
            teldest: "0600000000",
            adressedest: "Test Address",
            prixcolis: "100.00",
            refcolis: "TEST-" + Date.now(),
            observation: "Test sync via API route"
        };
        const response = await withyouService.createPackage(testData);
        return NextResponse.json({ success: true, response });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
