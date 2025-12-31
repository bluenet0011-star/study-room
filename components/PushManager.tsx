"use client";

import { useEffect, useState } from "react";
import { subscribeUserToPush } from "@/lib/push-notifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PushManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            setPermission(Notification.permission);

            // If already granted, ensure subscribed (refresh tokens etc)
            if (Notification.permission === "granted") {
                subscribeUserToPush();
            }
        }
    }, []);

    const handleSubscribe = async () => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === "granted") {
                await subscribeUserToPush();
                toast.success("알림이 설정되었습니다.");
            } else {
                toast.error("알림 권한이 거부되었습니다.");
            }
        } catch (e) {
            console.error(e);
            toast.error("알림 설정 중 오류가 발생했습니다.");
        }
    };

    if (!isSupported) return null;

    // Don't show anything if granted or denied (unless we want a settings page toggle)
    // For this task, we want to prompt if "default"
    if (permission === 'granted') return null;

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {/* Small floating button if permission is default, or maybe just rely on user action elsewhere? 
           The user asked for "functionality", implicit is better but browser blocks it.
           We'll show a small alert/toast or button.
       */}
            {permission === 'default' && (
                <Button onClick={handleSubscribe} size="sm" variant="outline" className="shadow-lg bg-background border-primary">
                    <Bell className="w-4 h-4 mr-2" />
                    알림 받기
                </Button>
            )}
        </div>
    );
}
