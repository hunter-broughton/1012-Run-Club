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
