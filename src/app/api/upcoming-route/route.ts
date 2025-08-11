import { NextResponse } from "next/server";
import { getUpcomingRoute } from "../../../../lib/jsonDatabase";

export async function GET() {
  try {
    const upcomingRoute = await getUpcomingRoute();
    
    if (upcomingRoute) {
      return NextResponse.json(upcomingRoute);
    } else {
      // Return null if no upcoming route is set
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error("Error fetching upcoming route:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming route" },
      { status: 500 }
    );
  }
}