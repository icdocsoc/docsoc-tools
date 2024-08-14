import { getAcademicYear } from "@/lib/config";
import { getPurchasesByShortcode } from "@/lib/crud/purchase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { shortcode: string } }) {
    const searchParams = request.nextUrl.searchParams;
    const academicYears =
        searchParams.get("academicYears")?.split(",") ?? (await getAcademicYear());
    return NextResponse.json(await getPurchasesByShortcode(params.shortcode, academicYears));
}
