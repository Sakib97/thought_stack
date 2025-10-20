export const config = {
    matcher: '/article/:path*',
};

const BOT_USER_AGENTS = [
    /Googlebot/i, /Bingbot/i, /facebookexternalhit/i, /twitterbot/i,
    /linkedinbot/i, /slurp/i, /duckduckbot/i, /yandexbot/i,
    /facebot/i, /ia_archiver/i, /telegrambot/i, /whatsapp/i,
    /discordbot/i, /applebot/i, /slackbot/i, /redditbot/i,
];

export default async function middleware(request) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = BOT_USER_AGENTS.some((r) => r.test(userAgent));

    console.log('[Middleware] Path:', url.pathname);
    console.log('[Middleware] User-Agent:', userAgent);
    console.log('[Middleware] Is Bot:', isBot);

    // If it's a bot, rewrite to the API endpoint
    if (isBot) {
        const apiUrl = new URL(request.url);
        apiUrl.pathname = `/api${url.pathname}`;
        console.log('[Middleware] Rewriting to:', apiUrl.pathname);
        return fetch(apiUrl, request);
    }

    // For regular users, continue normally (return nothing to pass through)
    return;
}
