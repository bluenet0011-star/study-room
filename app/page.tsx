import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { PullToRefresh } from "@/components/PullToRefresh";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <PullToRefresh>
      <DashboardContent />
    </PullToRefresh>
  );
}
