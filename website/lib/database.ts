import sqlite3 from "sqlite3";
import path from "path";

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

// Initialize database on import
initializeDatabase().catch(console.error);

export default db;
