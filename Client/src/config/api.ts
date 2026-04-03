/** API origin. In dev, use same-origin + Vite proxy so cookies work reliably. */
export const API_BASE_URL = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || 'http://localhost:4000').trim();
