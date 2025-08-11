import { NextResponse } from "next/server";
import { getUpcomingRoute } from "../../../../lib/jsonDatabase";

export async function GET() {
  try {
    const upcomingRoute = await getUpcomingRoute();

    if (upcomingRoute) {
      return NextResponse.json(upcomingRoute);
    } else {
      // Return a fallback route if no upcoming route is set
      const fallbackRoute = {
        id: 1,
        name: "Campus Loop",
        description:
          "A scenic 3-mile loop around the University of Michigan campus, perfect for beginners and a great way to see the beautiful campus.",
        distance: "3.0 miles",
        difficulty: "Easy" as const,
        estimatedTime: "25-30 minutes",
        points: [
          { lat: 42.2808, lng: -83.743, name: "Start: Diag" },
          { lat: 42.2776, lng: -83.7382, name: "Michigan Union" },
          { lat: 42.2737, lng: -83.7347, name: "Law School" },
          { lat: 42.2769, lng: -83.7321, name: "Medical Campus" },
          { lat: 42.2808, lng: -83.743, name: "End: Diag" },
        ],
        isUpcoming: true,
        createdAt: "2025-08-10T00:00:00.000Z",
        updatedAt: "2025-08-10T00:00:00.000Z",
      };

      return NextResponse.json(fallbackRoute);
    }
  } catch (error) {
    console.error("Error fetching upcoming route:", error);

    // Fallback: Return static default route if there's an error
    const fallbackRoute = {
      id: 1,
      name: "Campus Loop",
      description:
        "A scenic 3-mile loop around the University of Michigan campus, perfect for beginners and a great way to see the beautiful campus.",
      distance: "3.0 miles",
      difficulty: "Easy" as const,
      estimatedTime: "25-30 minutes",
      points: [
        { lat: 42.2808, lng: -83.743, name: "Start: Diag" },
        { lat: 42.2776, lng: -83.7382, name: "Michigan Union" },
        { lat: 42.2737, lng: -83.7347, name: "Law School" },
        { lat: 42.2769, lng: -83.7321, name: "Medical Campus" },
        { lat: 42.2808, lng: -83.743, name: "End: Diag" },
      ],
      isUpcoming: true,
      createdAt: "2025-08-10T00:00:00.000Z",
      updatedAt: "2025-08-10T00:00:00.000Z",
    };

    return NextResponse.json(fallbackRoute);
  }
}
