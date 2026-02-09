import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.ardi.ma',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'admin@riwaya.com',
        pass: process.env.SMTP_PASS || 'admin123',
    },
})

export async function sendOrderConfirmation(order: any) {
    if (!order.email) return

    const itemsHtml = order.items.map((item: any) => `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <p><strong>${item.type === 'BOOK' ? (item.book?.title || 'Livre') : (item.pack?.name || 'Pack')}</strong></p>
            <p>Qté: ${item.quantity} x ${item.price} MAD</p>
        </div>
    `).join('')

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Merci pour votre commande !</h1>
            <p>Bonjour ${order.fullName},</p>
            <p>Nous avons bien reçu votre commande <strong>#${order.id.slice(0, 8)}</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h2>Détails de la commande</h2>
                ${itemsHtml}
                <p style="text-align: right; font-size: 18px;"><strong>Total : ${order.total} MAD</strong></p>
            </div>

            <p><strong>Mode de paiement :</strong> Paiement à la livraison</p>
            <p><strong>Adresse de livraison :</strong><br/>
            ${order.address}<br/>
            ${order.city}<br/>
            ${order.phone}</p>

            <p>Nous vous contacterons très bientôt pour confirmer la livraison.</p>
            
            <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
            
            <p style="color: #888; font-size: 12px;">
                Riwaya - Librairie en ligne<br/>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}">www.riwaya.com</a>
            </p>
        </div>
    `

    try {
        await transporter.sendMail({
            from: '"Riwaya" <admin@riwaya.com>',
            to: order.email,
            subject: `Confirmation de commande #${order.id.slice(0, 8)}`,
            html,
        })
        console.log(`Email de confirmation envoyé à ${order.email}`)
    } catch (error) {
        console.error('Erreur envoi email:', error)
    }
}

export async function sendOrderStatusUpdate(order: any, status: string) {
    if (!order.email) return

    let message = ''
    switch (status) {
        case 'CONFIRMED':
            message = 'Votre commande a été confirmée et est en cours de préparation.'
            break
        case 'SHIPPED':
            message = 'Votre commande a été expédiée ! Elle est en route vers chez vous.'
            break
        case 'DELIVERED':
            message = 'Votre commande a été livrée. Merci de votre confiance !'
            break
        case 'CANCELLED':
            message = 'Votre commande a été annulée.'
            break
        default:
            return
    }

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Mise à jour de votre commande</h1>
            <p>Bonjour ${order.fullName},</p>
            <p>Le statut de votre commande <strong>#${order.id.slice(0, 8)}</strong> a changé :</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <h2 style="color: #000; margin: 0;">${status}</h2>
                <p>${message}</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir ma commande</a>
        </div>
    `

    try {
        await transporter.sendMail({
            from: '"Riwaya" <admin@riwaya.com>',
            to: order.email,
            subject: `Mise à jour commande #${order.id.slice(0, 8)}: ${status}`,
            html,
        })
    } catch (error) {
        console.error('Erreur envoi email statut:', error)
    }
}
