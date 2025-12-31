import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Double check session (though parent layout checks it, good for isolation)
    if (!session?.user) redirect("/login");

    // Enforce ADMIN role
    if (session.user.role !== "ADMIN") {
        redirect("/"); // Redirect unauthorized users to home
    }

    return <>{children}</>;
}
