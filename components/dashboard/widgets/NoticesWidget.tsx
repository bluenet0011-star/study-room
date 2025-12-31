import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getRecentNotices() {
    return await prisma.notice.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true, important: true }
    });
}

export async function NoticesWidget() {
    const notices = await getRecentNotices();

    return (
        <Card className="col-span-2 md:col-span-2 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-red-500" />
                        최신 공지사항
                    </CardTitle>
                    <Link href="/notice" className="text-xs text-gray-500 hover:text-primary">더보기 &rarr;</Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {notices.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">등록된 공지사항이 없습니다.</p>
                    ) : (
                        notices.map(notice => (
                            <Link href={`/notice/${notice.id}`} key={notice.id} className="block group">
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm group-hover:underline ${notice.important ? 'font-bold text-red-600' : 'text-gray-700'}`}>
                                        {notice.important && <span className="text-red-500 mr-1">[필독]</span>}
                                        {notice.title}
                                    </span>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function NoticesSkeleton() {
    return (
        <Card className="col-span-2 md:col-span-2 shadow-sm animate-pulse">
            <CardHeader className="pb-2">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                </div>
            </CardContent>
        </Card>
    );
}
