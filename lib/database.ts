import sqlite3 from "sqlite3";
import path from "path";

// Database record interfaces
interface RouteRecord {
  id: number;
  name: string;
  description: string;
  distance: string;
  difficulty: string;
  estimatedTime: string;
  points: string; // JSON string
  isUpcoming: number; // SQLite boolean as number
  createdAt: string;
  updatedAt: string;
}

const dbPath = path.join(process.cwd(), "data", "registrations.db");

// Ensure the data directory exists
import fs from "fs";
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize the database schema
export const initializeDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Create registrations table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          isUMUndergrad BOOLEAN NOT NULL,
          grade TEXT NOT NULL,
          major TEXT NOT NULL,
          runningExperience TEXT NOT NULL,
          fitnessLevel TEXT NOT NULL,
          goals TEXT,
          emergencyContact TEXT NOT NULL,
          emergencyPhone TEXT NOT NULL,
          medicalConditions TEXT,
          availability TEXT, -- JSON string of array
          hearAboutUs TEXT,
          additionalInfo TEXT,
          submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          ipAddress TEXT
        )
      `,
        (err) => {
          if (err) {
            console.error("Error creating registrations table:", err);
          }
        }
      );

      // Create routes table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          distance TEXT NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard')),
          estimatedTime TEXT NOT NULL,
          points TEXT NOT NULL, -- JSON string of RoutePoint array
          isUpcoming BOOLEAN DEFAULT FALSE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("Error creating routes table:", err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });
};

// Interface for registration data
export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isUMUndergrad: boolean;
  grade: string;
  major: string;
  runningExperience: string;
  fitnessLevel: string;
  goals?: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions?: string;
  availability: string[];
  hearAboutUs?: string;
  additionalInfo?: string;
  ipAddress?: string;
}

interface RegistrationRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isUMUndergrad: number;
  grade: string;
  major: string;
  runningExperience: string;
  fitnessLevel: string;
  goals: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string;
  availability: string;
  hearAboutUs: string;
  additionalInfo: string;
  submittedAt: string;
  ipAddress: string;
}

interface ProcessedRegistration
  extends Omit<RegistrationRecord, "availability" | "isUMUndergrad"> {
  availability: string[];
  isUMUndergrad: boolean;
}

// Insert a new registration
export const insertRegistration = (data: RegistrationData): Promise<number> => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO registrations (
        firstName, lastName, email, phone, isUMUndergrad, grade, major,
        runningExperience, fitnessLevel, goals, emergencyContact, emergencyPhone,
        medicalConditions, availability, hearAboutUs, additionalInfo, ipAddress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.isUMUndergrad ? 1 : 0,
      data.grade,
      data.major,
      data.runningExperience,
      data.fitnessLevel,
      data.goals || "",
      data.emergencyContact,
      data.emergencyPhone,
      data.medicalConditions || "",
      JSON.stringify(data.availability),
      data.hearAboutUs || "",
      data.additionalInfo || "",
      data.ipAddress || "",
    ];

    db.run(sql, values, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

// Get all registrations
export const getAllRegistrations = (): Promise<ProcessedRegistration[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM registrations ORDER BY submittedAt DESC",
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse availability JSON for each row
          const processedRows = (rows as RegistrationRecord[]).map(
            (row: RegistrationRecord) => ({
              ...row,
              availability: JSON.parse(row.availability || "[]") as string[],
              isUMUndergrad: row.isUMUndergrad === 1,
            })
          );
          resolve(processedRows);
        }
      }
    );
  });
};

interface RegistrationRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isUMUndergrad: number;
  grade: string;
  major: string;
  runningExperience: string;
  fitnessLevel: string;
  goals: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string;
  availability: string;
  hearAboutUs: string;
  additionalInfo: string;
  submittedAt: string;
  ipAddress: string;
}

// Check if email already exists
export const emailExists = (email: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM registrations WHERE email = ?",
      [email],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      }
    );
  });
};

// Route management types and functions
export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface RunRoute {
  id?: number;
  name: string;
  description: string;
  distance: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  estimatedTime: string;
  points: RoutePoint[];
  isUpcoming?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Add a new route
export const addRoute = (
  route: Omit<RunRoute, "id" | "createdAt" | "updatedAt">
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO routes (name, description, distance, difficulty, estimatedTime, points, isUpcoming)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        route.name,
        route.description,
        route.distance,
        route.difficulty,
        route.estimatedTime,
        JSON.stringify(route.points),
        route.isUpcoming ? 1 : 0,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// Get all routes
export const getAllRoutes = (): Promise<RunRoute[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM routes ORDER BY createdAt DESC",
      (err, rows: RouteRecord[]) => {
        if (err) {
          reject(err);
        } else {
          const routes = rows.map((row: RouteRecord) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            distance: row.distance,
            difficulty: row.difficulty as "Easy" | "Moderate" | "Hard",
            estimatedTime: row.estimatedTime,
            points: JSON.parse(row.points),
            isUpcoming: Boolean(row.isUpcoming),
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          }));
          resolve(routes);
        }
      }
    );
  });
};

// Get upcoming route
export const getUpcomingRoute = (): Promise<RunRoute | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM routes WHERE isUpcoming = 1 LIMIT 1",
      (err, row: RouteRecord | undefined) => {
        if (err) {
          reject(err);
        } else if (row) {
          const route = {
            id: row.id,
            name: row.name,
            description: row.description,
            distance: row.distance,
            difficulty: row.difficulty as "Easy" | "Moderate" | "Hard",
            estimatedTime: row.estimatedTime,
            points: JSON.parse(row.points),
            isUpcoming: Boolean(row.isUpcoming),
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          };
          resolve(route);
        } else {
          resolve(null);
        }
      }
    );
  });
};

// Update route
export const updateRoute = (
  id: number,
  route: Partial<RunRoute>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (route.name !== undefined) {
      updates.push("name = ?");
      values.push(route.name);
    }
    if (route.description !== undefined) {
      updates.push("description = ?");
      values.push(route.description);
    }
    if (route.distance !== undefined) {
      updates.push("distance = ?");
      values.push(route.distance);
    }
    if (route.difficulty !== undefined) {
      updates.push("difficulty = ?");
      values.push(route.difficulty);
    }
    if (route.estimatedTime !== undefined) {
      updates.push("estimatedTime = ?");
      values.push(route.estimatedTime);
    }
    if (route.points !== undefined) {
      updates.push("points = ?");
      values.push(JSON.stringify(route.points));
    }
    if (route.isUpcoming !== undefined) {
      updates.push("isUpcoming = ?");
      values.push(route.isUpcoming ? 1 : 0);
    }

    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    const sql = `UPDATE routes SET ${updates.join(", ")} WHERE id = ?`;

    db.run(sql, values, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Delete route
export const deleteRoute = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM routes WHERE id = ?", [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Set upcoming route (unsets all others)
export const setUpcomingRoute = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // First, unset all routes as upcoming
      db.run("UPDATE routes SET isUpcoming = 0", (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Then set the specified route as upcoming
        db.run("UPDATE routes SET isUpcoming = 1 WHERE id = ?", [id], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  });
};

// Initialize database on import
initializeDatabase().catch(console.error);

export default db;
