// Supabase Client Initialization
const supabaseUrl = 'https://verkzsdjklsxsxbsolyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcmt6c2Rqa2xzeHN4YnNvbHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTc2NjMsImV4cCI6MjA1NjQ5MzY2M30.MPYXWhKIw6luhWt5UDRug-Smh5G1ppJjiK0UQIMRQT8';

// Create Supabase client
// The supabase-js library from CDN creates a global 'supabase' object
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    },
    db: {
        schema: 'public'
    }
});

// Export supabase client
window.supabaseClient = supabase;