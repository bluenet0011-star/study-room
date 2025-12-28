import { LayoutDashboard, Users, DoorOpen, CalendarCheck, FileText, QrCode, Clock } from "lucide-react";

export const NAV_LINKS = [
    {
        name: "대시보드",
        href: `/`,
        icon: LayoutDashboard,
        roles: ["ADMIN", "TEACHER", "STUDENT"],
        description: "메인 대시보드로 이동합니다."
    },
    {
        name: "내 정보",
        href: "/profile",
        icon: Users,
        roles: ["ADMIN", "TEACHER", "STUDENT"],
        description: "나의 계정 정보와 설정을 관리합니다."
    },
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
        name: "퍼미션 관리", // Renamed back to "퍼미션 관리" by user request
        href: "/teacher/plan",
        icon: CalendarCheck,
        roles: ["TEACHER"],
        description: "학생들의 퍼미션 신청을 확인하고 관리합니다."
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
        name: "퍼미션 신청", // Renamed back to "퍼미션 신청" for consistency
        href: "/student/plan",
        icon: CalendarCheck,
        roles: ["STUDENT"],
        description: "나의 주간/월간 퍼미션을 신청하고 관리합니다."
    },
    {
        name: "내 신청 현황",
        href: "/student/status",
        icon: LayoutDashboard,
        roles: ["STUDENT"],
        description: "자습실 좌석 신청 내역을 확인합니다."
    },
    {
        name: "시간표",
        href: "/student/timetable",
        icon: Clock,
        roles: ["STUDENT"],
        description: "학급 시간표를 조회합니다."
    },
    {
        name: "분실물 센터",
        href: "/common/lost-found",
        icon: LayoutDashboard,
        roles: ["ADMIN", "TEACHER", "STUDENT"],
        description: "습득물 및 분실물을 등록하고 확인합니다."
    },
    {
        name: "모바일 학생증",
        href: "/student/qr",
        icon: Users,
        roles: ["STUDENT"],
        description: "도서관/자습실 출입을 위한 QR 코드를 표시합니다."
    },
];
