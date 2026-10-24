import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Registration is disabled. This workspace uses GitHub-only owner access." },
    { status: 403 },
  );
}
