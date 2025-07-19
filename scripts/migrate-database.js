const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(process.cwd(), "data", "registrations.db");
const db = new sqlite3.Database(dbPath);

console.log("Starting database migration...");

db.serialize(() => {
  // Check if the old columns exist
  db.all("PRAGMA table_info(registrations)", (err, columns) => {
    if (err) {
      console.error("Error getting table info:", err);
      return;
    }

    const columnNames = columns.map((col) => col.name);
    const hasOldColumns =
      columnNames.includes("major") ||
      columnNames.includes("runningExperience") ||
      columnNames.includes("fitnessLevel") ||
      columnNames.includes("goals");

    if (hasOldColumns) {
      console.log("Old columns found. Creating new table structure...");

      // Create new table with updated structure
      db.run(
        `
        CREATE TABLE registrations_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          isUMUndergrad BOOLEAN NOT NULL,
          grade TEXT NOT NULL,
          emergencyContact TEXT NOT NULL,
          emergencyPhone TEXT NOT NULL,
          medicalConditions TEXT,
          availability TEXT,
          hearAboutUs TEXT,
          additionalInfo TEXT,
          submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          ipAddress TEXT
        )
      `,
        (err) => {
          if (err) {
            console.error("Error creating new table:", err);
            return;
          }

          // Copy data from old table to new table (excluding removed columns)
          db.run(
            `
          INSERT INTO registrations_new (
            id, firstName, lastName, email, phone, isUMUndergrad, grade,
            emergencyContact, emergencyPhone, medicalConditions, availability,
            hearAboutUs, additionalInfo, submittedAt, ipAddress
          )
          SELECT 
            id, firstName, lastName, email, phone, isUMUndergrad, grade,
            emergencyContact, emergencyPhone, medicalConditions, availability,
            hearAboutUs, additionalInfo, submittedAt, ipAddress
          FROM registrations
        `,
            (err) => {
              if (err) {
                console.error("Error copying data:", err);
                return;
              }

              // Drop old table
              db.run("DROP TABLE registrations", (err) => {
                if (err) {
                  console.error("Error dropping old table:", err);
                  return;
                }

                // Rename new table
                db.run(
                  "ALTER TABLE registrations_new RENAME TO registrations",
                  (err) => {
                    if (err) {
                      console.error("Error renaming table:", err);
                      return;
                    }

                    console.log("Database migration completed successfully!");
                    db.close();
                  }
                );
              });
            }
          );
        }
      );
    } else {
      console.log("Database is already up to date.");
      db.close();
    }
  });
});
