import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/authz";

export async function POST(request) {
  try {
    const db = await getDb();

    const body = await request.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        { ok: false, error: "Username/Email and Password are required." },
        { status: 400 }
      );
    }

    const admin = await db.collection("portal_super_admins").findOne({
      $or: [
        { username: login },
        { email: login.toLowerCase() }
      ],
      active: true
    });

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await createSession(
      "portal_super_admin",
      admin.id,
      {
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    );

    return NextResponse.json({
      ok: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}