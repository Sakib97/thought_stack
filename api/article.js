import { createClient } from '@supabase/supabase-js';
import Hashids from 'hashids';

// 1. **CORRECTION:** Use process.env for Vercel Edge Environment Variables
const secret_key = process.env.VITE_HASHID_SECRET;
const hashids = new Hashids(secret_key, 7); 

function decodeId(hash) {
  const decoded = hashids.decode(hash);
  return decoded.length ? decoded[0] : null;
}

// 2. **CORRECTION:** Use process.env for Supabase config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Use ANON_KEY for read-only access

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

  // The path comes in as /api/article/ORogKoz/just-add-your-name (due to vercel.json rewrite)
  const match = pathname.match(/^\/api\/article\/([^/]+)\/?.*/);
  if (!match) return new Response("OK", { status: 200 });

  const encodedId = match[1];
  const decodedId = decodeId(encodedId);
  const isBot = BOT_USER_AGENTS.some((r) => r.test(userAgent));

  // The original user path to redirect to: /article/ORogKoz/just-add-your-name
  const originalPath = pathname.replace("/api", ""); 

  if (!isBot) {
    // 3. **RECOMMENDED:** Redirect normal users to the correct final URL to prevent 
    // them from seeing the 'Redirecting...' page when testing the API path directly.
    return new Response(null, { status: 200 });
  }

  try {
    const { data: article, error } = await supabase
      .from("articles")
      .select("title_en, subtitle_en, cover_img_link")
      .eq("id", decodedId)
      .single();

    if (error || !article) {
      console.error("Article not found:", error);
      // Return a 200/404 response that lets the SPA load its own 404 page
      return new Response(null, { status: 200 }); 
    }

    // ... (title, description, image generation logic remains the same)
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
          <link rel="canonical" href="${SITE_URL}${originalPath}" /> <meta property="og:type" content="article" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${SITE_URL}${originalPath}" />

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
    return new Response("Server error", { status: 500 });
  }
}