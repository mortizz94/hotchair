-- Add manager_id to departments
ALTER TABLE departments ADD COLUMN manager_id TEXT;

-- Add location to attendance
ALTER TABLE attendance ADD COLUMN location TEXT DEFAULT 'office';
