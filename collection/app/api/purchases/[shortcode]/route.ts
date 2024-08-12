import { getPurchasesByShortcode } from "@/lib/crud/purchase";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { shortcode: string } }) {
    return NextResponse.json(await getPurchasesByShortcode(params.shortcode));
}
