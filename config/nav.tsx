import { LayoutDashboard, Users, DoorOpen, CalendarCheck, FileText, QrCode } from "lucide-react";

export const NAV_LINKS = [
    { name: "대시보드", href: `/`, icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
    { name: "내 정보", href: "/profile", icon: Users, roles: ["ADMIN", "TEACHER", "STUDENT"] },
    { name: "공지사항", href: `/notice`, icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
    { name: "자습실 관리", href: "/admin/rooms", icon: DoorOpen, roles: ["ADMIN"] },
    { name: "자습실관리", href: "/teacher/seats", icon: DoorOpen, roles: ["TEACHER"] },
    { name: "퍼미션 관리", href: "/teacher/plan", icon: CalendarCheck, roles: ["TEACHER"] },
    { name: "리포트", href: "/teacher/reports", icon: FileText, roles: ["TEACHER"] },
    { name: "QR/행사", href: "/teacher/events", icon: QrCode, roles: ["TEACHER"] },

    { name: "학생관리", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
    { name: "학생관리", href: "/teacher/students", icon: Users, roles: ["TEACHER"] },
    { name: "퍼미션 신청", href: "/student/plan", icon: CalendarCheck, roles: ["STUDENT"] },
    { name: "내 신청 현황", href: "/student/status", icon: LayoutDashboard, roles: ["STUDENT"] },
    { name: "분실물 센터", href: "/common/lost-found", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
    { name: "모바일 학생증", href: "/student/qr", icon: Users, roles: ["STUDENT"] },
];
