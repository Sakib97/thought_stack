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
};

const BOT_USER_AGENTS = [
    /Googlebot/i, /Bingbot/i, /facebookexternalhit/i, /twitterbot/i,
    /linkedinbot/i, /slurp/i, /duckduckbot/i, /yandexbot/i,
    /facebot/i, /ia_archiver/i, /telegrambot/i, /whatsapp/i,
    /discordbot/i, /applebot/i,
];

const SITE_URL = "https://thought-stack.vercel.app";

export default async function handler(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const userAgent = req.headers.get("user-agent") || "";

    // const match = pathname.match(/^\/api\/article\/([^/]+)\/?.*/);
    const match = pathname.match(/^(?:\/api)?\/article\/([^/]+)\/?.*/);
    if (!match) return new Response("OK", { status: 200 });

    const encodedId = match[1];
    const decodedId = decodeId(encodedId);
    const isBot = BOT_USER_AGENTS.some((r) => r.test(userAgent));

    const originalPath = pathname.replace(/^\/api/, '/article');

    // Helper to fetch and serve SPA index.html
    async function serveSPA() {
        try {
            const indexUrl = new URL('/index.html', url);
            const indexRes = await fetch(indexUrl);
            if (!indexRes.ok) {
                throw new Error(`Failed to fetch index.html: ${indexRes.status}`);
            }
            const html = await indexRes.text();
            return new Response(html, {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    ...indexRes.headers,  // Preserve cache/etag if any
                },
            });
        } catch (err) {
            console.error("Failed to serve SPA:", err);
            return new Response("SPA not found", { status: 500 });
        }
    }

    if (!isBot) {
        return serveSPA();
    }

    try {
        const { data: article, error } = await supabase
            .from("articles")
            .select("title_en, subtitle_en, cover_img_link")
            .eq("id", decodedId)
            .single();

        if (error || !article) {
            console.error("Article not found:", error);
            return serveSPA();  // Fallback to SPA for client-side 404
        }

        const title = article.title_en || "Thought Stack Article";
        const description = article.subtitle_en || "Read this article on our site.";
        const image = article.cover_img_link || "https://placehold.co/600x400/png/?text=Thought+Stack";

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${SITE_URL}${originalPath}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${SITE_URL}${originalPath}" />
    <meta property="og:site_name" content="Thought Stack" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    <meta http-equiv="refresh" content="0; url=${SITE_URL}${originalPath}">
</head>
<body>
    <p>Redirecting to the article...</p>
</body>
</html>
        `;

        return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    } catch (err) {
        console.error("Handler error:", err);
        return serveSPA();  // Fallback to SPA on error
    }
}