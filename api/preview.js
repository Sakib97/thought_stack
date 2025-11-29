import { createClient } from '@supabase/supabase-js';
import Hashids from 'hashids';

// Node.js compatible environment variable access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const hashidSecret = process.env.VITE_HASHID_SECRET;

// Initialize Supabase client for serverless environment
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Hashids with the same config as hashUtil.js
const hashids = new Hashids(hashidSecret, 7);

// Node.js compatible decodeId function
function decodeId(hash) {
    try {
        const decoded = hashids.decode(hash);
        return decoded.length ? decoded[0] : null;
    } catch (error) {
        console.error("Error decoding hash:", error);
        return null;
    }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper function to create the HTML meta tags
function generateMetaTags(data, originalUrl) {
    // Create default tags for homepage or errors
    let title = "The Fountainhead";
    let description = "Read and engage with thought-provoking articles.";
    let image = "https://thought-stack.vercel.app/logo3.png";

    // If we have specific post data, override the defaults
    if (data && data.title_en) {
        title = escapeHtml(data.title_en);
        description = escapeHtml(data.subtitle_en || data.title_en);
        image = data.cover_img_link || image;
    }

    const tags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${data ? 'Article Cover' : 'The Fountainhead Logo'}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${originalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="The Fountainhead" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  `;

    return tags;
}

// Main serverless function handler
export default async function handler(request, response) {
    const { path } = request.query;

    let articleData = null;

    // Derive host and protocol dynamically to work on previews/custom domains
    const forwardedProto = request.headers['x-forwarded-proto'] || 'https';
    const proto = Array.isArray(forwardedProto)
        ? forwardedProto[0]
        : String(forwardedProto).split(',')[0];
    const host = request.headers['x-forwarded-host'] || request.headers.host || 'thought-stack.vercel.app';
    const baseUrl = `${proto}://${host}`;
    let originalUrl = `${baseUrl}/${path || ''}`;

    try {
        // Fixed regex - path parameter doesn't include leading slash in Vercel
        const articleRegex = /^article\/([a-zA-Z0-9_-]+)/;
        const match = path ? path.match(articleRegex) : null;
        
        if (match && match[1]) {
            const encodedId = match[1];
            const articleId = decodeId(encodedId);

            // Only fetch if we have a valid decoded ID
            if (articleId) {
                // Fetch article data from Supabase with timeout
                const fetchPromise = supabase
                    .from('articles_secure')
                    .select('title_en, subtitle_en, cover_img_link')
                    .eq('id', articleId)
                    .single();

                // Add 5 second timeout
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Supabase query timeout')), 5000)
                );

                // Gracefully handle timeouts/errors so we can still inject default tags
                try {
                    const result = await Promise.race([fetchPromise, timeoutPromise]);
                    const { data, error } = result || {};
                    if (error) {
                        console.error('Error fetching article data:', error);
                    } else if (data) {
                        articleData = data;
                    }
                } catch (raceError) {
                    console.warn('Supabase query failed or timed out:', raceError?.message || raceError);
                    // Continue with defaults (articleData stays null)
                }
            } else {
                console.warn("Invalid encoded ID:", encodedId);
            }
        }

        // Fetch SPA's index.html file
        const spaUrl = `${baseUrl}/index.html`;
        const spaResponse = await fetch(spaUrl);
        
        if (!spaResponse.ok) {
            throw new Error(`Failed to fetch SPA HTML: ${spaResponse.status}`);
        }
        
        const spaHtml = await spaResponse.text();

        // Generate the dynamic tags
        const metaTags = generateMetaTags(articleData, originalUrl);
        
        // Inject the tags into the <head> of your HTML
        const modifiedHtml = spaHtml.replace('</head>', `${metaTags}</head>`);

        // Send the modified HTML
        response.setHeader('Content-Type', 'text/html');
        response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
        response.status(200).send(modifiedHtml);

    } catch (error) {
        console.error("Error in preview handler:", error);

        try {
            // If anything fails, send the unmodified HTML as a fallback
            const forwardedProto = request.headers['x-forwarded-proto'] || 'https';
            const proto = Array.isArray(forwardedProto)
                ? forwardedProto[0]
                : String(forwardedProto).split(',')[0];
            const host = request.headers['x-forwarded-host'] || request.headers.host || 'thought-stack.vercel.app';
            const spaHtml = await fetch(`${proto}://${host}/index.html`).then((res) => res.text());
            response.setHeader('Content-Type', 'text/html');
            response.status(200).send(spaHtml);
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
            response.status(500).send('Internal Server Error');
        }
    }
}