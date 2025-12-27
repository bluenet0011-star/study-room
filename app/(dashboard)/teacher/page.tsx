'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarCheck, DoorOpen, Bell, UserPlus } from 'lucide-react';

export default function TeacherDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">교사 대시보드</h1>
            <p className="text-gray-600 mb-8">자습실 관리 시스템에 오신 것을 환영합니다.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/teacher/permissions">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <CalendarCheck className="w-8 h-8 text-blue-600" />
                                <CardTitle>퍼미션 관리</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                학생들의 외출/이동 신청을 확인하고 승인 또는 반려할 수 있습니다.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/teacher/seats">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <DoorOpen className="w-8 h-8 text-green-600" />
                                <CardTitle>좌석 현황</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                실시간 좌석 배치와 학생들의 위치를 확인할 수 있습니다. 외출/이동 중인 학생도 표시됩니다.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/teacher/proxy-apply">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-8 h-8 text-orange-600" />
                                <CardTitle>대리 신청</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                학생을 대신하여 퍼미션을 신청하고 즉시 승인할 수 있습니다.
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
                            새로운 퍼미션 신청 및 시스템 알림을 확인할 수 있습니다.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
