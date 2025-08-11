import { NextResponse } from "next/server";

// Static events data (no database needed)
const staticEvents = [
  {
    id: 1,
    badge: "WEEKLY",
    title: "Wednesday Group Run",
    description: "Our signature 5-mile group run with multiple pace groups for all fitness levels.",
    date: "Every Wednesday, 6:00 PM",
    location: "Ann Arbor - Meet at TBD",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    badge: "WEEKEND",
    title: "Saturday Long Run",
    description: "Build endurance with our weekend long runs, perfect for marathon training.",
    date: "Every Saturday, 7:00 AM",
    location: "Ann Arbor - Meet at TBD",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    badge: "MONTHLY",
    title: "Social Run & Coffee",
    description: "Easy-paced social run followed by coffee. Great for newcomers to meet the group.",
    date: "First Sunday of each month",
    location: "Ann Arbor - Meet at TBD",
    isActive: true,
    sortOrder: 3,
  },
];

export async function GET() {
  try {
    // Return static events filtered by active status and sorted
    const activeEvents = staticEvents
      .filter(event => event.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
      
    return NextResponse.json(activeEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
