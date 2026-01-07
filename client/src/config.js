// Configuration for Render Deployment
// In Render Static Site "Environment" tab, set:
// VITE_API_BASE_URL = https://your-render-backend-name.onrender.com/api

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:5000/api' : '');

if (!API_BASE_URL) {
    console.error("API_BASE_URL is not set! Please set VITE_API_BASE_URL in Render Environment Variables.");
}
