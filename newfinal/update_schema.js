const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function updateSchema() {
    try {
        // Drop existing tables
        await supabase.rpc('drop_table_if_exists', { table_name: 'salary_reports' });
        await supabase.rpc('drop_table_if_exists', { table_name: 'advances' });

        // Create advances table
        await supabase.rpc('execute_sql', {
            sql: `
            CREATE TABLE advances (
                id SERIAL PRIMARY KEY,
                employee_id INT NOT NULL REFERENCES employees(id),
                amount DECIMAL(10, 2) NOT NULL,
                date DATE NOT NULL,
                remaining_amount DECIMAL(10, 2) NOT NULL,
                notes TEXT,
                is_paid BOOLEAN DEFAULT FALSE,
                paid_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `
        });

        // Create salary_reports table
        await supabase.rpc('execute_sql', {
            sql: `
            CREATE TABLE salary_reports (
                id SERIAL PRIMARY KEY,
                employee_id INT NOT NULL REFERENCES employees(id),
                employee_code VARCHAR(50) NOT NULL,
                employee_name VARCHAR(100) NOT NULL,
                month VARCHAR(7) NOT NULL,
                date_generated TIMESTAMP NOT NULL,
                work_days INT NOT NULL,
                daily_work_hours DECIMAL(5, 2) NOT NULL,
                basic_salary DECIMAL(10, 2) NOT NULL,
                daily_rate DECIMAL(10, 2) NOT NULL,
                daily_rate_with_incentives DECIMAL(10, 2) NOT NULL,
                overtime_unit_value DECIMAL(10, 2) NOT NULL,
                overtime_hours DECIMAL(5, 2) NOT NULL,
                overtime_amount DECIMAL(10, 2) NOT NULL,
                monthly_incentives DECIMAL(10, 2) NOT NULL,
                bonus DECIMAL(10, 2) NOT NULL,
                total_salary_with_incentives DECIMAL(10, 2) NOT NULL,
                gross_salary DECIMAL(10, 2) NOT NULL,
                deductions_purchases DECIMAL(10, 2) NOT NULL,
                deductions_advances DECIMAL(10, 2) NOT NULL,
                absence_days DECIMAL(5, 2) NOT NULL,
                deductions_absence DECIMAL(10, 2) NOT NULL,
                deductions_hourly DECIMAL(10, 2) NOT NULL,
                penalty_days DECIMAL(5, 2) NOT NULL,
                deductions_penalties DECIMAL(10, 2) NOT NULL,
                total_deductions DECIMAL(10, 2) NOT NULL,
                net_salary DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `
        });

        console.log('Schema updated successfully');
    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

updateSchema();
