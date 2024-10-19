/**
 * Returns just those products we can sync from eActivities
 */
import { auth } from "@/auth";
import { getSyncableProducts } from "@/lib/crud/products";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(request) {
    if (!request.auth) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            { status: 401 },
        );
    }
    return NextResponse.json(await getSyncableProducts());
});

export const dynamic = "force-dynamic";
