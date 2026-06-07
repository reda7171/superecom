import { Metadata } from 'next'
import { getSetting } from '@/lib/actions/site-settings'
import { MessageCircle, Facebook, Cpu } from 'lucide-react'
import TrackingConfigForm from './TrackingConfigForm'

export const metadata: Metadata = {
    title: 'Configuration API & Tracking | Admin',
}

export default async function TrackingConfigPage() {
    const fbPixelId = await getSetting('facebook_pixel_id') || ''
    const geminiApiKey = await getSetting('gemini_api_key') || ''
    const tiktokAccessToken = await getSetting('tiktok_access_token') || ''
    const tiktokCreatorId = await getSetting('tiktok_creator_id') || ''
    const tiktokAppId = await getSetting('tiktok_app_id') || ''
    const tiktokClientSecret = await getSetting('tiktok_client_secret') || ''
    const googleSearchConsoleId = await getSetting('google_search_console_id') || ''
    const googleAnalyticsId = await getSetting('google_analytics_id') || ''

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2 italic">
                        Gateway<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Contrôle centralisé des clés d'API et services tiers
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 p-12">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-black tracking-tight uppercase">Infrastructure API</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Tokens d'accès globaux & pixels de conversion</p>
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        <TrackingConfigForm 
                            initialFbPixelId={fbPixelId}
                            initialGeminiApiKey={geminiApiKey}
                            initialTiktokAccessToken={tiktokAccessToken}
                            initialTiktokCreatorId={tiktokCreatorId}
                            initialTiktokAppId={tiktokAppId}
                            initialTiktokClientSecret={tiktokClientSecret}
                            initialGoogleSearchConsoleId={googleSearchConsoleId}
                            initialGoogleAnalyticsId={googleAnalyticsId}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
