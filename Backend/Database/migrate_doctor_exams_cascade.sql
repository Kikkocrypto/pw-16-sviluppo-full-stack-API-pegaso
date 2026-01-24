-- Migrazione: permettere eliminazione dottore con esami associati
-- Vincolo solo dottore-prenotazioni: il dottore non può essere eliminato se ha prenotazioni.
-- Le associazioni doctor_exams vengono rimosse in cascata (CASCADE).
--
-- Eseguire solo se il DB esiste già con fk_doctor_exams_doctor ON DELETE RESTRICT.

ALTER TABLE doctor_exams
    DROP CONSTRAINT IF EXISTS fk_doctor_exams_doctor;

ALTER TABLE doctor_exams
    ADD CONSTRAINT fk_doctor_exams_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors (id)
        ON DELETE CASCADE;
