-- SQL Schema Update for Payroll System

-- Create schema for the payroll system if it doesn't exist
CREATE SCHEMA IF NOT EXISTS payroll;

-- Set the search path
SET search_path TO payroll, public;

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Employees are viewable by authenticated users"
    ON employees FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Employees are insertable by authenticated users with admin role"
    ON employees FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Employees are updatable by authenticated users with admin role"
    ON employees FOR UPDATE
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

-- Create policies for advances table
CREATE POLICY "Advances are viewable by authenticated users"
    ON advances FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Advances are insertable by authenticated users with admin role"
    ON advances FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

-- Create policies for salary_reports table
CREATE POLICY "Salary reports are viewable by authenticated users"
    ON salary_reports FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Salary reports are insertable by authenticated users with admin role"
    ON salary_reports FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

-- Create policies for leave_requests table
CREATE POLICY "Leave requests are viewable by authenticated users"
    ON leave_requests FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Leave requests are insertable by authenticated users"
    ON leave_requests FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policies for tasks table
CREATE POLICY "Tasks are viewable by authenticated users"
    ON tasks FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Tasks are insertable by authenticated users"
    ON tasks FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policies for time_entries table
CREATE POLICY "Time entries are viewable by authenticated users"
    ON time_entries FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Time entries are insertable by authenticated users"
    ON time_entries FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policies for dashboard_config table
CREATE POLICY "Dashboard config is viewable by owner"
    ON dashboard_config FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Dashboard config is insertable by owner"
    ON dashboard_config FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for theme_preferences table
CREATE POLICY "Theme preferences are viewable by owner"
    ON theme_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Theme preferences are insertable by owner"
    ON theme_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100),
    basic_salary DECIMAL(10, 2),
    work_days INT,
    daily_work_hours DECIMAL(5, 2),
    monthly_incentives DECIMAL(10, 2),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advances Table
