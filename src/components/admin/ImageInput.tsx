'use client'

import { useState } from 'react'
import { Upload, Link as LinkIcon } from 'lucide-react'
import Image from 'next/image'

type ImageInputProps = {
    defaultValue?: string
    bookTitle?: string
}

export default function ImageInput({ defaultValue, bookTitle }: ImageInputProps) {
    const [mode, setMode] = useState<'url' | 'upload'>('url')
    const [preview, setPreview] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>('')

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
            {/* Toggle entre URL et Upload */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${mode === 'url'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${mode === 'upload'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload
                </button>
            </div>

            {/* Section URL */}
            {mode === 'url' && (
                <div>
                    <input
                        type="url"
                        id="image"
                        name="image"
                        required={mode === 'url'}
                        defaultValue={defaultValue}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg ou /images/books/book.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        URL complète ou chemin relatif (ex: /images/books/atomic-habits.jpg)
                    </p>
                </div>
            )}

            {/* Section Upload */}
            {mode === 'upload' && (
                <div>
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
                                required={mode === 'upload'}
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {/* Nom du fichier et preview */}
                    {fileName && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-700 font-medium mb-2">📎 {fileName}</p>
                            {preview && (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Aperçu de l'image actuelle */}
            {defaultValue && mode === 'url' && (
                <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Image actuelle :</p>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                            src={defaultValue}
                            alt={bookTitle || 'Book cover'}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
