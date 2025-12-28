'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, DoorOpen, CalendarCheck, LogOut, UserPlus, FileText, QrCode } from "lucide-react";
import { signOut } from "next-auth/react";

import { NAV_LINKS } from "@/config/nav";

export function SideNav({ role }: { role: string }) {
    const pathname = usePathname();

    const filteredLinks = NAV_LINKS.filter(link => link.roles.includes(role));

    return (
        <div className="flex flex-col h-full border-r bg-gray-50/40">
            <div className="p-6 flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                    <Image src="/school-logo.png" alt="Logo" fill className="object-contain" priority />
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-tight text-gray-900">DGHS</h1>
                </div>
            </div>
            <div className="flex-1 px-4 space-y-2">
                {filteredLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-2",
                                (pathname === link.href || pathname.startsWith(link.href) && link.href !== '/') && "bg-red-50 text-primary border-r-4 border-primary font-bold rounded-l-none"
                            )}
                        >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                        </Button>
                    </Link>
                ))}
            </div>
            <div className="p-4">
                <Button variant="outline" className="w-full gap-2" onClick={() => signOut()}>
                    <LogOut className="w-4 h-4" />
                    로그아웃
                </Button>
            </div>
        </div>
    );
}
