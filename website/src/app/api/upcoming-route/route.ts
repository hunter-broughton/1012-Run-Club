import { NextResponse } from "next/server";
import { getUpcomingRoute } from "../../../../lib/database";

export async function GET() {
  try {
    const route = await getUpcomingRoute();
    return NextResponse.json(route);
  } catch (error) {
    console.error("Error fetching upcoming route:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming route" },
      { status: 500 }
    );
  }
}
