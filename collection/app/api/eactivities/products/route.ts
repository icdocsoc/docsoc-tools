import { auth } from "@/auth";
import { getProductsByAcademicYear } from "@/lib/crud/products";
import getEactivities from "@/lib/eactivites";
import { isValidAcademicYear } from "@docsoc/eactivities";
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
    const searchParams = request.nextUrl.searchParams;

    if (!searchParams.has("academicYear")) {
        return NextResponse.json(
            {
                message: "academicYear is required",
            },
            { status: 400 },
        );
    }

    const academicYear = searchParams.get("academicYear");

    if (!academicYear || !isValidAcademicYear(academicYear)) {
        return NextResponse.json(
            {
                message: "Invalid academicYear",
            },
            { status: 400 },
        );
    }

    const eactivites = await getEactivities();

    const products = await eactivites.getProductsByAcademicYear(undefined, academicYear);

    if (products.status !== 200) {
        return NextResponse.json(
            {
                message: "Failed to load products",
            },
            { status: 500 },
        );
    }

    return NextResponse.json(products.data);
});

export const dynamic = "force-dynamic";
