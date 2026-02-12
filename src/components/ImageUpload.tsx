'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui'

interface ImageUploadProps {
    onImageSelect: (file: File) => void
    currentImage?: string | null
    onRemove?: () => void
}

export default function ImageUpload({ onImageSelect, currentImage, onRemove }: ImageUploadProps) {
    const t = useTranslations('Common.ImageUpload')
    const { showNotification } = useUIStore()
    const [preview, setPreview] = useState<string | null>(currentImage || null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (file: File | null) => {
        if (!file) return

        // Vérifier le type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            showNotification(t('FormatError'), 'error')
            return
        }

        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification(t('SizeError'), 'error')
            return
        }

        // Créer la prévisualisation
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Notifier le parent
        onImageSelect(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileChange(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleRemove = () => {
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        if (onRemove) {
            onRemove()
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                {t('Label')}
            </label>

            {preview ? (
                <div className="relative w-full aspect-[3/4] max-w-xs mx-auto bg-gray-100 rounded-2xl overflow-hidden group">
                    <Image
                        src={preview}
                        alt={t('Alt')}
                        fill
                        className="object-cover"
                        unoptimized={preview.startsWith('data:')}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full aspect-[3/4] max-w-xs mx-auto border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${isDragging
                        ? 'border-black bg-gray-50 scale-105'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-black text-sm text-gray-700 mb-1">
                            {t('Placeholder')}
                        </p>
                        <p className="text-xs text-gray-400 font-bold">
                            {t('Instructions')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold">
                        <Upload className="w-4 h-4" />
                        {t('Button')}
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
                name="imageFile"
            />
        </div>
    )
}
