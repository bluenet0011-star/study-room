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
  LogOut,
  MapPin,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  const links = [
    {
      name: "공지사항",
      href: `/notice`,
      icon: LayoutDashboard,
      roles: ["ADMIN", "TEACHER", "STUDENT"],
      description: "학교의 주요 공지사항을 확인합니다."
    },
    {
      name: "자습실 관리",
      href: "/admin/rooms",
      icon: DoorOpen,
      roles: ["ADMIN"],
      description: "자습실을 생성하고 좌석 배치를 편집합니다."
    },
    {
      name: "자습실 관리",
      href: "/teacher/seats",
      icon: DoorOpen,
      roles: ["TEACHER"],
      description: "자습실 현황을 모니터링하고 관리합니다."
    },
    {
      name: "학습 관리",
      href: "/teacher/plan",
      icon: CalendarCheck,
      roles: ["TEACHER"],
      description: "학생들의 학습 계획을 확인하고 피드백합니다."
    },
    {
      name: "리포트",
      href: "/teacher/reports",
      icon: FileText,
      roles: ["TEACHER"],
      description: "자습실 이용 통계 및 리포트를 조회합니다."
    },
    {
      name: "QR/행사",
      href: "/teacher/events",
      icon: QrCode,
      roles: ["TEACHER"],
      description: "QR 코드로 학생 출석 및 행사 참여를 관리합니다."
    },
    {
      name: "학생 관리",
      href: "/admin/users",
      icon: Users,
      roles: ["ADMIN"],
      description: "학생 및 교사 계정을 생성하고 관리합니다."
    },
    {
      name: "학생 관리",
      href: "/teacher/students",
      icon: Users,
      roles: ["TEACHER"],
      description: "담당 학생들의 정보를 조회하고 관리합니다."
    },
    {
      name: "학습 계획 관리",
      href: "/student/plan",
      icon: CalendarCheck,
      roles: ["STUDENT"],
      description: "나의 주간/월간 학습 계획을 작성하고 관리합니다."
    },
    {
      name: "내 신청 현황",
      href: "/student/status",
      icon: LayoutDashboard,
      roles: ["STUDENT"],
      description: "자습실 좌석 신청 내역을 확인합니다."
    },
    {
      name: "분실물 센터",
      href: "/common/lost-found",
      icon: MapPin,
      roles: ["ADMIN", "TEACHER", "STUDENT"],
      description: "습득물 및 분실물을 등록하고 확인합니다."
    },
    {
      name: "모바일 학생증",
      href: "/student/qr",
      icon: CreditCard,
      roles: ["STUDENT"],
      description: "도서관/자습실 출입을 위한 QR 코드를 표시합니다."
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(role));

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block h-full">
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {link.name}
                </CardTitle>
                <link.icon className="h-6 w-6 text-muted-foreground" />
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
