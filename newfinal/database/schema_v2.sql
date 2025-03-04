-- Drop existing tables
DROP TABLE IF EXISTS salary_reports;
DROP TABLE IF EXISTS advances;

-- Create updated advances table with remaining_amount
CREATE TABLE advances (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    remaining_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create updated salary_reports table with all required fields
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
    deductions_purchases DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deductions_advances DECIMAL(10, 2) NOT NULL DEFAULT 0,
    absence_days DECIMAL(5, 2) NOT NULL DEFAULT 0,
    deductions_absence DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deductions_hourly DECIMAL(10, 2) NOT NULL DEFAULT 0,
    penalty_days DECIMAL(5, 2) NOT NULL DEFAULT 0,
    deductions_penalties DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(10, 2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for both tables
CREATE TRIGGER update_advances_updated_at
    BEFORE UPDATE ON advances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_reports_updated_at
    BEFORE UPDATE ON salary_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for advances
CREATE POLICY "Advances are viewable by authenticated users"
    ON advances FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Advances are insertable by authenticated users with admin role"
    ON advances FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Advances are updatable by authenticated users with admin role"
    ON advances FOR UPDATE
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

-- Create policies for salary_reports
CREATE POLICY "Salary reports are viewable by authenticated users"
    ON salary_reports FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Salary reports are insertable by authenticated users with admin role"
    ON salary_reports FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Salary reports are updatable by authenticated users with admin role"
    ON salary_reports FOR UPDATE
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'user_role' = 'admin');

-- Grant necessary permissions
GRANT ALL ON TABLE advances TO authenticated;
GRANT ALL ON TABLE salary_reports TO authenticated;
GRANT USAGE ON SEQUENCE advances_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE salary_reports_id_seq TO authenticated;
