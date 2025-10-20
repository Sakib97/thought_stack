import { createClient } from '@supabase/supabase-js';
import Hashids from 'hashids';

const secret_key = process.env.VITE_HASHID_SECRET;
const hashids = new Hashids(secret_key, 7);

function decodeId(hash) {
    const decoded = hashids.decode(hash);
    return decoded.length ? decoded[0] : null;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
    runtime: "edge",
    matcher: "/article/:id*",
};

const BOT_USER_AGENTS = [
    /Googlebot/i, /Bingbot/i, /facebookexternalhit/i, /twitterbot/i,
    /linkedinbot/i, /slurp/i, /duckduckbot/i, /yandexbot/i,
    /facebot/i, /ia_archiver/i, /telegrambot/i, /whatsapp/i,
    /discordbot/i, /applebot/i, /slackbot/i, /redditbot/i,
];

const SITE_URL = "https://thought-stack.vercel.app";

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

export default async function middleware(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const userAgent = req.headers.get("user-agent") || "";

    console.log("[Middleware] Pathname:", pathname);
    console.log("[Middleware] User-Agent:", userAgent);

    // Only handle /article/* routes
    const match = pathname.match(/^\/article\/([^/]+)\/?$/);
    if (!match) {
        console.log("[Middleware] No match, continuing...");
        return; // Continue to next middleware/handler
    }

    const encodedId = match[1];
    const decodedId = decodeId(encodedId);
    const isBot = BOT_USER_AGENTS.some((r) => r.test(userAgent));

    console.log("[Middleware] Encoded ID:", encodedId);
    console.log("[Middleware] Decoded ID:", decodedId);
    console.log("[Middleware] Is Bot:", isBot);

    // If not a bot, let the SPA handle it
    if (!isBot) {
        console.log("[Middleware] Not a bot, serving SPA");
        return;
    }

    // For bots, generate meta tags
    try {
        const { data: article, error } = await supabase
            .from("articles")
            .select("title_en, subtitle_en, cover_img_link")
            .eq("id", decodedId)
            .single();

        if (error || !article) {
            console.error("[Middleware] Article not found:", error);
            return; // Let SPA handle 404
        }

        const title = article.title_en || "Thought Stack Article";
        const description = article.subtitle_en || "Read this article on our site.";
        const image = article.cover_img_link || "https://placehold.co/600x400/png/?text=Thought+Stack";

        const safeTitle = escapeHtml(title);
        const safeDescription = escapeHtml(description);

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${SITE_URL}${pathname}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${SITE_URL}${pathname}" />
    <meta property="og:site_name" content="Thought Stack" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${image}" />
</head>
<body>
    <h1>${safeTitle}</h1>
    <p>${safeDescription}</p>
    <p><a href="${SITE_URL}${pathname}">Read the full article</a></p>
</body>
</html>
        `;

        return new Response(html, {
            status: 200,
            headers: { 
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (err) {
        console.error("[Middleware] Error:", err);
        return; // Let SPA handle errors
    }
}
