import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const db = await getDb();

    const existing = await db.collection("portal_super_admins").findOne({
      username: "admin",
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "Super Admin already exists.",
      });
    }

    const password = await bcrypt.hash("Admin@123", 10);

    await db.collection("portal_super_admins").insertOne({
      id: crypto.randomUUID(),
      name: "Super Admin",
      username: "admin",
      email: "admin@assamgoodscarrier.com",
      password,
      role: "SUPER_ADMIN",
      active: true,
      createdAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      message: "Super Admin created successfully.",
      username: "admin",
      password: "Admin@123",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}