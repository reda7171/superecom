'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, RefreshCw, Plus } from 'lucide-react'
import { importBooksFromExcel, updateStockFromTsv } from '@/lib/actions/bulk-import'

export default function BulkImportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [dragActive, setDragActive] = useState(false)
    const [importType, setImportType] = useState<'new' | 'stock'>('new')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        const formData = new FormData(e.currentTarget)
        const importResult = importType === 'new' 
            ? await importBooksFromExcel(formData)
            : await updateStockFromTsv(formData)

        setResult(importResult)
        setLoading(false)

        if (importResult.success && importResult.imported && importResult.imported > 0) {
            setTimeout(() => {
                router.push('/admin/books')
                router.refresh()
            }, 4000)
        }
    }

    function handleDrag(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const fileInput = document.getElementById('file') as HTMLInputElement
            if (fileInput) {
                fileInput.files = e.dataTransfer.files
            }
        }
    }

    async function downloadTemplate() {
        // Créer un template simple côté client
        const templateData = `Marque,Nom,Prix de vente,Image
James Clear,Atomic Habits,180,https://images.unsplash.com/photo-1589829085413-56de8ae18c73
Eckhart Tolle,Le pouvoir du moment présent,150,https://images.unsplash.com/photo-1544947950-fa07a98d237f`

        const blob = new Blob([templateData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'template_books.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/books"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Importation & Mise à jour</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Importez de nouveaux livres ou mettez à jour votre stock en masse
                </p>
            </div>

            {/* Switch Mode */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6 max-w-md">
                <button
                    onClick={() => { setImportType('new'); setResult(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${importType === 'new' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Plus className="w-4 h-4" />
                    Nouveaux Livres
                </button>
                <button
                    onClick={() => { setImportType('stock'); setResult(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${importType === 'stock' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <RefreshCw className="w-4 h-4" />
                    Mise à jour Stock
                </button>
            </div>

            {/* Instructions */}
            <div className={`${importType === 'new' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'} border rounded-lg p-6 mb-6`}>
                <h2 className={`text-lg font-bold mb-4 flex items-center ${importType === 'new' ? 'text-blue-900' : 'text-emerald-900'}`}>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Instructions ({importType === 'new' ? 'Importation' : 'Stock'})
                </h2>
                {importType === 'new' ? (
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Téléchargez le fichier template ci-dessous</li>
                        <li>Remplissez le fichier avec vos données (ne supprimez pas les en-têtes)</li>
                        <li>Colonnes requises (Format Odoo): <strong>Marque, Nom, Prix de vente, Image</strong></li>
                        <li><em>Note : Le stock sera initialisé à 100 par défaut s'il n'est pas précisé.</em></li>
                        <li>Uploadez le fichier complété (.xlsx, .csv)</li>
                    </ol>
                ) : (
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Utilisez un fichier <strong>TSV</strong> (Tab-Separated Values)</li>
                        <li>Format requis : une ligne d'en-tête, puis <strong>Nom[TAB]stock</strong></li>
                        <li>Exemple : <code>Livre Cadeaux [TAB] 40</code></li>
                        <li>Le système cherchera le livre par son nom exact pour mettre à jour son stock.</li>
                        <li>Uploadez votre fichier <strong>.tsv</strong></li>
                    </ol>
                )}
                
                {importType === 'new' && (
                    <button
                        onClick={downloadTemplate}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger le template
                    </button>
                )}
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
                <div
                    className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <label htmlFor="file" className="cursor-pointer">
                        <span className="text-lg font-medium text-gray-700">
                            Glissez-déposez votre fichier ou{' '}
                            <span className="text-blue-600 hover:text-blue-700">
                                cliquez pour parcourir
                            </span>
                        </span>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            accept={importType === 'new' ? ".xlsx,.xls,.csv" : ".tsv,.txt"}
                            required
                            className="hidden"
                            disabled={loading}
                        />
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                        {importType === 'new' ? 'Formats acceptés: Excel (.xlsx, .xls) ou CSV' : 'Formats acceptés: TSV (.tsv) ou Texte (.txt)'}
                    </p>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex items-center justify-end gap-4">
                    <Link
                        href="/admin/books"
                        className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        {loading ? 'Traitement...' : importType === 'new' ? 'Importer' : 'Mettre à jour le stock'}
                    </button>
                </div>
            </form>

            {/* Results */}
            {result && (
                <div className={`mt-6 p-6 rounded-lg border ${result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-start">
                        {result.success ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-grow">
                            <h3 className={`text-lg font-bold ${result.success ? 'text-green-900' : 'text-red-900'
                                }`}>
                                {result.message}
                            </h3>

                            {result.imported !== undefined && result.failed !== undefined && (
                                <div className="mt-2 text-sm">
                                    <p className="text-green-700">✓ {result.imported} livre(s) importé(s)</p>
                                    {result.failed > 0 && (
                                        <p className="text-red-700">✗ {result.failed} échec(s)</p>
                                    )}
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-red-900 mb-2">Erreurs détaillées:</p>
                                    <ul className="text-xs text-red-700 space-y-1 max-h-64 overflow-y-auto bg-white/50 rounded p-3">
                                        {result.errors.map((error: string, idx: number) => (
                                            <li key={idx}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.success && result.imported && result.imported > 0 && (
                                <p className="mt-3 text-sm text-green-700">
                                    Redirection vers la liste des livres dans 3 secondes...
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
