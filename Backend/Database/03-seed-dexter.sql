-- Script di seed: personaggi Dexter, esami e prenotazioni per test GET /api/appointments
-- Eseguire dopo 01-schema.sql e 02-seed-data.sql

-- ========== MEDICI (Dexter) ==========
INSERT INTO doctors (id, first_name, last_name, specialization, gender, email, phone_number, created_at, updated_at)
VALUES
    ('660e8400-e29b-41d4-a716-446655440002', 'Dexter', 'Morgan', 'Patologia forense', 'M', 'dexter.morgan@example.com', '+1 305 555 0101', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', 'Deborah', 'Morgan', 'Medicina d''urgenza', 'F', 'deborah.morgan@example.com', '+1 305 555 0102', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', 'Vince', 'Masuka', 'Medicina legale', 'M', 'vince.masuka@example.com', '+1 305 555 0103', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========== PAZIENTI (Dexter) ==========
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, email, phone_number, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Rita', 'Bennett', '1975-03-22', 'F', 'rita.bennett@example.com', '+1 305 555 0201', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Harrison', 'Morgan', '2009-01-15', 'M', 'harrison.morgan@example.com', NULL, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Lila', 'Tournay', '1980-07-08', 'F', 'lila.tournay@example.com', '+1 305 555 0203', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Arthur', 'Mitchell', '1955-11-30', 'M', 'arthur.mitchell@example.com', '+1 305 555 0204', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========== ESAMI aggiuntivi ==========
INSERT INTO exams (id, name, description, duration_minutes, is_active, created_at, updated_at)
VALUES
    ('770e8400-e29b-41d4-a716-446655440002', 'Esame del sangue', 'Emocromo e parametri biochimici', 15, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440003', 'Risonanza magnetica', 'RM senza e con mezzo di contrasto', 45, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440004', 'Ecografia addominale', 'Ecografia addome completo', 25, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========== ASSOCIAZIONI MEDICO–ESAME (doctor_exams) ==========
-- Francesco Bianchi: Colonscopia (già medico seed)
-- Dexter: Esame sangue, Risonanza
-- Deborah: Ecografia, Colonscopia
-- Masuka: Esame sangue, Medicina legale → usiamo Esame sangue + Colonscopia
INSERT INTO doctor_exams (doctor_id, exam_id, created_at)
VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', NOW())
ON CONFLICT (doctor_id, exam_id) DO NOTHING;

-- ========== PRENOTAZIONI ==========
-- Mario Rossi (550e...000) → Francesco Bianchi, Colonscopia
-- Rita → Dexter, Esame sangue
-- Harrison → Deborah, Ecografia
-- Lila → Masuka, Esame sangue
-- Arthur → Dexter, Risonanza
-- Mario → Dexter, Esame sangue
-- Rita → Deborah, Colonscopia
INSERT INTO appointments (id, patient_id, doctor_id, exam_id, scheduled_at, duration_minutes, status, reason, created_at, updated_at)
VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '2025-02-03 09:00:00+00', 30, 'confirmed', 'Controllo programmato', NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '2025-02-04 10:30:00+00', 15, 'confirmed', 'Emocromo di routine', NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', '2025-02-05 14:00:00+00', 25, 'pending', 'Controllo crescita', NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', '2025-02-06 11:00:00+00', 15, 'pending', 'Check-up', NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', '2025-02-07 08:30:00+00', 45, 'cancelled', 'RM colonna', NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '2025-02-10 09:30:00+00', 15, 'confirmed', 'Esame sangue', NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '2025-02-12 15:00:00+00', 30, 'pending', 'Colonscopia', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
