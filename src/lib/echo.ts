import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

// This prevents "Pusher is not defined" errors in the browser
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;
}

const reverbAppKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
const reverbHost = process.env.NEXT_PUBLIC_REVERB_HOST;

export const echo = typeof window !== 'undefined' && reverbAppKey && reverbHost ? new Echo({
    broadcaster: 'reverb',
    key: reverbAppKey,
    wsHost: reverbHost,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 80),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
}) : undefined;