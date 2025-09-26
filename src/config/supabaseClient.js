import {createClient} from '@supabase/supabase-js';

// Vite only exposes environment variables prefixed with VITE_ to client-side code for security reasons. 
// This prevents accidental exposure of sensitive variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey); 