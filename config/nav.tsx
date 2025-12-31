import { LayoutDashboard, Users, DoorOpen, CalendarCheck, FileText, QrCode, Clock, Search, CreditCard, Megaphone, TreeDeciduous } from "lucide-react";

export const NAV_LINKS = [
    // Common

    // Removed Notice Link from Menu as per feedback


    // Teacher
    {
        name: "자습실 관리",
        href: "/teacher/seats",
        icon: DoorOpen,
        roles: ["TEACHER"],
        description: "자습실 현황을 모니터링하고 관리합니다."
    },
    {
        name: "퍼미션 관리",
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
        name: "학생 관리",
        href: "/teacher/students",
        icon: Users,
        roles: ["TEACHER"],
        description: "담당 학생들의 정보를 조회하고 관리합니다."
    },
    // Moved My Info later for Teacher

    // Teacher & Admin
    {
        name: "내 정보",
        href: "/profile",
        icon: Users,
        roles: ["TEACHER", "STUDENT"], // Removed ADMIN
        description: "나의 계정 정보와 설정을 관리합니다."
    },

    // Teacher
    {
        name: "QR/행사",
        href: "/teacher/events",
        icon: QrCode,
        roles: ["TEACHER"],
        description: "QR 코드로 학생 출석 및 행사 참여를 관리합니다."
    },

    // Student
    {
        name: "퍼미션 신청",
        href: "/student/plan",
        icon: CalendarCheck,
        roles: ["STUDENT"],
        description: "나의 주간/월간 퍼미션을 신청하고 관리합니다."
    },
    {
        name: "내 신청 현황",
        href: "/student/status",
        icon: FileText, // Changed icon to be distinct
        roles: ["STUDENT"],
        description: "자습실 좌석 신청 내역을 확인합니다."
    },
    {
        name: "학급 시간표",
        href: "/student/timetable",
        icon: Clock,
        roles: ["STUDENT"],
        description: "학급 시간표를 조회합니다."
    },
    {
        name: "모바일 학생증",
        href: "/student/qr",
        icon: CreditCard,
        roles: ["STUDENT"],
        description: "도서관/자습실 출입을 위한 QR 코드를 표시합니다."
    },

    // Common (Lost Found)
    {
        name: "분실물 센터",
        href: "/common/lost-found",
        icon: Search,
        roles: ["ADMIN", "TEACHER", "STUDENT"],
        description: "습득물 및 분실물을 등록하고 확인합니다."
    },


    // Admin Specific
    {
        name: "자습실 관리",
        href: "/admin/rooms",
        icon: DoorOpen,
        roles: ["ADMIN"],
        description: "자습실을 생성하고 좌석 배치를 편집합니다."
    },
    {
        name: "계정 관리",
        href: "/admin/users",
        icon: Users,
        roles: ["ADMIN"],
        description: "학생 및 교사 계정을 생성하고 관리합니다."
    },
    {
        name: "동탄국제고 링크트리",
        href: "https://linktr.ee/dghs_student",
        icon: TreeDeciduous,
        roles: ["TEACHER", "STUDENT"],
        description: "학교 관련 주요 링크를 확인합니다."
    },

    // Bottom
    {
        name: "건의함",
        href: "/common/suggestions",
        icon: Megaphone,
        roles: ["ADMIN", "TEACHER", "STUDENT"],
        description: "학교 생활에 대한 건의사항을 남깁니다."
    },
];
