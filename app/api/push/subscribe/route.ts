import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
        return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    try {
        // Check if subscription already exists for this device (endpoint)
        const existing = await prisma.pushSubscription.findFirst({
            where: {
                endpoint: subscription.endpoint,
                userId: session.user.id
            }
        });

        if (existing) {
            // Update if keys changed (unlikely but possible)
            await prisma.pushSubscription.update({
                where: { id: existing.id },
                data: {
                    keys: JSON.stringify(subscription.keys),
                    updatedAt: new Date(),
                }
            });
            return NextResponse.json({ success: true, message: "Subscription updated" });
        }

        await prisma.pushSubscription.create({
            data: {
                userId: session.user.id,
                endpoint: subscription.endpoint,
                keys: JSON.stringify(subscription.keys),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json(
            { error: "Failed to save subscription" },
            { status: 500 }
        );
    }
}
