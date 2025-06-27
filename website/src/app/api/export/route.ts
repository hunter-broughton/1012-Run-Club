import { NextRequest, NextResponse } from "next/server";
import { getAllRegistrations } from "../../../../lib/database";
import * as csvWriter from "csv-writer";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    // Get all registrations from database
    const registrations = await getAllRegistrations();

    if (registrations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No registrations found",
        },
        { status: 404 }
      );
    }

    // Define CSV headers
    const csvHeaders = [
      { id: "id", title: "ID" },
      { id: "submittedAt", title: "Submission Date" },
      { id: "firstName", title: "First Name" },
      { id: "lastName", title: "Last Name" },
      { id: "email", title: "Email" },
      { id: "phone", title: "Phone" },
      { id: "grade", title: "Class Year" },
      { id: "major", title: "Major" },
      { id: "runningExperience", title: "Running Experience" },
      { id: "fitnessLevel", title: "Fitness Level" },
      { id: "goals", title: "Goals" },
      { id: "emergencyContact", title: "Emergency Contact" },
      { id: "emergencyPhone", title: "Emergency Phone" },
      { id: "medicalConditions", title: "Medical Conditions" },
      { id: "availability", title: "Availability" },
      { id: "hearAboutUs", title: "How They Heard About Us" },
      { id: "additionalInfo", title: "Additional Information" },
      { id: "ipAddress", title: "IP Address" },
    ];

    // Create temporary CSV file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const csvFileName = `hill-street-run-club-registrations-${timestamp}.csv`;
    const csvFilePath = path.join(process.cwd(), "temp", csvFileName);

    // Ensure temp directory exists
    const tempDir = path.dirname(csvFilePath);
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Create CSV writer
    const csvWriterInstance = csvWriter.createObjectCsvWriter({
      path: csvFilePath,
      header: csvHeaders,
    });

    // Prepare data for CSV
    const csvData = registrations.map((reg) => ({
      ...reg,
      availability: Array.isArray(reg.availability)
        ? reg.availability.join(", ")
        : reg.availability,
      submittedAt: new Date(reg.submittedAt).toLocaleString(),
      isUMUndergrad: reg.isUMUndergrad ? "Yes" : "No",
    }));

    // Write CSV file
    await csvWriterInstance.writeRecords(csvData);

    // Read the file and return as response
    const csvContent = await fs.readFile(csvFilePath, "utf8");

    // Clean up temporary file
    try {
      await fs.unlink(csvFilePath);
    } catch (error) {
      console.warn("Failed to clean up temporary CSV file:", error);
    }

    // Return CSV content as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${csvFileName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
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
      const registrations = await getAllRegistrations();
      return NextResponse.json({
        success: true,
        data: registrations,
        count: registrations.length,
      });
    }

    // Default to CSV export
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
