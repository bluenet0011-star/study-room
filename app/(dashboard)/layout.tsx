import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SideNav } from "@/components/dashboard/SideNav";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { NotificationBell } from "@/components/NotificationBell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="grid min-h-[100dvh] w-full lg:grid-cols-[280px_1fr]">
            {/* Desktop Sidebar */}
            <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 sticky top-0 h-screen overflow-y-auto">
                <SideNav role={session.user.role} />
            </div>

            <div className="flex flex-col pb-[env(safe-area-inset-bottom)]">
                {/* Mobile Navigation */}
                <MobileNav role={session.user.role} />

                {/* Notification Bell */}
                <div className="absolute top-4 right-4 z-50">
                    <NotificationBell />
                </div>

                {children}
            </div>
        </div>
    );
}
