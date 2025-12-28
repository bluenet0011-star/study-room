'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LayoutDashboard, Users, DoorOpen, CalendarCheck, LogOut, FileText, QrCode, Menu, ArrowLeft } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { NAV_LINKS } from "@/config/nav";

export function MobileNav({ role }: { role: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);

    const filteredLinks = NAV_LINKS.filter(link => link.roles.includes(role));

    return (
        <div className="flex items-center gap-2 p-4 border-b lg:hidden bg-white">
            {/* Back Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="flex-shrink-0"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Hamburger Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">메뉴 열기</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                    <div className="flex flex-col h-full">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="relative w-10 h-10 shrink-0">
                                <Image src="/school-logo.png" alt="Logo" fill className="object-contain" priority />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold leading-tight text-gray-900">DGHS 자습실</h1>
                                {session?.user ? (
                                    <p className="text-sm text-gray-600 font-medium">
                                        {session.user.name} <span className="text-xs text-primary">({role})</span>
                                    </p>
                                ) : (
                                    null
                                )}
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            {filteredLinks.map((link) => (
                                <SheetClose asChild key={link.href}>
                                    <Link href={link.href} onClick={() => setOpen(false)}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start gap-2",
                                                (pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/')) && "bg-red-50 text-primary font-bold"
                                            )}
                                        >
                                            <link.icon className="w-4 h-4" />
                                            {link.name}
                                        </Button>
                                    </Link>
                                </SheetClose>
                            ))}
                        </div>
                        <div className="mt-auto pt-4 border-t">
                            <Button variant="outline" className="w-full gap-2" onClick={() => signOut()}>
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Title */}
            <span className="text-sm font-semibold truncate">DGHS 자습실</span>
        </div>
    );
}
