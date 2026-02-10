'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { importBooksFromExcel } from '@/lib/actions/bulk-import'

export default function BulkImportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [dragActive, setDragActive] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        const formData = new FormData(e.currentTarget)
        const importResult = await importBooksFromExcel(formData)

        setResult(importResult)
        setLoading(false)

        if (importResult.success && importResult.imported && importResult.imported > 0) {
            setTimeout(() => {
                router.push('/admin/books')
                router.refresh()
            }, 3000)
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
        const templateData = `title,author,description,isbn,price,stock,category,language,image
Atomic Habits,James Clear,Un guide facile et éprouvé pour créer de bonnes habitudes,9780735211292,180,50,Développement Personnel,en,https://images.unsplash.com/photo-1589829085413-56de8ae18c73
Le pouvoir du moment présent,Eckhart Tolle,Guide d'éveil spirituel,9782290020203,150,30,Développement Personnel,fr,https://images.unsplash.com/photo-1544947950-fa07a98d237f`

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
                <h1 className="text-3xl font-bold text-gray-900">Importation en masse</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Importez plusieurs livres à la fois depuis un fichier Excel ou CSV
                </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Instructions
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Téléchargez le fichier template ci-dessous</li>
                    <li>Remplissez le fichier avec vos données (ne supprimez pas les en-têtes)</li>
                    <li>Colonnes requises: <strong>title, author, description, price, stock, image</strong></li>
                    <li>Colonnes optionnelles: isbn, category, language (par défaut: fr)</li>
                    <li>Uploadez le fichier complété</li>
                </ol>
                <button
                    onClick={downloadTemplate}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le template
                </button>
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
                            accept=".xlsx,.xls,.csv"
                            required
                            className="hidden"
                            disabled={loading}
                        />
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                        Formats acceptés: Excel (.xlsx, .xls) ou CSV
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
                        {loading ? 'Importation...' : 'Importer'}
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
