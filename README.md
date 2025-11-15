# MNS Homeware - Employee Salary Calculator

A web-based application for MNS Homeware to automatically calculate employee monthly salaries by uploading attendance Excel files.

## Overview

This salary calculator processes employee attendance data from Excel files and automatically calculates the final monthly salary including overtime payments, bonuses, and various deductions.

## Features

- **Excel File Upload**: Simply upload employee attendance Excel file
- **Automatic Calculation**: Instantly calculates salary based on attendance
- **Overtime Tracking**: Automatically tracks and calculates OT hours and payment
- **Smart Detection**: Identifies half-days, late arrivals, and absents
- **Paid Leave Management**: Handles paid and unpaid leaves
- **PDF Report Generation**: Download detailed salary report
- **Real-time Updates**: Change salary parameters and see instant results
- **Responsive Design**: Works on desktop, tablet, and mobile

## How to Use

### Step 1: Configure Settings
Set your company's salary parameters:
- Base Salary
- OT Rate per Hour
- Full Attendance Bonus
- Food Deduction
- Paid Leaves Allowed
- Advance Amount (if any)

### Step 2: Upload Attendance File
- Click "Upload Excel File" or drag and drop
- The Excel file should contain daily attendance with clock-in and clock-out times

### Step 3: View Results
The system automatically displays:
- Attendance statistics (work days, absents, OT hours)
- Daily attendance details
- Salary breakdown (credits and deductions)
- Final salary amount

### Step 4: Download Report
Click "Download PDF Report" to get a complete salary report

## Salary Components

**Credits:**
- Base Salary
- Overtime Payment
- Full Attendance Bonus (if applicable)

**Deductions:**
- Food Deduction
- Absent Days Deduction
- Half Day Deduction
- Late Arrival Penalty
- Advance Amount

## Working Hours Policy

- **Work Time**: 10:00 AM - 7:00 PM
- **OT**: Work done after 7:00 PM
- **Late**: Arrivals after 10:30 AM incur penalty
- **Half Day**: Leaving at/before 5 PM or arriving after 12 PM

## Installation

1. Download the project files
2. Open `index.html` in any web browser
3. No installation or server required

## Technical Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Excel file (.xlsx or .xls) with attendance data

## File Format

The attendance Excel file should have:
- Date range in the header
- Daily records with: Date, Day, Clock In time, Clock Out time
- Standard format as provided by the company

## Browser Compatibility

Works on all modern browsers:
- Google Chrome ✓
- Mozilla Firefox ✓
- Safari ✓
- Microsoft Edge ✓

## Support

Developed by: Hassaan
For MNS Homeware

---

© 2025 All Rights Reserved - MNS Homeware Employee Salary Calculator
