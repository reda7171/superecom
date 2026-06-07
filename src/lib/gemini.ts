import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSetting } from "@/lib/actions/site-settings";
import { prisma } from "@/lib/prisma";

export async function getGeminiModel() {
  const apiKey = (await getSetting("gemini_api_key")) || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: `Tu es l'assistant intelligent de SuperEcom, une librairie en ligne au Maroc.
    Tes réponses doivent être chaleureuses, utiles et professionnelles.
    
    INFOS CLÉS :
    - Livraison : 2 à 4 jours ouvrés au Maroc.
    - Frais : 30 DH à domicile, Gratuit dès 500 DH d'achat.
    - Paiement : Uniquement Paiement à la Livraison (Cash on Delivery - COD).
    
    CAPACITÉS :
    - Tu as accès au catalogue de livres et aux commandes.
    - Si tu donnes des infos sur un livre, utilise un ton enthousiaste.
    - Si l'utilisateur cherche un livre, aide-le à le trouver.
    
    RÈGLES :
    - Réponds en français ou en arabe selon la langue de l'utilisateur.
    - Ne mentionne jamais que tu es une IA ou un modèle de langage. Tu es "l'Assistant SuperEcom".
    - Sois concis.`
  });
}

export async function chatWithDatabase(message: string, locale: string = 'fr') {
  try {
    const model = await getGeminiModel();
    const msg = message.toLowerCase().trim();

    // Gestion rapide des salutations pour économiser des ressources
    const greetings = ['bonjour', 'salut', 'salam', 'hello', 'hey', 'صباح', 'مرحبا'];
    if (greetings.some(g => msg === g || msg.startsWith(g + ' '))) {
      const welcome = locale === 'ar' 
        ? "مرحباً! ✨ أنا المساعد الذكي لـ **رواية**. كيف يمكنني مساعدتك اليوم؟" 
        : "Bonjour ! ✨ Je suis l'assistant intelligent de **SuperEcom**. Comment puis-je vous aider aujourd'hui ?";
      return { text: welcome, type: undefined, data: undefined };
    }

    let context = "";
    let dataType: 'products' | 'order' | undefined;
    let data: any;

    // 1. Détection d'intention pour le contexte DB
    if (msg.includes("commande") || msg.includes("suivi") || msg.includes("طلب") || msg.includes("تتبع")) {
      const orderMatch = msg.match(/(?:(?:commande|suivi|طلب|تتبع)[:\s#]*|#)([a-f0-9-]{6,})/i);
      if (orderMatch) {
        const orderId = orderMatch[1];
        const order = await prisma.order.findFirst({
          where: { id: { startsWith: orderId } },
          select: { id: true, fullName: true, total: true, status: true, createdAt: true, city: true }
        });
        if (order) {
          context = `CONTEXTE COMMANDE : L'utilisateur consulte la commande #${order.id}. Client: ${order.fullName}, Statut: ${order.status}, Ville: ${order.city}, Total: ${order.total} MAD. Date: ${order.createdAt.toLocaleDateString()}.`;
          dataType = 'order';
          data = order;
        } else {
          context = `CONTEXTE : L'utilisateur cherche la commande "${orderId}" mais elle n'existe pas.`;
        }
      }
    } else if (msg.length > 3) {
      // Recherche de livres
      const products = await prisma.product.findMany({
        where: { 
          OR: [
            { title: { contains: message } },
            { author: { contains: message } }
          ],
          active: true 
        },
        take: 5,
        select: { id: true, title: true, author: true, price: true, image: true }
      });

      if (products.length > 0) {
        context = `CONTEXTE LIVRES TROUVÉS :\n${products.map(b => `- ${b.title} par ${b.author} (${b.price} MAD). ID: ${b.id}`).join("\n")}`;
        dataType = 'products';
        data = products;
      }
    }

    const prompt = context 
      ? `CONTEXTE : ${context}\n\nCONSIGNE : Réponds au message suivant de manière concise en utilisant le contexte si pertinent.\nMESSAGE : ${message}` 
      : message;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { text, type: dataType, data };
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return { text: "Désolé, je rencontre une petite difficulté technique. Réessayez dans un instant ! ✨", type: undefined, data: undefined };
  }
}

export async function generateText(prompt: string) {
  try {
    const model = await getGeminiModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini generateText error:", error);
    throw error;
  }
}
