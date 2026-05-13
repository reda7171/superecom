'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { updateProfile } from '@/lib/actions/community-user'
import { User, MapPin, Loader2, Save, RefreshCw, Instagram, Facebook, Twitter, FileText, Plus } from 'lucide-react'
import { MOROCCO_CITIES } from '@/lib/constants/cities'

interface UserProps {
    fullName: string
    city: string
    address?: string | null
    neighborhood?: string | null
    email: string
    image?: string | null
    bio?: string | null
    instagram?: string | null
    facebook?: string | null
    twitter?: string | null
}

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Mittens', 'Coco', 'Angel', 'Bubba', 'Daisy', 'Jack', 'Molly', 'Simba']

export default function ProfileEditForm({ user }: { user: UserProps }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const t = useTranslations('Community.Profile')
    const tc = useTranslations('Community')
    const tcmn = useTranslations('Common')

    const [selectedImage, setSelectedImage] = useState(user.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.fullName}`)
    const [customImage, setCustomImage] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        const formData = new FormData(e.currentTarget)
        if (imageFile) {
            formData.set('image', imageFile)
        } else {
            formData.set('image', selectedImage)
        }

        const res = await updateProfile(formData)

        if (res.success) {
            setSuccess(true)
            setTimeout(() => {
                router.push('/community')
                router.refresh()
            }, 1000)
        } else {
            setError(res.error || tcmn('Errors.UnexpectedError'))
            setLoading(false)
        }
    }

    const generateRandomAvatar = () => {
        const seed = Math.random().toString(36).substring(7)
        setSelectedImage(`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`)
    }

    return (
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
            <h1 className="text-3xl font-black text-black tracking-tighter mb-8">{t('EditTitle')}</h1>

            <form onSubmit={onSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 mb-4 group cursor-pointer">
                        <div
                            className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50 relative"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                            {(() => {
                                const imgSrc = previewImage || selectedImage;
                                return (imgSrc && imgSrc.trim() !== '') ? (
                                    <img src={imgSrc} alt="Avatar" className="w-full h-full object-cover" />
                                ) : null;
                            })()}
                        </div>

                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    // Preview
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                        setPreviewImage(reader.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                    // Store file
                                    setImageFile(file)
                                    // Reset other inputs
                                    setCustomImage('')
                                    setSelectedImage('')
                                }
                            }}
                        />

                        {/* Plus Button for Upload */}
                        <div
                            className="absolute bottom-1 right-1 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                document.getElementById('avatar-upload')?.click()
                            }}
                        >
                            <Plus className="w-4 h-4 text-white" />
                        </div>

                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <RefreshCw className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4 w-full justify-center flex-wrap">
                        {AVATAR_SEEDS.map((seed) => (
                            <button
                                key={seed}
                                type="button"
                                onClick={() => {
                                    const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;
                                    setSelectedImage(url);
                                    setPreviewImage(null);
                                    setImageFile(null);
                                    setCustomImage('');
                                }}
                                className={`w-8 h-8 rounded-full border-2 overflow-hidden transition-all ${selectedImage.includes(seed) && !previewImage ? 'border-black scale-110 shadow-lg' : 'border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`} alt={seed} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    <div className="w-full max-w-sm flex gap-2">
                        <input
                            type="url"
                            placeholder={t('CustomUrl')}
                            value={customImage}
                            onChange={(e) => {
                                setCustomImage(e.target.value);
                                if (e.target.value) {
                                    setSelectedImage(e.target.value);
                                    setPreviewImage(null);
                                    setImageFile(null);
                                }
                            }}
                            className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:bg-white focus:border-black transition-all"
                        />
                        {/* Removed Apply button as Input onChange handles it for preview, but strictly speaking we kept it in original. 
                             Let's keep the Apply button logic if desired, but user wants smooth Experience. 
                             I will keep the button but make it update main state. */}
                        <button
                            type="button"
                            onClick={() => {
                                if (customImage) {
                                    setSelectedImage(customImage);
                                    setPreviewImage(null);
                                    setImageFile(null);
                                }
                            }}
                            className="bg-black text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase"
                        >
                            {t('Apply')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nom */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{tc('FullName')}</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                name="fullName"
                                defaultValue={user.fullName}
                                required
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                            />
                        </div>
                    </div>

                    {/* Ville */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{tc('City')}</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none z-10" />
                            <select
                                name="city"
                                defaultValue={user.city}
                                required
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black appearance-none cursor-pointer"
                            >
                                <option value="" disabled>{tc('CityPlaceholder')}</option>
                                {MOROCCO_CITIES.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quartier */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('NeighborhoodLabel')}</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                name="neighborhood"
                                defaultValue={user.neighborhood || ''}
                                placeholder={t('NeighborhoodPlaceholder')}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                            />
                        </div>
                    </div>

                    {/* Adresse */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('AddressLabel')}</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                name="address"
                                defaultValue={user.address || ''}
                                placeholder={t('AddressPlaceholder')}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                            />
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('BioLabel')}</label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                        <textarea
                            name="bio"
                            defaultValue={user.bio || ''}
                            rows={3}
                            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black resize-none"
                            placeholder={t('BioPlaceholder')}
                        />
                    </div>
                </div>

                {/* Réseaux Sociaux */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-black">{t('Socials')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                name="instagram"
                                defaultValue={user.instagram || ''}
                                placeholder="@username"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-black outline-none text-xs font-bold"
                            />
                        </div>

                        <div className="relative">
                            <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                name="facebook"
                                defaultValue={user.facebook || ''}
                                placeholder="@username"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-black outline-none text-xs font-bold"
                            />
                        </div>

                        <div className="relative">
                            <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                name="twitter"
                                defaultValue={user.twitter || ''}
                                placeholder="@username"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-black outline-none text-xs font-bold"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2">
                        {t('Success')}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            <Save className="w-4 h-4" /> {t('Save')}
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
