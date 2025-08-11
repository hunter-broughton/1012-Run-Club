// Google Form configuration and utilities
export interface GoogleFormConfig {
  formUrl: string;
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    grade: string;
    availability: string;
    hearAboutUs: string;
  };
}

// Default configuration - updated with your actual Google Form details
export const defaultGoogleFormConfig: GoogleFormConfig = {
  formUrl:
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfNFyyMVezqwl1o3RzH_iDuoWVcTW6J10K9crXDLA2AGlEylg/formResponse",
  fields: {
    firstName: "entry.1579531420",
    lastName: "entry.1730873985",
    email: "entry.1999657606",
    phone: "entry.1900776617",
    grade: "entry.1330367471",
    availability: "entry.462073072",
    hearAboutUs: "entry.1087654147",
  },
};

// Function to extract Google Form field names from a form URL
export const extractFormFields = (formHtml: string): Record<string, string> => {
  const fields: Record<string, string> = {};

  // Regex to find entry fields in the HTML
  const entryRegex = /name="(entry\.\d+)"/g;
  let match;

  while ((match = entryRegex.exec(formHtml)) !== null) {
    const entryId = match[1];
    console.log(`Found field: ${entryId}`);
    // You would manually map these to your form fields
  }

  return fields;
};

// Helper function to create form data for Google Forms submission
export const createGoogleFormData = (
  data: Record<string, unknown>,
  config: GoogleFormConfig
): FormData => {
  const formData = new FormData();

  // Map only the fields that actually exist in your Google Form
  formData.append(config.fields.firstName, data.firstName as string);
  formData.append(config.fields.lastName, data.lastName as string);
  formData.append(config.fields.email, data.email as string);
  formData.append(config.fields.phone, data.phone as string);

  // For Class Year - your form has this field
  formData.append(config.fields.grade, data.grade as string);

  // Handle availability - if it's an array, join with commas, otherwise use as string
  if (data.availability) {
    if (Array.isArray(data.availability)) {
      // Join multiple selections with commas for Google Forms
      formData.append(config.fields.availability, data.availability.join(", "));
    } else {
      formData.append(config.fields.availability, data.availability as string);
    }
  }

  // How did you hear about us
  if (data.hearAboutUs) {
    formData.append(config.fields.hearAboutUs, data.hearAboutUs as string);
  }

  return formData;
};

// Function to submit to Google Form
export const submitToGoogleForm = async (
  data: Record<string, unknown>,
  config: GoogleFormConfig = defaultGoogleFormConfig
): Promise<{ success: boolean; error?: string }> => {
  try {
    const formData = createGoogleFormData(data, config);

    // Debug: Log what we're sending to Google Forms
    console.log("Submitting to Google Form:", config.formUrl);
    console.log("Form data entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    const response = await fetch(config.formUrl, {
      method: "POST",
      body: formData,
      mode: "no-cors", // Important for Google Forms
    });

    // With no-cors mode, we can't read the response, so we assume success
    // if no error was thrown
    console.log("Google Form submission completed");
    return { success: true };
  } catch (error) {
    console.error("Error submitting to Google Form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
