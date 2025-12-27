'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarCheck, LayoutDashboard, Bell } from 'lucide-react';

export default function StudentDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">학생 대시보드</h1>
            <p className="text-gray-600 mb-8">자습실 관리 시스템에 오신 것을 환영합니다.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/student/plan">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <CalendarCheck className="w-8 h-8 text-blue-600" />
                                <CardTitle>퍼미션 신청</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                외출, 이동, 조퇴 등의 퍼미션을 신청할 수 있습니다. 담당 교사를 선택하고 사유를 입력하세요.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/student/status">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <LayoutDashboard className="w-8 h-8 text-green-600" />
                                <CardTitle>내 신청 현황</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                제출한 퍼미션의 승인/반려 상태를 실시간으로 확인할 수 있습니다.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="opacity-50 h-full">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Bell className="w-8 h-8 text-purple-600" />
                            <CardTitle>알림</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            퍼미션 승인/반려 알림 및 시스템 공지사항을 확인할 수 있습니다.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
