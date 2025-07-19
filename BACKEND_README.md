# Hill Street Run Club Backend

This document describes the backend database system for managing registration form submissions.

## Features

- ✅ **Form Validation**: Backend validation ensures only valid UMich undergraduate students can register
- ✅ **Email Validation**: Requires @umich.edu email addresses
- ✅ **Duplicate Prevention**: Prevents duplicate registrations by email
- ✅ **SQLite Database**: Local database storage for registration data
- ✅ **CSV Export**: Easy export to Excel-compatible CSV files
- ✅ **Admin Dashboard**: Web interface to view and export registrations

## API Endpoints

### Registration Submission

```
POST /api/register
```

Accepts form data and validates:

- Required fields completion
- Valid @umich.edu email format
- Undergraduate student confirmation
- Duplicate email prevention

### Data Export

```
GET /api/export
```

Downloads all registrations as a CSV file ready for Excel.

```
POST /api/export
Content-Type: application/json
{ "format": "json" }
```

Returns registration data in JSON format.

## Admin Dashboard

Access the admin dashboard at `/admin` with password: `hillstreet2025`

Features:

- View all registrations in a table
- See total registration count
- Export data to CSV with one click
- Responsive design for mobile/desktop

## Database Schema

The SQLite database stores the following fields:

| Field             | Type     | Required | Description                                   |
| ----------------- | -------- | -------- | --------------------------------------------- |
| id                | INTEGER  | Auto     | Primary key                                   |
| firstName         | TEXT     | Yes      | Student's first name                          |
| lastName          | TEXT     | Yes      | Student's last name                           |
| email             | TEXT     | Yes      | UMich email (@umich.edu)                      |
| phone             | TEXT     | Yes      | Phone number                                  |
| isUMUndergrad     | BOOLEAN  | Yes      | Confirms undergraduate status                 |
| grade             | TEXT     | Yes      | Class year (freshman/sophomore/junior/senior) |
| major             | TEXT     | Yes      | Field of study                                |
| runningExperience | TEXT     | Yes      | Running background                            |
| fitnessLevel      | TEXT     | Yes      | Current fitness level                         |
| goals             | TEXT     | No       | Running goals                                 |
| emergencyContact  | TEXT     | Yes      | Emergency contact name                        |
| emergencyPhone    | TEXT     | Yes      | Emergency contact phone                       |
| medicalConditions | TEXT     | No       | Medical conditions or "None"                  |
| availability      | TEXT     | No       | JSON array of available days                  |
| hearAboutUs       | TEXT     | No       | How they heard about the club                 |
| additionalInfo    | TEXT     | No       | Additional information                        |
| submittedAt       | DATETIME | Auto     | Submission timestamp                          |
| ipAddress         | TEXT     | Auto     | Client IP address                             |

## Files Structure

```
/lib/database.ts          # Database operations and schema
/src/app/api/register/    # Form submission endpoint
/src/app/api/export/      # Data export endpoint
/src/app/admin/          # Admin dashboard page
/data/                   # SQLite database files (gitignored)
/temp/                   # Temporary CSV files (gitignored)
```

## Setup Instructions

1. Dependencies are already installed (`sqlite3`, `csv-writer`)
2. Database will auto-initialize on first run
3. Data stored in `/data/registrations.db`
4. Access admin dashboard at `/admin`

## Security Notes

- Database files are gitignored for security
- Simple password protection on admin dashboard (change in production)
- Input validation on both frontend and backend
- IP address logging for audit trail

## CSV Export Format

The exported CSV includes all registration data with:

- Human-readable timestamps
- Availability as comma-separated values
- Boolean fields as Yes/No
- All contact and emergency information
- Medical conditions and additional notes

Perfect for opening in Excel for team review and management!
