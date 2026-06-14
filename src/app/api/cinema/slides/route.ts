import { NextResponse } from "next/server";

import { loadCinemaSlides } from "@/game/systems/cinema/loader";

export async function GET() {
  const slides = await loadCinemaSlides();

  return NextResponse.json({ slides });
}
