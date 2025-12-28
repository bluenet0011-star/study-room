'use client';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LayoutDashboard, Users, DoorOpen, CalendarCheck, LogOut, FileText, QrCode, Menu, ArrowLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function MobileNav({ role }: { role: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const links = [
        { name: "대시보드", href: `/`, icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { name: "공지사항", href: `/notice`, icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { name: "자습실 관리", href: "/admin/rooms", icon: DoorOpen, roles: ["ADMIN"] },
        { name: "자습실관리", href: "/teacher/seats", icon: DoorOpen, roles: ["TEACHER"] },
        { name: "학습관리", href: "/teacher/plan", icon: CalendarCheck, roles: ["TEACHER"] },
        { name: "리포트", href: "/teacher/reports", icon: FileText, roles: ["TEACHER"] },
        { name: "QR/행사", href: "/teacher/events", icon: QrCode, roles: ["TEACHER"] },
        { name: "학생관리", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
        { name: "학생관리", href: "/teacher/students", icon: Users, roles: ["TEACHER"] },
        { name: "학습계획관리", href: "/student/plan", icon: CalendarCheck, roles: ["STUDENT"] },
        { name: "내 신청 현황", href: "/student/status", icon: LayoutDashboard, roles: ["STUDENT"] },
        { name: "분실물 센터", href: "/common/lost-found", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { name: "모바일 학생증", href: "/student/qr", icon: Users, roles: ["STUDENT"] },
    ];
    const filteredLinks = links.filter(link => link.roles.includes(role));

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
                                <img src="/school-logo.png" alt="Logo" className="object-contain w-full h-full" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold leading-tight text-gray-900">동탄국제고</h1>
                                <p className="text-[10px] text-primary font-bold tracking-wider uppercase">Future Leaders</p>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            {filteredLinks.map((link) => (
                                <SheetClose asChild key={link.href}>
                                    <Link href={link.href} onClick={() => setOpen(false)}>
                                        <Button
                                            variant={pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/') ? "secondary" : "ghost"}
                                            className="w-full justify-start gap-2"
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
            <span className="text-sm font-semibold truncate">동탄국제고 자습실</span>
        </div>
    );
}
