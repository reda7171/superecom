import { prisma } from '@/lib/prisma'
import HeaderWithUser from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { ArrowLeft, ShoppingCart, Truck, Shield, Package, CheckCircle2, Briefcase, HelpCircle, Heart, Star, Sparkles } from 'lucide-react'
import AddToCartButton from '@/components/AddToCartButton'
import WhatsAppOrderButton from '@/components/WhatsAppOrderButton'
import { getSetting } from '@/lib/actions/site-settings'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id } = await params
    const product = await prisma.extraProduct.findUnique({
        where: { id },
    })
    
    const t = await getTranslations('KidsProductDetail')

    if (!product) {
        return {
            title: t('NotFoundTitle'),
        }
    }

    return {
        title: `${product.name} | Riwaya`,
        description: product.description || t('MetaDesc', { name: product.name }),
    }
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id, locale } = await params
    const product = await prisma.extraProduct.findUnique({
        where: { id },
    })

    if (!product) {
        notFound()
    }

    const t = await getTranslations('KidsProductDetail')

    // Récupérer les produits recommandés (autres que le produit actuel)
    const suggestedProducts = await prisma.extraProduct.findMany({
        where: { active: true, category: 'KIDS', id: { not: id } },
        take: 4,
        orderBy: { createdAt: 'desc' }
    })

    const whatsappPhone = await getSetting('contact_whatsapp')

    const categoryLabels: Record<string, string> = {
        FURNITURE: t('Categories.FURNITURE'),
        BOOKMARK: t('Categories.BOOKMARK'),
        LIBRARY: t('Categories.LIBRARY'),
        USB: t('Categories.USB'),
        ACCESSORY: t('Categories.ACCESSORY'),
        KIDS: t('Categories.KIDS'),
    }

    const categoryLabel = categoryLabels[product.category] || t('Categories.KIDS')

    // Spécifications techniques dynamiques ou basées sur la catégorie par défaut
    const productSpecs = [
        { label: t('Material'), value: product.materials || (product.category === 'BOOKMARK' ? 'Métal ciselé / Cuir' : 'Premium') },
        { label: t('Dimensions'), value: product.dimensions || (product.category === 'BOOKMARK' ? '12 x 3 cm' : 'Standard') },
        { label: t('WeightCapacity'), value: product.weight || (product.category === 'USB' ? '64 Go' : 'Standard') },
        { label: t('Warranty'), value: product.warranty || t('QualityGuarantee') },
    ]

    return (
        <div className="min-h-screen bg-[#FAFAF9]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <HeaderWithUser />

            <div className="max-w-6xl mx-auto px-4 py-12 pb-32">
                {/* Bouton Retour */}
                <Link
                    href="/mon-enfant"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    <span>{t('BackToKids')}</span>
                </Link>

                {/* ──────── SECTION PRINCIPALE PRODUIT ──────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
                    {/* Colonne Image */}
                    <div>
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-8">
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <Package className="w-20 h-20 text-slate-200" />
                                    </div>
                                )}

                                {/* Badges */}
                                {product.stock <= 5 && product.stock > 0 && (
                                    <div className="absolute top-4 rtl:right-4 ltr:left-4 z-10">
                                        <span className="px-3 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full shadow-md uppercase tracking-wider animate-pulse">
                                            {t('StockLeft', { stock: product.stock })}
                                        </span>
                                    </div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <span className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl uppercase tracking-widest">
                                            {t('OutOfStock')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Badges de confiance */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
                                <div className="group cursor-pointer">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-amber-600 group-hover:scale-110 transition-transform">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t('DeliverySpeed')}</p>
                                </div>
                                <div className="group cursor-pointer">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t('PaymentCOD')}</p>
                                </div>
                                <div className="group cursor-pointer">
                                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-sky-600 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t('QualityGuarantee')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colonne Infos */}
                    <div className="flex flex-col justify-center gap-8">
                        <div>
                            {/* Catégorie */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-4 shadow-sm">
                                <Briefcase className="w-3.5 h-3.5" />
                                {categoryLabel}
                            </div>

                            {/* Titre */}
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3">
                                {product.name}
                            </h1>
                            
                            {/* Note / Avis Simulés Premium */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center text-amber-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-xs text-slate-500 font-bold">{t('ExcellentRating')}</span>
                            </div>
                        </div>

                        {/* Prix */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900">{product.price.toFixed(2)}</span>
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">DH</span>
                        </div>

                        {/* Boutons d'achat */}
                        <div className="space-y-4">
                            {product.stock > 0 ? (
                                <>
                                    <WhatsAppOrderButton
                                        title={product.name}
                                        price={product.price}
                                        phone={whatsappPhone || undefined}
                                        type="accessory"
                                    />
                                    <AddToCartButton
                                        product={{
                                            id: product.id,
                                            title: product.name,
                                            price: product.price,
                                            image: product.image ?? '',
                                            type: 'ACCESSORY'
                                        }}
                                        className="w-full !py-6 text-xs uppercase tracking-[0.2em] font-black !rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
                                    />
                                </>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-4 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl cursor-not-allowed text-center"
                                >
                                    {t('OutOfStock')}
                                </button>
                            )}
                        </div>

                        {/* Description principale */}
                        {product.description && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-amber-500" />
                                    {t('ProductPresentation')}
                                </h3>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-line shadow-sm">
                                    {product.description}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ──────── NOUVELLE SECTION: SPÉCIFICATIONS TECHNIQUES ──────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            {t('TechSpecs')}
                        </h3>
                        <dl className="space-y-4">
                            {productSpecs.map((spec, i) => (
                                <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0">
                                    <dt className="text-xs font-bold text-slate-400">{spec.label}</dt>
                                    <dd className="text-xs font-black text-slate-800">{spec.value}</dd>
                                </div>
                            ))}
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0">
                                <dt className="text-xs font-bold text-slate-400">{t('Availability')}</dt>
                                <dd className="text-xs font-black text-emerald-600">{product.stock > 0 ? t('InStock') : t('OnOrder')}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* ──────── NOUVELLE SECTION: LIVRAISON & SERVICE ──────── */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-500" />
                            {t('DeliveryGuarantee')}
                        </h3>
                        <div className="space-y-4 text-slate-600 text-xs leading-relaxed">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">1</div>
                                <p>{t('DeliveryGuaranteeDesc1')}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">2</div>
                                <p>{t('DeliveryGuaranteeDesc2')}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">3</div>
                                <p>{t('DeliveryGuaranteeDesc3')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ──────── SECTION: PRODUITS RECOMMANDÉS (CROSS-SELL) ──────── */}
                {suggestedProducts.length > 0 && (
                    <section className="border-t border-slate-200 pt-16">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('YouMightAlsoLike')}</h2>
                            <Link href="/mon-enfant" className="text-xs font-black text-amber-600 hover:text-amber-700 bg-white border border-slate-100 shadow-sm px-5 py-2.5 rounded-xl transition-all">
                                {t('SeeAll')}
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {suggestedProducts.map(sProd => {
                                const sCategoryLabel = categoryLabels[sProd.category] || t('Categories.KIDS')
                                return (
                                    <div key={sProd.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
                                        <Link href={`/mon-enfant/${sProd.id}`} className="flex flex-col flex-grow">
                                            <div className="relative aspect-video w-full bg-slate-50 border-b border-slate-50">
                                                {sProd.image ? (
                                                    <Image
                                                        src={sProd.image}
                                                        alt={sProd.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-slate-200" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex flex-col flex-grow">
                                                <span className="text-[10px] font-bold text-amber-600 mb-1">{sCategoryLabel}</span>
                                                <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2 mb-2">{sProd.name}</h4>
                                                <span className="text-sm font-black text-slate-950 mt-auto">{sProd.price.toFixed(2)} DH</span>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </div>
    )
}
