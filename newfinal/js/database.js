/**
 * Database Configuration and Utility Functions
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root', // Change this to your MySQL username
    password: '', // Change this to your MySQL password
    database: 'payroll_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database utility functions
const db = {
    /**
     * Execute a query with parameters
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise} Query result
     */
    query: async (sql, params) => {
        try {
            const [results] = await pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    },

    /**
     * Get employee by code
     * @param {string} code - Employee code
     * @returns {Promise} Employee data
     */
    getEmployeeByCode: async (code) => {
        const sql = 'SELECT * FROM employees WHERE code = ?';
        const results = await db.query(sql, [code]);
        return results[0];
    },

    /**
     * Get all employees
     * @returns {Promise} Array of employees
     */
    getAllEmployees: async () => {
        const sql = 'SELECT * FROM employees ORDER BY name';
        return await db.query(sql);
    },

    /**
     * Create new employee
     * @param {Object} employee - Employee data
     * @returns {Promise} Created employee
     */
    createEmployee: async (employee) => {
        const sql = 'INSERT INTO employees (code, name, job_title, basic_salary) VALUES (?, ?, ?, ?)';
        const result = await db.query(sql, [
            employee.code,
            employee.name,
            employee.jobTitle,
            employee.basicSalary
        ]);
        return { id: result.insertId, ...employee };
    },

    /**
     * Get advances by employee ID
     * @param {number} employeeId - Employee ID
     * @returns {Promise} Array of advances
     */
    getAdvancesByEmployee: async (employeeId) => {
        const sql = 'SELECT * FROM advances WHERE employee_id = ? ORDER BY date DESC';
        return await db.query(sql, [employeeId]);
    },

    /**
     * Create new advance
     * @param {Object} advance - Advance data
     * @returns {Promise} Created advance
     */
    createAdvance: async (advance) => {
        const sql = 'INSERT INTO advances (employee_id, amount, date) VALUES (?, ?, ?)';
        const result = await db.query(sql, [
            advance.employeeId,
            advance.amount,
            advance.date
        ]);
        return { id: result.insertId, ...advance };
    },

    /**
     * Get salary reports by employee ID
     * @param {number} employeeId - Employee ID
     * @returns {Promise} Array of salary reports
     */
    getSalaryReports: async (employeeId) => {
        const sql = 'SELECT * FROM salary_reports WHERE employee_id = ? ORDER BY month DESC';
        return await db.query(sql, [employeeId]);
    },

    /**
     * Create salary report
     * @param {Object} report - Salary report data
     * @returns {Promise} Created salary report
     */
    createSalaryReport: async (report) => {
        const sql = `
            INSERT INTO salary_reports 
            (employee_id, month, basic_salary, advances_deduction, other_deductions, bonuses, net_salary) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await db.query(sql, [
            report.employeeId,
            report.month,
            report.basicSalary,
            report.advancesDeduction,
            report.otherDeductions,
            report.bonuses,
            report.netSalary
        ]);
        return { id: result.insertId, ...report };
    },

    /**
     * Record backup in history
     * @param {Object} backup - Backup data
     * @returns {Promise} Created backup record
     */
    recordBackup: async (backup) => {
        const sql = 'INSERT INTO backup_history (backup_date, backup_type, status, notes) VALUES (?, ?, ?, ?)';
        const result = await db.query(sql, [
            backup.date,
            backup.type,
            backup.status,
            backup.notes
        ]);
        return { id: result.insertId, ...backup };
    }
};

module.exports = db;