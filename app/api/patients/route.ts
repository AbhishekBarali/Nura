import { NextResponse } from "next/server";
import { getAllPatients, getPatientById } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const patient = getPatientById(parseInt(id));
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json(patient);
  }

  const patients = getAllPatients();
  return NextResponse.json(patients);
}
