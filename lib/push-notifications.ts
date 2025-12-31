
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribeUserToPush() {
    if (!("serviceWorker" in navigator)) return;
    if (!VAPID_PUBLIC_KEY) {
        console.error("VAPID Public Key not found");
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await fetch("/api/push/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log("Push Registered...");
    } catch (err) {
        console.error("Error subscribing to push", err);
    }
}

export async function unsubscribePush() {
    if (!("serviceWorker" in navigator)) return;
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            // Also remove from backend
            await fetch("/api/push/remove", {
                method: "POST",
                body: JSON.stringify({ endpoint: subscription.endpoint }),
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (error) {
        console.error("Error unsubscribing", error);
    }
}
