'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.read).length);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications', { method: 'PATCH' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
                toast.success("모두 읽음 처리되었습니다.");
            }
        } catch (e) {
            toast.error("처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const deleteAll = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications', { method: 'DELETE' });
            if (res.ok) {
                setNotifications([]);
                setUnreadCount(0);
                toast.success("알림이 모두 삭제되었습니다.");
            }
        } catch (e) {
            toast.error("삭제 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b bg-gray-50/80 backdrop-blur-sm">
                    <span className="font-semibold text-sm">알림 ({unreadCount})</span>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={markAllRead}
                                disabled={loading}
                                title="모두 읽음"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={deleteAll}
                                disabled={loading}
                                title="모두 삭제"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[320px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            알림이 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className={`text-sm ${!n.read ? 'font-semibold text-blue-900' : 'font-medium text-gray-900'}`}>{n.title || "알림"}</h5>
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {new Date(n.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
