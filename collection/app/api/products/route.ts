import { auth } from "@/auth";
import { getProductsByAcademicYear } from "@/lib/crud/products";
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
    return NextResponse.json(await getProductsByAcademicYear());
});

export const dynamic = "force-dynamic";
