// Basic configuration helper
// We default to the Vercel Production URL to ensure it works on deployment without env vars issues.

const isProduction = import.meta.env.MODE === 'production';

// ALWAYS use the production backend if not explicitly localhost
export const API_BASE_URL = 'https://win365v0-1.vercel.app/api';

// Fallback for local dev ONLY if needed (commented out to be safe)
// export const API_BASE_URL = window.location.hostname === 'localhost'
//    ? 'http://localhost:5000/api'
//    : 'https://win365v0-1.vercel.app/api';
