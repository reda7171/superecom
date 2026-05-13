'use client'

import { useState } from 'react'
import { Send, Bot, Loader2 } from 'lucide-react'

export default function GeminiTestForm() {
    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleTest(e: React.FormEvent) {
        e.preventDefault()
        if (!prompt.trim()) return

        setLoading(true)
        setResponse('')

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            })

            const data = await res.json()
            
            if (!res.ok) throw new Error(data.error || 'Erreur API')
            
            setResponse(data.text)
        } catch (error: any) {
            setResponse(`Erreur : ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-600" />
                Tester l'API Gemini
            </h2>
            
            <form onSubmit={handleTest} className="space-y-4">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-bold text-gray-700 mb-2">
                        Votre question / prompt
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                        placeholder="Ex: Explique l'intelligence artificielle en quelques mots..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Envoyer
                </button>
            </form>

            {response && (
                <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Réponse de Gemini
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
                        {response}
                    </div>
                </div>
            )}
        </div>
    )
}
