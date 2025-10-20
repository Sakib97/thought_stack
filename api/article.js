import { supabase } from "../src/config/supabaseClient.js";
import { decodeId } from "../src/utils/hashUtil.js";

export const config = {
  runtime: "edge", // ✅ tells Vercel this is an Edge Function
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

  // ✅ Expect /api/article/:encodedId/:slug
  const match = pathname.match(/^\/api\/article\/([^/]+)\/?.*/);
  if (!match) return new Response("OK", { status: 200 });

  const encodedId = match[1];
  const decodedId = decodeId(encodedId);
  const isBot = BOT_USER_AGENTS.some((r) => r.test(userAgent));

  if (!isBot) {
    return new Response("Normal user", { status: 200 });
  }

  try {
    const { data: article, error } = await supabase
      .from("articles")
      .select("title_en, subtitle_en, cover_img_link")
      .eq("id", decodedId)
      .single();

    if (error || !article) {
      console.error("Article not found:", error);
      return new Response("Not found", { status: 404 });
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

          <meta property="og:type" content="article" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${SITE_URL}${pathname.replace("/api", "")}" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${image}" />
        </head>
        <body>
          <p>Redirecting...</p>
          <script>window.location.href = "${SITE_URL}${pathname.replace("/api", "")}"</script>
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
