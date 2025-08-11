import { NextRequest, NextResponse } from "next/server";
import {
  getAllRoutes,
  addRoute,
  updateRoute,
  deleteRoute,
  setUpcomingRoute,
} from "../../../../lib/jsonDatabase";

export async function GET() {
  try {
    const routes = await getAllRoutes();
    return NextResponse.json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is an action-based request (legacy) or direct POST (new)
    if (body.action) {
      const { action, ...routeData } = body;

      if (action === "add") {
        const routeId = await addRoute(routeData);
        return NextResponse.json({
          id: routeId,
          message: "Route added successfully",
        });
      } else if (action === "update") {
        const { id, ...updateData } = routeData;
        await updateRoute(id, updateData);
        return NextResponse.json({ message: "Route updated successfully" });
      } else if (action === "delete") {
        await deleteRoute(routeData.id);
        return NextResponse.json({ message: "Route deleted successfully" });
      } else if (action === "setUpcoming") {
        await setUpcomingRoute(routeData.id);
        return NextResponse.json({
          message: "Upcoming route set successfully",
        });
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    } else {
      // Direct POST request to create a new route
      const routeId = await addRoute(body);
      return NextResponse.json({
        id: routeId,
        message: "Route created successfully",
      });
    }
  } catch (error) {
    console.error("Error managing routes:", error);
    return NextResponse.json(
      {
        error: "Failed to manage routes",
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
    const action = url.searchParams.get("action");

    if (!id) {
      return NextResponse.json(
        { error: "Route ID is required" },
        { status: 400 }
      );
    }

    if (action === "set-upcoming") {
      // Set this route as upcoming (unsets all others)
      await setUpcomingRoute(parseInt(id));
      return NextResponse.json({ message: "Upcoming route set successfully" });
    } else {
      // Update route data
      const body = await request.json();
      await updateRoute(parseInt(id), body);
      return NextResponse.json({ message: "Route updated successfully" });
    }
  } catch (error) {
    console.error("Error updating route:", error);
    return NextResponse.json(
      {
        error: "Failed to update route",
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
        { error: "Route ID is required" },
        { status: 400 }
      );
    }

    await deleteRoute(parseInt(id));
    return NextResponse.json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      {
        error: "Failed to delete route",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
