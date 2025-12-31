import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Use environment variables for configuration
// These are not available at build time on client, but available on server
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (vapidPublicKey && vapidPrivateKey) {
    try {
        webpush.setVapidDetails(
            vapidSubject,
            vapidPublicKey,
            vapidPrivateKey
        );
    } catch (err) {
        console.error("Failed to set VAPID details", err);
    }
}

interface SendPushOptions {
    userId: string;
    title: string;
    message: string;
    url?: string;
}

export async function sendPushNotification({
    userId,
    title,
    message,
    url = "/",
}: SendPushOptions) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn("VAPID keys not configured, skipping push notification");
        return;
    }

    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            return; // No subscriptions for this user
        }

        const payload = JSON.stringify({
            title,
            body: message,
            url,
            icon: "/icons/icon-192x192.png",
        });

        const sendPromises = subscriptions.map(async (sub) => {
            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: JSON.parse(sub.keys),
                };
                await webpush.sendNotification(pushSubscription, payload);
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription expired or invalid, remove it
                    console.log(`Removing expired subscription for user ${userId}`);
                    await prisma.pushSubscription.delete({ where: { id: sub.id } });
                } else {
                    console.error(`Error sending push to ${sub.id}:`, error);
                }
            }
        });

        await Promise.all(sendPromises);
        console.log(`Sent push notification to user ${userId}`);
    } catch (error) {
        console.error("Error in sendPushNotification:", error);
    }
}
