import { auth } from "@/auth";
import { getAcademicYear } from "@/lib/config";
import { getPurchasesByShortcode } from "@/lib/crud/purchase";
import { NextRequest, NextResponse } from "next/server";

export const GET = auth(async function GET(
    request,
    { params }: { params?: { shortcode?: string } },
) {
    if (!request.auth) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            { status: 401 },
        );
    }

    if (!params?.shortcode) {
        return NextResponse.json(
            {
                message: "shortcode is required",
            },
            { status: 400 },
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const academicYears = searchParams.get("academicYears")?.split(",") ?? [
        await getAcademicYear(),
    ];
    return NextResponse.json(await getPurchasesByShortcode(params.shortcode, academicYears));
});
