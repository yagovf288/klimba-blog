declare module 'astro:env/server' {
	export const VITE_SUPABASE_URL: string;	
	export const VITE_SUPABASE_ANON_KEY: string;	
	export const GEMINI_API_KEY: string | undefined;	
	export const API_KEY: string | undefined;	
}