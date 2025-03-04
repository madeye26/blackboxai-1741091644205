const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testConnection() {
    try {
        // Try to get the schema information
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log('Successfully connected to Supabase');
        console.log('Sample data:', data);

        // Get table information
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_schema_info');

        if (tableError) {
            console.error('Error getting schema:', tableError);
            return;
        }

        console.log('Table information:', tableInfo);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
