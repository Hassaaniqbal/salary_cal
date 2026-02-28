document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

            processSalaryData(jsonData);
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function processSalaryData(data) {
    console.log('Processing Excel data:', data);

    // Configuration - can be adjusted
    const NORMAL_WORK_HOURS = 11; // 11 hours per day
    const OT_HOURLY_RATE = 150;
    const BASE_SALARY = 40000; // Default, will be overridden if found in Excel
    const BONUS = 5000; // Default
    const FOOD_DEDUCTION = 14000; // Default

    // Extract basic information
    let dept = 'N/A';
    let company = 'N/A';
    let period = 'N/A';

    // Try to find department and company info
    for (let i = 0; i < Math.min(5, data.length); i++) {
        if (data[i][0]) {
            const label = String(data[i][0]).toUpperCase();
            if (label.includes('DEPT')) {
                dept = data[i][1] || 'N/A';
                company = data[i][2] || 'N/A';
            } else if (label.includes('DATE') || label.includes('PERIOD')) {
                period = data[i][1] || 'N/A';
            }
        }
    }

    // Find attendance table header
    let attendanceStartRow = -1;
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (String(row[0]).toLowerCase().includes('date') &&
            String(row[1]).toLowerCase().includes('week')) {
            attendanceStartRow = i + 1;
            break;
        }
    }

    // Calculate work hours and overtime from attendance
    let totalOvertimeHours = 0;
    let absentDays = 0;
    let casualDays = 0;
    let businessDays = 0;

    if (attendanceStartRow > 0) {
        // Process each day's attendance
        for (let i = attendanceStartRow; i < data.length; i++) {
            const row = data[i];

            // Stop if we hit empty rows or non-numeric date
            if (!row[0] || isNaN(parseInt(row[0]))) {
                break;
            }

            const date = parseInt(row[0]);
            if (date < 1 || date > 31) break;

            // Extract time entries (First On/Off, Second On/Off, Third On/Off, Over In/Out)
            let firstOn = row[2];
            let firstOff = row[3];
            let secondOn = row[4];
            let secondOff = row[5];
            let thirdOn = row[6];
            let thirdOff = row[7];
            let overIn = row[8];
            let overOut = row[9];

            // Check if absent (--:-- or empty)
            if (!firstOn || String(firstOn).includes('--') || String(firstOn).trim() === '') {
                absentDays++;
                continue;
            }

            // Calculate total hours for the day
            let totalHours = 0;

            // Add hours from each shift
            if (firstOn && firstOff) {
                totalHours += calculateHoursDifference(firstOn, firstOff);
            }
            if (secondOn && secondOff) {
                totalHours += calculateHoursDifference(secondOn, secondOff);
            }
            if (thirdOn && thirdOff) {
                totalHours += calculateHoursDifference(thirdOn, thirdOff);
            }
            if (overIn && overOut) {
                totalHours += calculateHoursDifference(overIn, overOut);
            }

            // Calculate overtime (anything over normal hours)
            if (totalHours > NORMAL_WORK_HOURS) {
                totalOvertimeHours += (totalHours - NORMAL_WORK_HOURS);
            }
        }
    }

    // Extract salary components from the Excel
    let baseSalary = BASE_SALARY;
    let bonus = BONUS;
    let foodDeduction = FOOD_DEDUCTION;
    let absentDeduction = 0;
    let advance = 0;
    let halfDayDeduction = 0;

    // Try to find salary components in the file
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const label = String(row[0]).toUpperCase().trim();

        if (label.includes('SALARY') && !label.includes('FINAL')) {
            baseSalary = parseFloat(row[3]) || BASE_SALARY;
        } else if (label.includes('BONUS')) {
            bonus = parseFloat(row[3]) || BONUS;
        } else if (label.includes('FOOD')) {
            foodDeduction = parseFloat(row[2]) || FOOD_DEDUCTION;
        } else if (label.includes('ABSENT') && !label.includes('DAYS')) {
            absentDeduction = parseFloat(row[2]) || 0;
        } else if (label.includes('ADVANCE')) {
            advance = parseFloat(row[2]) || 0;
        } else if (label.includes('HALF DAY')) {
            halfDayDeduction = parseFloat(row[2]) || 0;
        } else if (label.includes('CASUAL')) {
            casualDays = parseFloat(row[1]) || 0;
        } else if (label.includes('BUSINESS')) {
            businessDays = parseFloat(row[2]) || 0;
        }
    }

    // Calculate OT amount
    const otAmount = totalOvertimeHours * OT_HOURLY_RATE;

    // Calculate totals
    const totalCredit = baseSalary + otAmount + bonus;
    const totalDebit = foodDeduction + absentDeduction + advance + halfDayDeduction;
    const finalSalary = totalCredit - totalDebit;

    // Display results
    displayResults({
        dept,
        company,
        period,
        absentDays,
        casualDays,
        businessDays,
        overtimeHours: totalOvertimeHours,
        baseSalary,
        otAmount,
        bonus,
        totalCredit,
        foodDeduction,
        absentDeduction,
        advance,
        halfDayDeduction,
        totalDebit,
        finalSalary
    });
}

function calculateHoursDifference(startTime, endTime) {
    if (!startTime || !endTime) return 0;

    // Convert time strings like "10:05" or "20:08" to hours
    const parseTime = (timeStr) => {
        const str = String(timeStr).trim();

        // Handle formats like "10:05" or "10.05"
        const parts = str.split(/[:.]/);
        if (parts.length >= 2) {
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            return hours + minutes / 60;
        }

        // Handle decimal format like 10.05 (10 hours 5 minutes)
        const num = parseFloat(str);
        if (!isNaN(num)) {
            const hours = Math.floor(num);
            const minutes = Math.round((num - hours) * 100); // .05 means 5 minutes
            return hours + minutes / 60;
        }

        return 0;
    };

    let start = parseTime(startTime);
    let end = parseTime(endTime);

    // If end time is less than start time, it means it crossed midnight
    if (end < start) {
        end += 24;
    }

    return end - start;
}

function displayResults(data) {
    // Show results section
    document.getElementById('results').style.display = 'block';

    // Basic info
    document.getElementById('dept').textContent = data.dept;
    document.getElementById('company').textContent = data.company;
    document.getElementById('period').textContent = data.period;

    // Attendance
    document.getElementById('absentDays').textContent = data.absentDays;
    document.getElementById('casualDays').textContent = data.casualDays;
    document.getElementById('businessDays').textContent = data.businessDays;
    document.getElementById('overtimeHours').textContent = data.overtimeHours.toFixed(2);

    // Credits
    document.getElementById('baseSalary').textContent = formatCurrency(data.baseSalary);
    document.getElementById('overtime').textContent = formatCurrency(data.otAmount);
    document.getElementById('bonus').textContent = formatCurrency(data.bonus);
    document.getElementById('totalCredit').textContent = formatCurrency(data.totalCredit);

    // Debits
    document.getElementById('foodDeduction').textContent = formatCurrency(data.foodDeduction);
    document.getElementById('absentDeduction').textContent = formatCurrency(data.absentDeduction);
    document.getElementById('advance').textContent = formatCurrency(data.advance);
    document.getElementById('halfDayDeduction').textContent = formatCurrency(data.halfDayDeduction);
    document.getElementById('totalDebit').textContent = formatCurrency(data.totalDebit);

    // Final salary
    document.getElementById('finalSalary').textContent = formatCurrency(data.finalSalary);
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
