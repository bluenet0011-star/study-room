'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LayoutDashboard, Users, DoorOpen, CalendarCheck, LogOut, FileText, QrCode, Menu, ArrowLeft, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { signOut, useSession } from "next-auth/react";
import { unsubscribePush } from "@/lib/push-notifications";
import { useState } from "react";

import { NAV_LINKS } from "@/config/nav";

export function MobileNav({ role }: { role: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const filteredLinks = NAV_LINKS.filter(link => link.roles.includes(role));

    return (
        <div className="flex items-center gap-2 p-4 border-b lg:hidden bg-white">
            {/* Back Button */}
            {pathname !== '/' && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="flex-shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            )}

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
                        <div className="mt-auto pt-4 border-t space-y-2">
                            <Button variant="ghost" className="w-full gap-2 justify-start text-gray-600" onClick={() => setIsGuideOpen(true)}>
                                <HelpCircle className="w-4 h-4" />
                                앱 설치 방법
                            </Button>
                            <Button variant="outline" className="w-full gap-2" onClick={async () => {
                                // Prevent hang if service worker is unresponsive
                                const unsubscribe = unsubscribePush().catch(err => console.error("Push unsubscribe failed", err));
                                const timeout = new Promise(resolve => setTimeout(resolve, 500));
                                await Promise.race([unsubscribe, timeout]);

                                await signOut({ callbackUrl: "/login" });
                            }}>
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Title */}
            <span className="text-sm font-semibold truncate">DGHS 자습실</span>

            {/* Guide Dialog */}
            <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>앱 설치 / 홈 화면 추가 방법</DialogTitle>
                        <DialogDescription>
                            편리한 사용을 위해 앱을 홈 화면에 추가하세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                🍎 iOS (iPhone/iPad)
                            </h3>
                            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
                                <li>Safari 브라우저에서 접속합니다.</li>
                                <li>하단의 <strong>공유</strong> 버튼 <span className="inline-block border rounded px-1 text-xs">⎋</span>을 누릅니다.</li>
                                <li><strong>&apos;홈 화면에 추가&apos;</strong> 메뉴를 선택합니다.</li>
                                <li><strong>추가</strong>를 누르면 앱 아이콘이 생성됩니다.</li>
                            </ol>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                🤖 Android (Galaxy/Pixel)
                            </h3>
                            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
                                <li>Chrome 브라우저에서 접속합니다.</li>
                                <li>상단의 <strong>메뉴</strong> 버튼 <span className="inline-block border rounded px-1 text-xs">⋮</span>을 누릅니다.</li>
                                <li><strong>&apos;앱 설치&apos;</strong> 또는 <strong>&apos;홈 화면에 추가&apos;</strong>를 선택합니다.</li>
                                <li>설치 팝업에서 <strong>설치</strong>를 누릅니다.</li>
                            </ol>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                            * 홈 화면에 추가하면 <strong>전체 화면</strong>으로 더 쾌적하게 이용할 수 있으며, 로그인 상태가 더 오래 유지됩니다.
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
