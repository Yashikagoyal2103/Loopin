import type { CorsOptions } from 'cors';

/**
 * Browsers send `Origin` per tab URL. `http://localhost:5173` and `http://127.0.0.1:5173`
 * are different origins — a single static `origin` in cors() breaks one of them.
 */
export function buildCorsOptions(): CorsOptions {
    const envOrigin = process.env.FRONTEND_URL?.trim();
    const extra = new Set<string>();
    if (envOrigin) {
        extra.add(envOrigin);
        if (envOrigin.startsWith('http://')) {
            extra.add(envOrigin.replace('http://', 'https://'));
        }
        if (envOrigin.startsWith('https://')) {
            extra.add(envOrigin.replace('https://', 'http://'));
        }
    }

    const isLocalDevOrigin = (o: string) =>
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);

    return {
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (extra.has(origin)) {
                callback(null, origin);
                return;
            }
            if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin)) {
                callback(null, origin);
                return;
            }
            console.warn('[cors] blocked Origin:', origin, 'set FRONTEND_URL to match your app URL');
            callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };
}
