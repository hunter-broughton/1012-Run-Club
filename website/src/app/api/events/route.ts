import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "data.db"));

// Initialize events table
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert default events if table is empty
const eventCount = db.prepare("SELECT COUNT(*) as count FROM events").get() as {
  count: number;
};
if (eventCount.count === 0) {
  const insertEvent = db.prepare(`
    INSERT INTO events (badge, title, description, date, location, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertEvent.run(
    "WEEKLY",
    "Wednesday Group Run",
    "Our signature 5-mile group run with multiple pace groups for all fitness levels.",
    "Every Wednesday, 6:00 PM",
    "Ann Arbor - Meet at TBD",
    1
  );
  insertEvent.run(
    "WEEKEND",
    "Saturday Long Run",
    "Build endurance with our weekend long runs, perfect for marathon training.",
    "Every Saturday, 7:00 AM",
    "Ann Arbor - Meet at TBD",
    2
  );
  insertEvent.run(
    "MONTHLY",
    "Social Run & Coffee",
    "Easy-paced social run followed by coffee. Great for newcomers to meet the group.",
    "First Sunday of each month",
    "Ann Arbor - Meet at TBD",
    3
  );
}

export async function GET() {
  try {
    const events = db
      .prepare(
        "SELECT * FROM events WHERE isActive = 1 ORDER BY sortOrder ASC, id ASC"
      )
      .all();
    return NextResponse.json(events);
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
    const {
      badge,
      title,
      description,
      date,
      location,
      sortOrder = 0,
    } = await request.json();

    if (!badge || !title || !description || !date || !location) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const insert = db.prepare(`
      INSERT INTO events (badge, title, description, date, location, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      badge,
      title,
      description,
      date,
      location,
      sortOrder
    );

    const newEvent = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const { badge, title, description, date, location, sortOrder, isActive } =
      await request.json();

    const update = db.prepare(`
      UPDATE events 
      SET badge = ?, title = ?, description = ?, date = ?, location = ?, sortOrder = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = update.run(
      badge,
      title,
      description,
      date,
      location,
      sortOrder,
      isActive,
      id
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updatedEvent = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(id);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const deleteStmt = db.prepare("DELETE FROM events WHERE id = ?");
    const result = deleteStmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
