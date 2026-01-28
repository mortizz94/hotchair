INSERT INTO users (id, code, pin, name, role) VALUES 
('u1', 'EMP001', '1234', 'Diego', 'admin'),
('u2', 'EMP002', '5678', 'Maria', 'user'),
('u3', 'EMP003', '0000', 'Pepe', 'user')
ON CONFLICT(code) DO NOTHING;
