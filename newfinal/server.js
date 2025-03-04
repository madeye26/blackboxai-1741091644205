const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./js/supabase');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// API Routes
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await db.getAllEmployees();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employees/:code', async (req, res) => {
    try {
        const employee = await db.getEmployeeByCode(req.params.code);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/advances/:employeeId', async (req, res) => {
    try {
        const advances = await db.getAdvancesByEmployee(req.params.employeeId);
        res.json(advances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/advances', async (req, res) => {
    try {
        const advance = await db.createAdvance(req.body);
        res.status(201).json(advance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/salary-reports/:employeeId', async (req, res) => {
    try {
        const reports = await db.getSalaryReports(req.params.employeeId);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/salary-reports', async (req, res) => {
    try {
        const report = await db.createSalaryReport(req.body);
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Monthly Reports and Payslips Routes
app.get('/api/monthly-reports/:month', async (req, res) => {
    try {
        const report = await db.getMonthlyReport(req.params.month);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/payslips/:employeeId/:month', async (req, res) => {
    try {
        const payslip = await db.getEmployeePayslip(req.params.employeeId, req.params.month);
        res.json(payslip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// HTML Routes
app.get('/reports/monthly/:month', (req, res) => {
    res.sendFile(path.join(__dirname, 'monthly-report.html'));
});

app.get('/reports/payslip/:employeeId/:month', (req, res) => {
    res.sendFile(path.join(__dirname, 'payslip.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log('Access the application from other devices using your computer\'s IP address');
});
