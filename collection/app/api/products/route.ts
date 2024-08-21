import { getProductsByAcademicYear } from "@/lib/crud/products";
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(await getProductsByAcademicYear());
}

export const dynamic = "force-dynamic";
