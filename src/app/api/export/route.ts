import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Since we're now using Google Forms for registrations,
    // redirect users to export from Google Forms directly
    return NextResponse.json(
      {
        success: false,
        message: "Registration data is now stored in Google Forms. Please export directly from your Google Form responses.",
        redirectUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfNFyyMVezqwl1o3RzH_iDuoWVcTW6J10K9crXDLA2AGlEylg/edit#responses",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export registrations",
      },
      { status: 500 }
    );
  }
}

// Optional: GET with query parameter for format
export async function POST(request: NextRequest) {
  try {
    const { format } = await request.json();

    if (format === "json") {
      // Since registrations are now in Google Forms, return empty data
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: "Registration data is now stored in Google Forms. Please export directly from your Google Form responses.",
      });
    }

    // Default to redirecting to Google Forms
    return GET();
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export data",
      },
      { status: 500 }
    );
  }
}
