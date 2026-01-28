import { useState, useCallback } from 'react';

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    const requestPermission = useCallback(async () => {
        if (typeof Notification === 'undefined') return false;
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    }, []);

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            new Notification(title, {
                icon: '/pwa-192x192.png',
                badge: '/pwa-64x64.png',
                ...options
            });
        }
    }, [permission]);

    return { permission, requestPermission, sendNotification };
}
