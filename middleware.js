import { NextResponse } from 'next/server';

export const config = {
    matcher: '/article/:path*',
};

const BOT_USER_AGENTS = [
    /Googlebot/i, /Bingbot/i, /facebookexternalhit/i, /twitterbot/i,
    /linkedinbot/i, /slurp/i, /duckduckbot/i, /yandexbot/i,
    /facebot/i, /ia_archiver/i, /telegrambot/i, /whatsapp/i,
    /discordbot/i, /applebot/i, /slackbot/i, /redditbot/i,
];

export function middleware(request) {
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = BOT_USER_AGENTS.some((r) => r.test(userAgent));

    console.log('[Middleware] Path:', request.nextUrl.pathname);
    console.log('[Middleware] User-Agent:', userAgent);
    console.log('[Middleware] Is Bot:', isBot);

    // If it's a bot, rewrite to the API endpoint
    if (isBot) {
        const url = request.nextUrl.clone();
        url.pathname = `/api${url.pathname}`;
        console.log('[Middleware] Rewriting to:', url.pathname);
        return NextResponse.rewrite(url);
    }

    // For regular users, continue normally
    return NextResponse.next();
}
