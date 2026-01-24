-- Script di seed per dati di test
-- Eseguito automaticamente all'avvio del database dopo schema.sql

-- Inserimento Admin
INSERT INTO admins (id, first_name, last_name, created_at, updated_at)
VALUES (
    '880e8400-e29b-41d4-a716-446655440001',
    'Admin',
    'Sistema',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Inserimento Doctor
INSERT INTO doctors (id, first_name, last_name, specialization, gender, email, phone_number, created_at, updated_at)
VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    'Francesco',
    'Bianchi',
    'Gastroenterologia',
    'M',
    'francesco.bianchi@example.com',
    '+39 123 456 7891',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Inserimento Patient
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, email, phone_number, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Mario',
    'Rossi',
    '1990-05-15',
    'M',
    'mario.rossi@example.com',
    '+39 123 456 7890',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Inserimento Exam
INSERT INTO exams (id, name, description, duration_minutes, is_active, created_at, updated_at)
VALUES (
    '770e8400-e29b-41d4-a716-446655440001',
    'Colonscopia',
    'Esame endoscopico del colon',
    30,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;
