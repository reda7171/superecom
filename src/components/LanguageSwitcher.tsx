'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition, useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';

import { updateUserLocale } from '@/lib/actions/locale';

export default function LanguageSwitcher({ upward = false }: { upward?: boolean } = {}) {
    const params = useParams();
    const locale = (params?.locale as string) || 'fr';
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' },
        { code: 'ar', label: 'العربية' },
    ];

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    const handleChange = async (newLocale: string) => {
        setIsOpen(false);
        await updateUserLocale(newLocale);
        startTransition(() => {
            router.replace(pathname, { locale: newLocale });
        });
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-100 hover:border-gray-200 transition-colors bg-white group"
            >
                <div className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <Globe className="w-3 h-3 text-black" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                    {locale}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute ${upward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-200`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            disabled={isPending}
                            onClick={() => handleChange(lang.code)}
                            className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-between ${locale === lang.code ? 'text-black bg-gray-50/50' : 'text-gray-400'
                                }`}
                        >
                            <span>{lang.label}</span>
                            {locale === lang.code && (
                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
