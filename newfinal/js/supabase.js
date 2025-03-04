const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const db = {
    // ... (keeping existing functions)
    createAdvance: async (advance) => {
        const { data, error } = await supabase
            .from('advances')
            .insert([{
                employee_id: advance.employee_id,
                amount: advance.amount,
                date: advance.date,
                remaining_amount: advance.remaining_amount || advance.amount,
                notes: advance.notes || null,
                is_paid: advance.is_paid || false
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    createSalaryReport: async (report) => {
        const reportData = {
            employee_id: report.employee_id,
            employee_code: report.employee_code,
            employee_name: report.employee_name,
            month: report.month,
            date_generated: report.date_generated,
            work_days: report.work_days,
            daily_work_hours: report.daily_work_hours,
            basic_salary: report.basic_salary,
            daily_rate: report.daily_rate,
            daily_rate_with_incentives: report.daily_rate_with_incentives,
            overtime_unit_value: report.overtime_unit_value,
            overtime_hours: report.overtime_hours,
            overtime_amount: report.overtime_amount,
            monthly_incentives: report.monthly_incentives,
            bonus: report.bonus || 0,
            total_salary_with_incentives: report.total_salary_with_incentives,
            gross_salary: report.gross_salary,
            deductions_purchases: report.deductions_purchases || 0,
            deductions_advances: report.deductions_advances || 0,
            absence_days: report.absence_days || 0,
            deductions_absence: report.deductions_absence || 0,
            deductions_hourly: report.deductions_hourly || 0,
            penalty_days: report.penalty_days || 0,
            deductions_penalties: report.deductions_penalties || 0,
            total_deductions: report.total_deductions || 0,
            net_salary: report.net_salary
        };

        const { data, error } = await supabase
            .from('salary_reports')
            .insert([reportData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // New functions for monthly reports
    getMonthlyReport: async (month) => {
        const { data, error } = await supabase
            .from('salary_reports')
            .select(`
                *,
                employees (
                    code,
                    name,
                    job_title
                )
            `)
            .eq('month', month)
            .order('employee_name');
        
        if (error) throw error;
        
        // Calculate totals
        const totals = data.reduce((acc, report) => {
            acc.total_basic_salary += report.basic_salary;
            acc.total_overtime += report.overtime_amount;
            acc.total_incentives += report.monthly_incentives;
            acc.total_bonus += report.bonus;
            acc.total_gross += report.gross_salary;
            acc.total_deductions += report.total_deductions;
            acc.total_net += report.net_salary;
            return acc;
        }, {
            total_basic_salary: 0,
            total_overtime: 0,
            total_incentives: 0,
            total_bonus: 0,
            total_gross: 0,
            total_deductions: 0,
            total_net: 0
        });

        return {
            month,
            reports: data,
            totals
        };
    },

    getEmployeePayslip: async (employeeId, month) => {
        // Get salary report
        const { data: salary, error: salaryError } = await supabase
            .from('salary_reports')
            .select(`
                *,
                employees (
                    code,
                    name,
                    job_title
                )
            `)
            .eq('employee_id', employeeId)
            .eq('month', month)
            .single();
        
        if (salaryError) throw salaryError;

        // Get advances for the month
        const { data: advances, error: advancesError } = await supabase
            .from('advances')
            .select('*')
            .eq('employee_id', employeeId)
            .gte('date', `${month}-01`)
            .lte('date', `${month}-31`);
        
        if (advancesError) throw advancesError;

        // Get time entries for the month
        const { data: timeEntries, error: timeError } = await supabase
            .from('time_entries')
            .select('*')
            .eq('employee_id', employeeId)
            .gte('check_in', `${month}-01`)
            .lte('check_in', `${month}-31`);
        
        if (timeError) throw timeError;

        return {
            salary,
            advances,
            timeEntries,
            payslip_date: new Date().toISOString()
        };
    },

    // ... (keeping other existing functions)
    getAllEmployees: async () => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('id');
        
        if (error) throw error;
        return data;
    },

    getEmployeeByCode: async (code) => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('code', code)
            .single();
        
        if (error) throw error;
        return data;
    },

    getAdvancesByEmployee: async (employeeId) => {
        const { data, error } = await supabase
            .from('advances')
            .select('*')
            .eq('employee_id', employeeId);
        
        if (error) throw error;
        return data;
    }
};

module.exports = db;
