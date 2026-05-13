'use client'

import { useState, useEffect } from 'react'
import { saveTranslationFile } from '@/lib/actions/translations'
import { Save, Search, CheckCircle, AlertCircle } from 'lucide-react'

// Helper to flatten object
const flattenObj = (ob: any) => {
    let result: any = {};
    for (const i in ob) {
        if ((typeof ob[i]) === 'object' && ob[i] !== null) {
            if (Array.isArray(ob[i])) {
                result[i] = JSON.stringify(ob[i]);
            } else {
                const temp = flattenObj(ob[i]);
                for (const j in temp) {
                    result[i + '.' + j] = temp[j];
                }
            }
        } else {
            result[i] = ob[i];
        }
    }
    return result;
};

// Helper to unflatten object
const unflattenObj = (ob: any) => {
    let result: any = {};
    for (const i in ob) {
        const keys = i.split('.');
        keys.reduce((acc, key, index) => {
            if (index === keys.length - 1) {
                let val = ob[i];
                if (typeof val === 'string' && val.trim().startsWith('[') && val.trim().endsWith(']')) {
                    try { val = JSON.parse(val); } catch (e) {}
                }
                acc[key] = val;
            } else {
                acc[key] = acc[key] || {};
            }
            return acc[key];
        }, result);
    }
    return result;
};

export default function TranslationManager({ initialData }: { initialData: any }) {
    const [lang, setLang] = useState<'fr'|'en'|'ar'>('fr');
    const [flatData, setFlatData] = useState<Record<string, any>>({
        fr: flattenObj(initialData.fr),
        en: flattenObj(initialData.en),
        ar: flattenObj(initialData.ar)
    });
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const unflattened = unflattenObj(flatData[lang]);
            const res = await saveTranslationFile(lang, unflattened);
            if (res.success) {
                setMessage({ type: 'success', text: 'Traductions sauvegardées avec succès !' });
                setTimeout(() => setMessage(null), 3000);
            }
            else setMessage({ type: 'error', text: 'Erreur: ' + res.error });
        } catch (e) {
            setMessage({ type: 'error', text: 'Erreur inattendue' });
        } finally {
            setSaving(false);
        }
    };

    const keys = Object.keys(flatData[lang]).filter(k => 
        k.toLowerCase().includes(search.toLowerCase()) || 
        String(flatData[lang][k]).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20 lg:pb-0">
            {/* Sticky Mobile Bar */}
            <div className={`lg:hidden fixed left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'top-[56px]' : 'top-[64px]'}`}>
                <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-xs font-bold text-gray-900 focus:ring-0 appearance-none"
                        />
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className={`p-2 rounded-xl shadow-lg transition-all active:scale-95 ${saving ? 'bg-gray-100 text-gray-400' : 'bg-black text-white'}`}
                    >
                        {saving ? <AlertCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Language Selector & Key Count */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2rem] w-fit mx-auto lg:mx-0 shadow-inner">
                    {['fr', 'en', 'ar'].map(l => (
                        <button 
                            key={l} 
                            onClick={() => setLang(l as any)}
                            className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-black'}`}
                        >
                            {l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'العربية'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-center lg:justify-end gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span className="bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                        {keys.length} <span className="text-gray-300 ml-1">Clés trouvées</span>
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-100">
                        Total {Object.keys(flatData[lang]).length}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-xl shadow-black/5 border border-gray-100">
                <div className="hidden lg:flex items-center justify-between gap-4 mb-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une clé ou un texte..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                        />
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex items-center gap-3 bg-black text-white px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-black/10 hover:bg-gray-800 active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:gap-6 pt-12 lg:pt-0">
                    {keys.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Search className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Aucun résultat pour "{search}"</p>
                            <button onClick={() => setSearch('')} className="mt-4 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Réinitialiser</button>
                        </div>
                    ) : (
                        keys.map(key => (
                            <div key={key} className="p-5 md:p-8 bg-gray-50/30 rounded-[2rem] border border-gray-100 focus-within:border-black focus-within:bg-white transition-all group">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[70%] group-hover:text-black transition-colors" title={key}>{key}</label>
                                    <div className="flex items-center gap-2">
                                        {lang === 'ar' && (
                                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">RTL Mode</span>
                                        )}
                                        <div className="w-2 h-2 rounded-full bg-gray-200 group-focus-within:bg-blue-500" />
                                    </div>
                                </div>
                                
                                {typeof flatData[lang][key] === 'string' && flatData[lang][key].length > 80 ? (
                                    <textarea 
                                        value={flatData[lang][key]}
                                        onChange={e => setFlatData(prev => ({...prev, [lang]: {...prev[lang], [key]: e.target.value}}))}
                                        className="w-full bg-white border-2 border-transparent rounded-[1.5rem] p-6 text-sm font-bold text-black outline-none focus:border-black min-h-[140px] transition-all shadow-sm group-hover:shadow-md"
                                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                ) : (
                                    <input 
                                        type="text"
                                        value={typeof flatData[lang][key] === 'string' ? flatData[lang][key] : ''}
                                        onChange={e => setFlatData(prev => ({...prev, [lang]: {...prev[lang], [key]: e.target.value}}))}
                                        className="w-full bg-white border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-bold text-black outline-none focus:border-black transition-all shadow-sm group-hover:shadow-md"
                                        disabled={typeof flatData[lang][key] !== 'string'}
                                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {message && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-bottom-10 z-[70] ${message.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-white/20'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-white" />}
                    </div>
                    {message.text}
                </div>
            )}
        </div>
    )
}
