const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function updateSchema() {
    try {
        // Update advances table structure
        const { error: advancesError } = await supabase.rpc('update_advances_schema', {
            sql: `
                ALTER TABLE advances 
                ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS notes TEXT,
                ADD COLUMN IF NOT EXISTS paid_date DATE;
            `
        });

        if (advancesError) {
            console.error('Error updating advances:', advancesError);
        } else {
            console.log('Advances table updated successfully');
        }

        // Update salary_reports table structure
        const { error: reportsError } = await supabase.rpc('update_salary_reports_schema', {
            sql: `
                ALTER TABLE salary_reports 
                ADD COLUMN IF NOT EXISTS absence_days DECIMAL(5, 2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS deductions_absence DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS deductions_hourly DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS penalty_days DECIMAL(5, 2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS deductions_penalties DECIMAL(10, 2) DEFAULT 0;
            `
        });

        if (reportsError) {
            console.error('Error updating salary_reports:', reportsError);
        } else {
            console.log('Salary reports table updated successfully');
        }

    } catch (error) {
        console.error('Error in updateSchema:', error);
    }
}

updateSchema();
