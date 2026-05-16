import { NextResponse } from 'next/server'
import { JumiaAPI } from '@/lib/jumia-api'

export async function GET() {
    try {
        const jumia = await JumiaAPI.getInstance()
        
        if (!jumia) {
            return NextResponse.json({ 
                success: false, 
                message: "Jumia n'est pas configuré ou est désactivé dans les paramètres." 
            })
        }

        const orders = await jumia.getOrders(50, 0)

        return NextResponse.json({ 
            success: true, 
            message: "Connexion réussie à Jumia API !", 
            data: orders 
        })
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            message: "Erreur de connexion à Jumia API", 
            error: error.message 
        }, { status: 500 })
    }
}
