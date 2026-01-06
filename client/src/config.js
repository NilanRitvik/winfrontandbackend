// Basic configuration helper
// In production, this should ideally come from import.meta.env.VITE_API_URL
// For now, we default to localhost but allow easy switching.

const isProduction = import.meta.env.MODE === 'production';

export const API_BASE_URL = isProduction
    ? 'https://win365v01.vercel.app/api'
    : 'http://localhost:5000/api';
