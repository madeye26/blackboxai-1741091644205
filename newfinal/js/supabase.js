/**
 * Supabase Configuration and Utility Functions
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
// This line is redundant as supabase client is created below
// const supabase = createClient(supabaseUrl, supabaseKey)


// Validate configuration
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required Supabase configuration. Please check your .env file.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    },
    db: {
        schema: 'public'
    }
});

// Database utility functions
const db = {
    /**
     * Get employee by code
     * @param {string} code - Employee code
     * @returns {Promise} Employee data
     */
    getEmployeeByCode: async (code) => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('code', code)
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Get all employees
     * @returns {Promise} Array of employees
     */
    getAllEmployees: async () => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data;
    },

    /**
     * Create new employee
     * @param {Object} employee - Employee data
     * @returns {Promise} Created employee
     */
    createEmployee: async (employee) => {
        const { data, error } = await supabase
            .from('employees')
            .insert([
                {
                    code: employee.code,
                    name: employee.name,
                    job_title: employee.job_title,
                    basic_salary: employee.basic_salary,
                    monthly_incentives: employee.monthly_incentives
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Update existing employee
     * @param {number} employeeId - Employee ID
     * @param {Object} employee - Updated employee data
     * @returns {Promise} Updated employee
     */
    updateEmployee: async (employeeId, employee) => {
        const { data, error } = await supabase
            .from('employees')
            .update({
                code: employee.code,
                name: employee.name,
                job_title: employee.job_title,
                basic_salary: employee.basic_salary,
                monthly_incentives: employee.monthly_incentives,
                updated_at: new Date().toISOString()
            })
            .eq('id', employeeId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Get advances by employee ID
     * @param {number} employeeId - Employee ID
     * @returns {Promise} Array of advances
     */
    getAdvancesByEmployee: async (employeeId) => {
        const { data, error } = await supabase
            .from('advances')
            .select('*')
            .eq('employee_id', employeeId)
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    /**
     * Create new advance
     * @param {Object} advance - Advance data
     * @returns {Promise} Created advance
     */
    createAdvance: async (advance) => {
        const { data, error } = await supabase
            .from('advances')
            .insert([
                {
                    employee_id: advance.employee_id,
                    amount: advance.amount,
                    date: advance.date,
                    remaining_amount: advance.remaining_amount,
                    notes: advance.notes,
                    is_paid: advance.is_paid
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Update existing advance
     * @param {number} advanceId - Advance ID
     * @param {Object} advance - Updated advance data
     * @returns {Promise} Updated advance
     */
    updateAdvance: async (advanceId, advance) => {
        const { data, error } = await supabase
            .from('advances')
            .update({
                employee_id: advance.employeeId,
                amount: advance.amount,
                date: advance.date,
                remaining_amount: advance.remainingAmount,
                notes: advance.notes,
                is_paid: advance.isPaid,
                updated_at: new Date()
            })
            .eq('id', advanceId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Get salary reports by employee ID
     * @param {number} employeeId - Employee ID
     * @returns {Promise} Array of salary reports
     */
    getSalaryReports: async (employeeId) => {
        const { data, error } = await supabase
            .from('salary_reports')
            .select('*')
            .eq('employee_id', employeeId)
            .order('month', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    /**
     * Create salary report
     * @param {Object} report - Salary report data
     * @returns {Promise} Created salary report
     */
    createSalaryReport: async (report) => {
        const { data, error } = await supabase
            .from('salary_reports')
            .insert([
                {
                    employee_id: report.employeeId,
                    month: report.month,
                    basic_salary: report.basicSalary,
                    advances_deduction: report.advancesDeduction,
                    other_deductions: report.otherDeductions,
                    bonuses: report.bonuses,
                    net_salary: report.netSalary
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Record backup in history
     * @param {Object} backup - Backup data
     * @returns {Promise} Created backup record
     */
    recordBackup: async (backup) => {
        const { data, error } = await supabase
            .from('backup_history')
            .insert([
                {
                    backup_date: backup.date,
                    backup_type: backup.type,
                    status: backup.status,
                    notes: backup.notes
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Dashboard Configuration Functions
     */
    getDashboardConfig: async (userId) => {
        const { data, error } = await supabase
            .from('dashboard_config')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    saveDashboardConfig: async (config) => {
        const { data: existing } = await supabase
            .from('dashboard_config')
            .select('id')
            .eq('user_id', config.userId)
            .single();
        
        if (existing) {
            // Update existing config
            const { data, error } = await supabase
                .from('dashboard_config')
                .update({
                    layout: config.layout,
                    user_preferences: config.userPreferences,
                    updated_at: new Date()
                })
                .eq('id', existing.id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            // Create new config
            const { data, error } = await supabase
                .from('dashboard_config')
                .insert([{
                    user_id: config.userId,
                    layout: config.layout,
                    user_preferences: config.userPreferences
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    },

    /**
     * Theme Preferences Functions
     */
    getThemePreferences: async (userId) => {
        const { data, error } = await supabase
            .from('theme_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    saveThemePreferences: async (preferences) => {
        const { data: existing } = await supabase
            .from('theme_preferences')
            .select('id')
            .eq('user_id', preferences.userId)
            .single();
        
        if (existing) {
            // Update existing preferences
            const { data, error } = await supabase
                .from('theme_preferences')
                .update({
                    dark_mode: preferences.darkMode,
                    theme_color: preferences.themeColor,
                    updated_at: new Date()
                })
                .eq('id', existing.id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            // Create new preferences
            const { data, error } = await supabase
                .from('theme_preferences')
                .insert([{
                    user_id: preferences.userId,
                    dark_mode: preferences.darkMode,
                    theme_color: preferences.themeColor
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    },

    /**
     * Leave Management Functions
     */
    getLeaveRequests: async (employeeId) => {
        const { data, error } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('employee_id', employeeId)
            .order('start_date', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    createLeaveRequest: async (leaveRequest) => {
        const { data, error } = await supabase
            .from('leave_requests')
            .insert([{
                employee_id: leaveRequest.employee_id,
                start_date: leaveRequest.start_date,
                end_date: leaveRequest.end_date,
                leave_type: leaveRequest.leave_type,
                reason: leaveRequest.reason,
                status: leaveRequest.status || 'pending'
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    updateLeaveRequestStatus: async (requestId, status, approvedBy) => {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({
                status: status,
                approved_by: approvedBy,
                updated_at: new Date()
            })
            .eq('id', requestId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Task Management Functions
     */
    getTasks: async (employeeId) => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('employee_id', employeeId)
            .order('due_date', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    createTask: async (task) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                employee_id: task.employee_id,
                title: task.title,
                description: task.description,
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                due_date: task.due_date
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    updateTaskStatus: async (taskId, status) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: status,
                updated_at: new Date()
            })
            .eq('id', taskId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Time Tracking Functions
     */
    getTimeEntries: async (employeeId, startDate, endDate) => {
        let query = supabase
            .from('time_entries')
            .select('*')
            .eq('employee_id', employeeId);
        
        if (startDate) {
            query = query.gte('check_in', startDate);
        }
        
        if (endDate) {
            query = query.lte('check_in', endDate);
        }
        
        const { data, error } = await query.order('check_in', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    createCheckIn: async (employeeId, notes) => {
        const { data, error } = await supabase
            .from('time_entries')
            .insert([{
                employee_id: employeeId,
                check_in: new Date(),
                notes: notes
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    updateCheckOut: async (entryId) => {
        const checkOutTime = new Date();
        const { data: entry } = await supabase
            .from('time_entries')
            .select('check_in')
            .eq('id', entryId)
            .single();
        
        // Calculate total hours
        const checkInTime = new Date(entry.check_in);
        const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        
        const { data, error } = await supabase
            .from('time_entries')
            .update({
                check_out: checkOutTime,
                total_hours: parseFloat(totalHours.toFixed(2)),
                updated_at: new Date()
            })
            .eq('id', entryId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Analytics Functions
     */
    saveAnalyticsData: async (reportType, reportDate, data) => {
        const { data: result, error } = await supabase
            .from('analytics_data')
            .insert([{
                report_type: reportType,
                report_date: reportDate,
                data: data
            }])
            .select()
            .single();
        
        if (error) throw error;
        return result;
    },

    getAnalyticsData: async (reportType, startDate, endDate) => {
        let query = supabase
            .from('analytics_data')
            .select('*')
            .eq('report_type', reportType);
        
        if (startDate) {
            query = query.gte('report_date', startDate);
        }
        
        if (endDate) {
            query = query.lte('report_date', endDate);
        }
        
        const { data, error } = await query.order('report_date', { ascending: false });
        
        if (error) throw error;
        return data;
    }
};

// Initialize Supabase real-time subscriptions
function initializeRealtimeSubscriptions() {
    // Subscribe to employees table changes
    supabase
        .channel('public:employees')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, payload => {
            console.log('Employees change received:', payload);
            // Don't try to reload data on the server side
            // loadSavedData() is only available in the browser context
        })
        .subscribe();

    // Subscribe to advances table changes
    supabase
        .channel('public:advances')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'advances' }, payload => {
            console.log('Advances change received:', payload);
            // Don't try to reload data on the server side
            // loadSavedData() is only available in the browser context
        })
        .subscribe();

    // Subscribe to salary reports table changes
    supabase
        .channel('public:salary_reports')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'salary_reports' }, payload => {
            console.log('Salary reports change received:', payload);
            // Don't try to reload data on the server side
            // loadSavedData() is only available in the browser context
        })
        .subscribe();
}

// Initialize realtime subscriptions when the module is loaded
initializeRealtimeSubscriptions();

module.exports = db;