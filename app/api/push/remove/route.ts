import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
        return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    try {
        await prisma.pushSubscription.deleteMany({
            where: {
                endpoint: endpoint,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing subscription:", error);
        return NextResponse.json(
            { error: "Failed to remove subscription" },
            { status: 500 }
        );
    }
}
