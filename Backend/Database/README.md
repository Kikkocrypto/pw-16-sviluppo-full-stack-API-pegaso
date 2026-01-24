# Database Scripts

Questa cartella contiene gli script SQL per l'inizializzazione del database PostgreSQL.

## File Script

### `01-schema.sql`
Script principale che crea tutte le tabelle, trigger, indici e vincoli del database.

### `02-seed-data.sql`
Script di seed che inserisce dati di test all'avvio del database:
- **1 Admin**: `880e8400-e29b-41d4-a716-446655440001` (Admin Sistema)
- **1 Doctor**: `660e8400-e29b-41d4-a716-446655440001` (Francesco Bianchi - Gastroenterologia)
- **1 Patient**: `550e8400-e29b-41d4-a716-446655440000` (Mario Rossi)
- **1 Exam**: `770e8400-e29b-41d4-a716-446655440001` (Colonscopia)

### `migrate_doctor_exams_cascade.sql`
Script di migrazione per modifiche alle relazioni doctor_exams.

## Esecuzione Automatica

Gli script vengono eseguiti automaticamente all'avvio del container PostgreSQL in ordine alfabetico:
1. `01-schema.sql` (crea le tabelle, trigger, indici e vincoli)
2. `02-seed-data.sql` (inserisce dati di test)

## UUID di Test

Gli UUID utilizzati nei dati di seed sono fissi per facilitare i test:

- **Admin ID**: `880e8400-e29b-41d4-a716-446655440001`
- **Doctor ID**: `660e8400-e29b-41d4-a716-446655440001`
- **Patient ID**: `550e8400-e29b-41d4-a716-446655440000`
- **Exam ID**: `770e8400-e29b-41d4-a716-446655440001`

Questi UUID possono essere utilizzati direttamente nei test delle API (es. header `X-Demo-Admin-Id`).
