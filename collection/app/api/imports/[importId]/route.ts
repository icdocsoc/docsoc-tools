import { getItemsInImport } from "@/lib/crud/importCsv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { importId: string } }) {
    return NextResponse.json(await getItemsInImport(params.importId));
}
