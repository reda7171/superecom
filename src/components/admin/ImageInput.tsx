'use client'

import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { normalizeImage } from '@/lib/utils'

type ImageInputProps = {
    defaultValue?: string
    bookTitle?: string
}

export default function ImageInput({ defaultValue, bookTitle }: ImageInputProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>('')
    const [currentUrl, setCurrentUrl] = useState<string>(defaultValue || '')
    
    // Synchroniser avec defaultValue quand il change (chargement asynchrone)
    useEffect(() => {
        if (defaultValue) {
            setCurrentUrl(defaultValue)
        }
    }, [defaultValue])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-4">
            {/* Champ pour l'URL ou le chemin */}
            <div>
                <label htmlFor="image" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    URL de l'image ou Chemin
                </label>
                <input 
                    type="text" 
                    id="image" 
                    name="image" 
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="https://example.com/image.jpg ou /uploads/books/..."
                />
            </div>

            <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">OU UPLOADER</span>
                <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            {/* Zone d'upload */}
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-1 text-sm text-gray-500">
                            <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                    </div>
                    <input
                        id="imageFile"
                        name="imageFile"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            {/* Prévisualisation */}
            <div className="flex gap-6 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {/* Prévisualisation nouveau fichier */}
                {fileName ? (
                    <div>
                        <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Nouveau fichier</p>
                        {preview && (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <p className="mt-1 text-[10px] text-gray-400 truncate w-24">{fileName}</p>
                    </div>
                ) : null}

                {/* Image actuelle (URL) */}
                {currentUrl && (
                    <div>
                        <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Aperçu URL</p>
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm bg-white">
                            <img
                                src={normalizeImage(currentUrl)}
                                alt={bookTitle || 'Image actuelle'}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/book-placeholder.png' }}
                            />
                        </div>
                    </div>
                )}

                {!fileName && !currentUrl && (
                    <div className="flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 bg-white">
                        <span className="text-[10px] font-bold text-gray-300 uppercase text-center px-2">Aucun aperçu</span>
                    </div>
                )}
            </div>
        </div>
    )
}
