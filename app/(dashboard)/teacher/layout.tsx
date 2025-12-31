import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) redirect("/login");

    // Enforce TEACHER or ADMIN role (Admins usually can access teacher views or it's separated. 
    // Assuming Admin is superuser, but generally role is strict. 
    // If Admin needs to see teacher view, include ADMIN.
    // Based on `api/teacher` checks, usually only TEACHER. 
    // But `api/admin/rooms` allows TEACHER? No.
    // Let's stick to: TEACHER only, or TEACHER + ADMIN.
    // Safety: TEACHER role is required.)
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
        redirect("/");
    }

    return <>{children}</>;
}
