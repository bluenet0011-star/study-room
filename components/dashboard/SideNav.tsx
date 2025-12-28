'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, DoorOpen, CalendarCheck, LogOut, UserPlus, FileText, QrCode } from "lucide-react";
import { signOut } from "next-auth/react";

export function SideNav({ role }: { role: string }) {
    const pathname = usePathname();

    const links = [
        { name: "대시보드", href: `/`, icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { name: "공지사항", href: `/notice`, icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { name: "자습실 관리", href: "/admin/rooms", icon: DoorOpen, roles: ["ADMIN"] }, // Added as per request
        { name: "자습실관리", href: "/teacher/seats", icon: DoorOpen, roles: ["TEACHER"] },
        { name: "학습관리", href: "/teacher/plan", icon: CalendarCheck, roles: ["TEACHER"] },
        { name: "리포트", href: "/teacher/reports", icon: FileText, roles: ["TEACHER"] },
        { name: "QR/행사", href: "/teacher/events", icon: QrCode, roles: ["TEACHER"] },

        { name: "학생관리", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
        { name: "학생관리", href: "/teacher/students", icon: Users, roles: ["TEACHER"] },
        { name: "학습계획관리", href: "/student/plan", icon: CalendarCheck, roles: ["STUDENT"] },
        // { name: "공강관리", href: "/student/empty-period", icon: LayoutDashboard, roles: ["STUDENT"] }, // Deleted as per request
        { name: "내 신청 현황", href: "/student/status", icon: LayoutDashboard, roles: ["STUDENT"] },
        { name: "분실물 센터", href: "/common/lost-found", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { name: "모바일 학생증", href: "/student/qr", icon: Users, roles: ["STUDENT"] },
    ];
    const filteredLinks = links.filter(link => link.roles.includes(role));

    return (
        <div className="flex flex-col h-full border-r bg-gray-50/40">
            <div className="p-6 flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                    <img src="/school-logo.png" alt="Logo" className="object-contain w-full h-full" />
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-tight text-gray-900">DGHS</h1>
                    <p className="text-[10px] text-primary font-bold tracking-wider uppercase">Future Leaders</p>
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
