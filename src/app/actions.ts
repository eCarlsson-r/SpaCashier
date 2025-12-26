'use server'

import api from '@/lib/api'

export async function subscribeUser(subscription: any) {
    try {
        await api.post('/subscribe', {
            subscription,
            // You can add more metadata here, like user_id if needed
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to subscribe user:', error)
        return { success: false, error: 'Failed to subscribe' }
    }
}

export async function unsubscribeUser() {
    // Implement unsubscribe logic if the backend supports it
    // For now, we can just return success or call a delete endpoint
    return { success: true }
}

export async function sendNotification(message: string) {
    try {
        // This would typically be a backend-only operation or a test endpoint
        // If the backend has an endpoint to trigger a notification for the current user:
        await api.post('/send-notification', { message })
        return { success: true }
    } catch (error) {
        console.error('Failed to send notification:', error)
        return { success: false, error: 'Failed to send notification' }
    }
}
