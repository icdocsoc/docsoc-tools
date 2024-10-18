import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = auth(async function GET(req, { params }: { params?: { shortcode?: string } }) {
    if (!req.auth) {
        return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    if (!params?.shortcode) {
        return NextResponse.json(
            { status: "error", message: "shortcode is required" },
            { status: 400 },
        );
    }

    const { shortcode } = params;

    if (!shortcode) {
        return NextResponse.json(
            { status: "error", message: "Invalid shortcode" },
            { status: 400 },
        );
    }

    try {
        const user = await prisma.imperialStudent.findUnique({
            where: {
                shortcode,
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                cid: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { status: "error", message: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ status: "success", user }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { status: "error", message: "Internal server error" },
            { status: 500 },
        );
    }
});
