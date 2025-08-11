import { NextRequest, NextResponse } from "next/server";
import {
  getAllEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from "../../../../lib/jsonDatabase";

export async function GET() {
  try {
    const events = await getAllEvents();

    // Return events filtered by active status and sorted
    const activeEvents = events
      .filter((event) => event.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json(activeEvents);
  } catch (error) {
    console.error("Error fetching events:", error);

    // Fallback: Return static default events if file system fails
    const fallbackEvents = [
      {
        id: 1,
        badge: "WEEKLY",
        title: "Wednesday Group Run",
        description:
          "Our signature 5-mile group run with multiple pace groups for all fitness levels.",
        date: "Every Wednesday, 6:00 PM",
        location: "Ann Arbor - Meet at TBD",
        isActive: true,
        sortOrder: 1,
        createdAt: "2025-08-10T00:00:00.000Z",
        updatedAt: "2025-08-10T00:00:00.000Z",
      },
      {
        id: 2,
        badge: "WEEKEND",
        title: "Saturday Long Run",
        description:
          "Build endurance with our weekend long runs, perfect for marathon training.",
        date: "Every Saturday, 7:00 AM",
        location: "Ann Arbor - Meet at TBD",
        isActive: true,
        sortOrder: 2,
        createdAt: "2025-08-10T00:00:00.000Z",
        updatedAt: "2025-08-10T00:00:00.000Z",
      },
      {
        id: 3,
        badge: "MONTHLY",
        title: "Social Run & Coffee",
        description:
          "Easy-paced social run followed by coffee. Great for newcomers to meet the group.",
        date: "First Sunday of each month",
        location: "Ann Arbor - Meet at TBD",
        isActive: true,
        sortOrder: 3,
        createdAt: "2025-08-10T00:00:00.000Z",
        updatedAt: "2025-08-10T00:00:00.000Z",
      },
    ];

    return NextResponse.json(fallbackEvents);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is an action-based request (legacy) or direct POST (new)
    if (body.action) {
      const { action, ...eventData } = body;

      if (action === "add") {
        const eventId = await addEvent(eventData);
        return NextResponse.json({
          id: eventId,
          message: "Event added successfully",
        });
      } else if (action === "update") {
        const { id, ...updateData } = eventData;
        await updateEvent(id, updateData);
        return NextResponse.json({ message: "Event updated successfully" });
      } else if (action === "delete") {
        await deleteEvent(eventData.id);
        return NextResponse.json({ message: "Event deleted successfully" });
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    } else {
      // Direct POST request to create a new event
      const eventId = await addEvent(body);
      return NextResponse.json({
        id: eventId,
        message: "Event created successfully",
      });
    }
  } catch (error) {
    console.error("Error managing events:", error);
    return NextResponse.json(
      {
        error: "Failed to manage events",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    await updateEvent(parseInt(id), body);
    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        error: "Failed to update event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    await deleteEvent(parseInt(id));
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      {
        error: "Failed to delete event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
