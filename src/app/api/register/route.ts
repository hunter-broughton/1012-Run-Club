import { NextRequest, NextResponse } from "next/server";
import {
  insertRegistration,
  emailExists,
  RegistrationData,
} from "../../../../lib/database";

// Backend validation function
const validateRegistrationData = (
  data: Record<string, unknown>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required field validation with type checking
  if (
    !data.firstName ||
    typeof data.firstName !== "string" ||
    !data.firstName.trim()
  ) {
    errors.push("First name is required");
  }
  if (
    !data.lastName ||
    typeof data.lastName !== "string" ||
    !data.lastName.trim()
  ) {
    errors.push("Last name is required");
  }
  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email address is required");
  } else if (!data.email.endsWith("@umich.edu")) {
    errors.push(
      "Email must be a valid University of Michigan email address ending in @umich.edu"
    );
  }
  if (!data.phone || typeof data.phone !== "string" || !data.phone.trim()) {
    errors.push("Phone number is required");
  }
  if (data.isUMUndergrad !== true) {
    errors.push(
      "Must confirm current University of Michigan undergraduate student status"
    );
  }
  if (!data.grade || typeof data.grade !== "string" || !data.grade.trim()) {
    errors.push("Class year is required");
  }
  if (
    !data.emergencyContact ||
    typeof data.emergencyContact !== "string" ||
    !data.emergencyContact.trim()
  ) {
    errors.push("Emergency contact name is required");
  }
  if (
    !data.emergencyPhone ||
    typeof data.emergencyPhone !== "string" ||
    !data.emergencyPhone.trim()
  ) {
    errors.push("Emergency contact phone is required");
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@umich\.edu$/;
  if (
    data.email &&
    typeof data.email === "string" &&
    !emailRegex.test(data.email)
  ) {
    errors.push("Invalid email format");
  }

  // Grade validation
  const validGrades = ["freshman", "sophomore", "junior", "senior"];
  if (
    data.grade &&
    typeof data.grade === "string" &&
    !validGrades.includes(data.grade)
  ) {
    errors.push("Invalid class year");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Get client IP address
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Validate the data
    const validation = validateRegistrationData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const exists = await emailExists(data.email);
    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "An application with this email address already exists",
          errors: ["Email address already registered"],
        },
        { status: 409 }
      );
    }

    // Prepare data for database insertion
    const registrationData: RegistrationData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      isUMUndergrad: data.isUMUndergrad,
      grade: data.grade,
      emergencyContact: data.emergencyContact.trim(),
      emergencyPhone: data.emergencyPhone.trim(),
      medicalConditions: data.medicalConditions?.trim() || "",
      availability: Array.isArray(data.availability) ? data.availability : [],
      hearAboutUs: data.hearAboutUs?.trim() || "",
      additionalInfo: data.additionalInfo?.trim() || "",
      ipAddress: ipAddress,
    };

    // Insert into database
    const registrationId = await insertRegistration(registrationData);

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully",
      registrationId,
    });
  } catch (error) {
    console.error("Registration submission error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return NextResponse.json(
          {
            success: false,
            message: "An application with this email address already exists",
            errors: ["Email address already registered"],
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Please try again later.",
        errors: ["Server error occurred"],
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET request to check server status
export async function GET() {
  return NextResponse.json({
    message: "Registration API is running",
    timestamp: new Date().toISOString(),
  });
}
