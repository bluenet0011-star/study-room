'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Notification {
    id: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.id) return;
        fetchNotifications();
    }, [session]);

    const fetchNotifications = async () => {
        const res = await fetch('/api/notifications');
        if (res.ok) {
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.read).length);
        }
    };

    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && unreadCount > 0) {
            await fetch('/api/notifications', { method: 'PUT' });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b font-semibold bg-gray-50">알림</div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">알림이 없습니다.</div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-4 hover:bg-gray-50 text-sm ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                    <p className="text-gray-900 mb-1">{n.message}</p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(n.createdAt), 'MM.dd HH:mm', { locale: ko })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
