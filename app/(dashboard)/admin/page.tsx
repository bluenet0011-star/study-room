'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, DoorOpen, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
            <p className="text-gray-600 mb-8">자습실 관리 시스템에 오신 것을 환영합니다.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-600" />
                                <CardTitle>사용자 관리</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                학생 및 교사 계정을 생성하고 관리합니다. 엑셀 파일로 일괄 업로드할 수 있습니다.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/rooms">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <DoorOpen className="w-8 h-8 text-green-600" />
                                <CardTitle>자습실 및 좌석 관리</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                자습실을 생성하고 좌석 배치를 편집합니다. 드래그앤드롭으로 쉽게 배치할 수 있습니다.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/assignments">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <UserCheck className="w-8 h-8 text-purple-600" />
                                <CardTitle>좌석 배정</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                학생을 특정 좌석에 배정하고 배정 현황을 관리합니다.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
