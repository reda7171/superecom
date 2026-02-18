import { prisma } from '@/lib/prisma'

async function seedSettings() {
    console.log('🌱 Seeding site settings...')

    const defaultSettings = [
        // Réseaux sociaux
        { key: 'social_instagram', value: 'https://instagram.com/riwaya', category: 'social', description: 'Lien Instagram' },
        { key: 'social_facebook', value: 'https://facebook.com/riwaya', category: 'social', description: 'Lien Facebook' },
        { key: 'social_twitter', value: 'https://twitter.com/riwaya', category: 'social', description: 'Lien Twitter/X' },
        { key: 'social_linkedin', value: 'https://linkedin.com/company/riwaya', category: 'social', description: 'Lien LinkedIn' },

        // Contact
        { key: 'contact_phone', value: '+212 600 000 000', category: 'contact', description: 'Téléphone principal' },
        { key: 'contact_email', value: 'contact@riwaya.com', category: 'contact', description: 'Email de contact' },
        { key: 'contact_address', value: 'Casablanca, Maroc', category: 'contact', description: 'Adresse physique' },
        { key: 'contact_whatsapp', value: '+212 600 000 000', category: 'contact', description: 'WhatsApp' },
    ]

    for (const setting of defaultSettings) {
        await prisma.siteSettings.upsert({
            where: { key: setting.key },
            update: setting,
            create: setting
        })
    }

    console.log('✅ Site settings seeded successfully!')
}

seedSettings()
    .catch((e) => {
        console.error('❌ Error seeding settings:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
