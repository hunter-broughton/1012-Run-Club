import { NextRequest, NextResponse } from "next/server";
import { submitToGoogleForm } from "../../../utils/googleForm";

// Backend validation function - simplified for your Google Form fields
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
  if (!data.grade || typeof data.grade !== "string") {
    errors.push("Class year is required");
  }

  // Email format validation
  if (
    data.email &&
    typeof data.email === "string" &&
    data.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    errors.push("Invalid email format");
  }

  // Grade validation - updated to match your form options
  const validGrades = ["Freshman", "Sophomore", "Junior", "Senior", "Other"];
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

    // Prepare data for Google Form submission (only fields that exist in your form)
    const registrationData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      grade: data.grade,
      availability: Array.isArray(data.availability) ? data.availability : [],
      hearAboutUs: data.hearAboutUs?.trim() || "",
      ipAddress: ipAddress,
    };

    // Submit to Google Form
    const result = await submitToGoogleForm(registrationData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to submit registration. Please try again.",
          errors: [result.error || "Submission failed"],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully",
      registrationId: `gf_${Date.now()}`, // Generate a simple ID for consistency
    });
  } catch (error) {
    console.error("Registration submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "There was an error processing your registration. Please try again.",
        errors: ["Internal server error"],
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET request to check server status
export async function GET() {
  return NextResponse.json({
    message: "Google Form registration endpoint is running",
    timestamp: new Date().toISOString(),
  });
}
