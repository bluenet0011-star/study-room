import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    DoorOpen,
    CalendarCheck,
    FileText,
    QrCode,
    MapPin,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { NAV_LINKS } from "@/config/nav";

export default async function DashboardContent() {
    const session = await auth();
    if (!session?.user) return null;

    const role = session.user.role;

    // Filter links based on role (User requested exact match with Sidebar, so we include everything)
    const filteredLinks = NAV_LINKS.filter((link) =>
        link.roles.includes(role)
    );

    const roleNames: Record<string, string> = {
        ADMIN: "관리자",
        TEACHER: "선생님",
        STUDENT: "학생",
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{roleNames[role]} 대시보드</h1>
                <p className="text-muted-foreground mt-2">
                    반갑습니다, {session.user.name}님. 원하시는 메뉴를 선택해주세요.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {filteredLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block h-full">
                        <Card className="h-full hover:bg-red-50 hover:border-primary/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                                    {link.name}
                                </CardTitle>
                                <link.icon className="h-6 w-6 text-red-500 group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm mt-2 line-clamp-2">
                                    {link.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
