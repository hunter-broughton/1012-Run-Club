import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Check against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error - admin password not configured" },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      // In production, you'd want to create a JWT token here
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
      });
    } else {
      // Add a small delay to prevent brute force attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}

// Reject other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