CREATE TABLE advances (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    remaining_amount DECIMAL(10, 2),
    notes TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Salary Reports Table to include detailed calculations
DROP TABLE IF EXISTS salary_reports;
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Entries Table
CREATE TABLE time_entries (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    total_hours DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard Config Table
CREATE TABLE dashboard_config (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    layout JSON,
    user_preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theme Preferences Table
CREATE TABLE theme_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    dark_mode BOOLEAN DEFAULT FALSE,
    theme_color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA payroll TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA payroll TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA payroll TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA payroll TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA payroll TO postgres;

-- Test Data for Payroll System
-- ===========================

-- Sample Employees
INSERT INTO employees (code, name, job_title, basic_salary, work_days, daily_work_hours, monthly_incentives)
VALUES 
('EMP001', 'أحمد محمد', 'مدير تنفيذي', 15000.00, 22, 8.0, 2000.00),
('EMP002', 'سارة أحمد', 'محاسب', 8000.00, 22, 8.0, 500.00),
('EMP003', 'محمد علي', 'مطور برمجيات', 10000.00, 22, 8.0, 1000.00),
('EMP004', 'فاطمة حسن', 'مسؤول موارد بشرية', 7500.00, 22, 8.0, 800.00),
('EMP005', 'خالد عبدالله', 'مسؤول مبيعات', 6500.00, 22, 8.0, 1500.00);

-- Sample Advances
INSERT INTO advances (employee_id, amount, date, remaining_amount, notes, is_paid)
VALUES 
(1, 2000.00, '2023-01-15', 2000.00, 'سلفة طارئة', false),
(2, 1000.00, '2023-02-10', 500.00, 'سلفة شخصية', false),
(3, 3000.00, '2023-01-05', 1000.00, 'سلفة طبية', false),
(4, 1500.00, '2023-03-01', 1500.00, 'سلفة تعليمية', false),
(1, 1000.00, '2023-03-20', 1000.00, 'سلفة إضافية', false);

-- Sample Salary Reports
INSERT INTO salary_reports (
    employee_id, employee_code, employee_name, month, date_generated,
    work_days, daily_work_hours, basic_salary, daily_rate, daily_rate_with_incentives,
    overtime_unit_value, overtime_hours, overtime_amount, monthly_incentives, bonus,
    total_salary_with_incentives, gross_salary, deductions_purchases, deductions_advances,
    absence_days, deductions_absence, deductions_hourly, penalty_days, deductions_penalties,
    total_deductions, net_salary
)
VALUES 
(1, 'EMP001', 'أحمد محمد', '2023-01', '2023-01-31 10:00:00', 22, 8.0, 15000.00, 681.82, 772.73, 96.59, 5.0, 482.95, 2000.00, 1000.00, 17000.00, 18482.95, 0.00, 0.00, 0, 0.00, 0.00, 0, 0.00, 0.00, 18482.95),
(2, 'EMP002', 'سارة أحمد', '2023-01', '2023-01-31 10:15:00', 22, 8.0, 8000.00, 363.64, 386.36, 48.30, 0.0, 0.00, 500.00, 0.00, 8500.00, 8500.00, 200.00, 500.00, 1, 363.64, 0.00, 0, 0.00, 1063.64, 7436.36),
(3, 'EMP003', 'محمد علي', '2023-01', '2023-01-31 10:30:00', 22, 8.0, 10000.00, 454.55, 500.00, 62.50, 10.0, 625.00, 1000.00, 500.00, 11000.00, 12125.00, 0.00, 2000.00, 0, 0.00, 0.00, 0, 0.00, 2000.00, 10125.00),
(4, 'EMP004', 'فاطمة حسن', '2023-01', '2023-01-31 10:45:00', 22, 8.0, 7500.00, 340.91, 377.27, 47.16, 0.0, 0.00, 800.00, 0.00, 8300.00, 8300.00, 300.00, 0.00, 0, 0.00, 0.00, 0, 0.00, 300.00, 8000.00),
(5, 'EMP005', 'خالد عبدالله', '2023-01', '2023-01-31 11:00:00', 22, 8.0, 6500.00, 295.45, 363.64, 45.45, 8.0, 363.64, 1500.00, 0.00, 8000.00, 8363.64, 0.00, 0.00, 2, 590.91, 0.00, 0, 0.00, 590.91, 7772.73);

-- Sample Leave Requests
INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason, status)
VALUES 
(1, '2023-02-10', '2023-02-15', 'إجازة سنوية', 'إجازة عائلية', 'approved'),
(2, '2023-03-05', '2023-03-07', 'إجازة مرضية', 'زيارة طبيب', 'approved'),
(3, '2023-02-20', '2023-02-22', 'إجازة طارئة', 'ظروف شخصية', 'pending'),
(4, '2023-04-01', '2023-04-10', 'إجازة سنوية', 'سفر', 'pending'),
(5, '2023-03-15', '2023-03-16', 'إجازة مرضية', 'تعب', 'rejected');

-- Sample Tasks
INSERT INTO tasks (employee_id, title, description, status, priority, due_date)
VALUES 
(1, 'مراجعة التقارير المالية', 'مراجعة تقارير الربع الأول', 'pending', 'high', '2023-04-15'),
(2, 'إعداد كشوف المرتبات', 'إعداد كشوف مرتبات شهر مارس', 'completed', 'high', '2023-03-30'),
(3, 'تطوير واجهة المستخدم', 'تحديث واجهة نظام الرواتب', 'in_progress', 'medium', '2023-04-20'),
(4, 'مراجعة طلبات التوظيف', 'فرز طلبات التوظيف الجديدة', 'pending', 'low', '2023-04-30'),
(5, 'إعداد عروض المبيعات', 'تجهيز عروض للعملاء المحتملين', 'in_progress', 'medium', '2023-04-10');

-- Sample Time Entries
INSERT INTO time_entries (employee_id, check_in, check_out, total_hours, notes)
VALUES 
(1, '2023-03-01 08:00:00', '2023-03-01 17:00:00', 9.0, 'يوم عمل كامل'),
(2, '2023-03-01 08:30:00', '2023-03-01 16:30:00', 8.0, 'يوم عمل عادي'),
(3, '2023-03-01 09:00:00', '2023-03-01 18:30:00', 9.5, 'عمل إضافي'),
(4, '2023-03-01 08:15:00', '2023-03-01 16:15:00', 8.0, 'يوم عمل عادي'),
(5, '2023-03-01 08:00:00', '2023-03-01 14:00:00', 6.0, 'مغادرة مبكرة - إذن');

-- Sample Dashboard Config
INSERT INTO dashboard_config (user_id, layout, user_preferences)
VALUES 
(1, '{"widgets": [{"id": "salary_summary", "position": "top"}, {"id": "recent_advances", "position": "middle"}, {"id": "employee_attendance", "position": "bottom"}]}', '{"refresh_rate": 5, "default_view": "monthly"}'),
(2, '{"widgets": [{"id": "my_tasks", "position": "top"}, {"id": "my_attendance", "position": "middle"}]}', '{"refresh_rate": 10, "default_view": "weekly"}');

-- Sample Theme Preferences
INSERT INTO theme_preferences (user_id, dark_mode, theme_color)
VALUES 
(1, true, 'blue'),
(2, false, 'green'),
(3, true, 'purple'),
(4, false, 'orange'),
(5, true, 'red');
