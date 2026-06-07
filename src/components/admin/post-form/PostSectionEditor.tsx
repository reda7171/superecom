'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Sparkles, Loader2, Package as BookIcon } from 'lucide-react'
import { generatePostContent } from '@/lib/actions/gemini'

export interface Section {
    id: string
    title: string
    content: string
}

interface PostSectionEditorProps {
    initialContent: string
    onChange: (content: string) => void
    lang: 'fr' | 'ar' | 'en'
    postTitle: string
}

const BOOK_TEMPLATE_SECTIONS: Section[] = [
    { id: '1', title: 'Introduction', content: '[Présentation rapide du livre et pourquoi il mérite l\'attention]' },
    { id: '2', title: 'Informations générales', content: '- **Titre :** \n- **Auteur :** \n- **Genre :** \n- **Date de publication :** \n- **Nombre de pages :** \n- **Éditeur :** \n- **Série / tome :** \n- **Langue originale :** ' },
    { id: '3', title: 'Résumé du livre', content: '[Résumé court sans spoiler]' },
    { id: '4', title: 'Les personnages', content: '- **Personnage principal :** \n- **Personnages secondaires :** ' },
    { id: '5', title: 'Les thèmes abordés', content: '- [Thème 1]\n- [Thème 2]' },
    { id: '6', title: 'Style d\'écriture', content: '[Fluidité, narration, dialogues, etc.]' },
    { id: '7', title: 'Les points forts', content: '- ' },
    { id: '8', title: 'Les points faibles', content: '- ' },
    { id: '9', title: 'Citation(s) marquante(s)', content: '> " "' },
    { id: '10', title: 'Analyse / interprétation', content: '[Symbolisme, message caché, etc.]' },
    { id: '11', title: 'Comparaison', content: '[Si vous avez aimé X, vous aimerez Y]' },
    { id: '12', title: 'Pour quel type de lecteur ?', content: '[Débutants, fans de fantasy, etc.]' },
    { id: '13', title: 'Note finale / avis personnel', content: '- **Histoire :** /5\n- **Personnages :** /5\n- **Style :** /5\n- **Immersion :** /5\n- **Fin :** /5\n\n**Note globale : ⭐ /5**' },
    { id: '14', title: 'FAQ', content: '- **Le livre vaut-il le coup ?** \n- **Y a-t-il des spoilers ?** \n- **À partir de quel âge ?** ' }
]

export default function PostSectionEditor({ initialContent, onChange, lang, postTitle }: PostSectionEditorProps) {
    const [sections, setSections] = useState<Section[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

    // Parse initial content only once
    useEffect(() => {
        if (!initialContent) {
            setSections([{ id: Date.now().toString(), title: '', content: '' }])
            return
        }

        // Try to parse markdown into sections
        const parts = initialContent.split(/^(?=#+ )/m)
        const parsedSections: Section[] = parts.map((part, index) => {
            const match = part.match(/^(#+)\s+(.*)\n([\s\S]*)$/)
            if (match) {
                return { id: String(Date.now() + index), title: match[2], content: match[3].trim() }
            }
            return { id: String(Date.now() + index), title: '', content: part.trim() }
        })

        if (parsedSections.length === 0) {
            parsedSections.push({ id: Date.now().toString(), title: '', content: '' })
        }

        setSections(parsedSections)
    }, [])

    // Update parent when sections change
    useEffect(() => {
        if (sections.length === 0) return
        const markdown = sections.map(s => {
            if (s.title) {
                return `## ${s.title}\n\n${s.content}`
            }
            return s.content
        }).join('\n\n')
        onChange(markdown)
    }, [sections])

    const handleAddSection = () => {
        setSections([...sections, { id: Date.now().toString(), title: '', content: '' }])
    }

    const handleRemoveSection = (id: string) => {
        if (sections.length <= 1) return
        setSections(sections.filter(s => s.id !== id))
    }

    const handleSectionChange = (id: string, field: keyof Section, value: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    const handleApplyTemplate = () => {
        if (sections.some(s => s.content.trim() !== '') && !confirm('Cela remplacera le contenu actuel. Continuer ?')) return
        setSections(BOOK_TEMPLATE_SECTIONS.map(s => ({ ...s, id: Date.now() + Math.random().toString() })))
    }

    const handleGenerateContent = async (langToUse: 'fr' | 'ar') => {
        if (!postTitle) {
            alert('Veuillez d\'abord saisir un titre d\'article.')
            return
        }
        setIsGenerating(true)
        try {
            const result = await generatePostContent(postTitle, langToUse, 'CONTENT')
            if (result.success && result.content) {
                // Parse the generated markdown
                const parts = result.content.split(/^(?=#+ )/m)
                const parsedSections: Section[] = parts.map((part, index) => {
                    const match = part.match(/^(#+)\s+(.*)\n([\s\S]*)$/)
                    if (match) {
                        return { id: String(Date.now() + index), title: match[2], content: match[3].trim() }
                    }
                    return { id: String(Date.now() + index), title: '', content: part.trim() }
                })
                setSections(parsedSections)
            } else {
                alert(result.error || 'Erreur lors de la génération')
            }
        } catch (err) {
            alert('Erreur lors de la génération')
        } finally {
            setIsGenerating(false)
        }
    }

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections]
        if (direction === 'up' && index > 0) {
            [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]
            setSections(newSections)
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]]
            setSections(newSections)
        }
    }

    return (
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.03] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Contenu de l'article</h3>
                    <p className="text-sm text-gray-500 mt-1">Gérez le contenu par sections pour plus de clarté.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleApplyTemplate}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200 flex items-center gap-2"
                    >
                        <BookIcon className="w-4 h-4" />
                        Template Livre
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGenerateContent('ar')}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50 border border-green-200 flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Générer AR
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGenerateContent('fr')}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 border border-blue-200 flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Générer FR
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {sections.map((section, index) => (
                    <div 
                        key={section.id} 
                        className={`group relative bg-[#faf9f8] border transition-all duration-200 rounded-3xl overflow-hidden
                            ${activeSectionId === section.id ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                        onFocus={() => setActiveSectionId(section.id)}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setActiveSectionId(null)
                            }
                        }}
                    >
                        <div className="absolute left-4 top-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                            <button 
                                type="button" 
                                onClick={() => moveSection(index, 'up')}
                                disabled={index === 0}
                                className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-30"
                            >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            <button 
                                type="button" 
                                onClick={() => moveSection(index, 'down')}
                                disabled={index === sections.length - 1}
                                className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-30"
                            >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <div className="pl-14 p-6 sm:p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                                    placeholder="Titre de la section (ex: Introduction)"
                                    className="flex-1 bg-transparent border-none text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0 p-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSection(section.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <textarea
                                value={section.content}
                                onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                                rows={Math.max(4, section.content.split('\n').length)}
                                placeholder="Contenu de la section (Markdown supporté)..."
                                className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-sans text-base text-gray-800 placeholder:text-gray-300 resize-y leading-[1.8]"
                                style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={handleAddSection}
                className="w-full py-6 border-2 border-dashed border-gray-200 rounded-3xl text-gray-500 font-bold hover:bg-gray-50 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Ajouter une section
            </button>
        </div>
    )
}
