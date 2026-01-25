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

### `03-seed-dexter.sql`
Script di seed aggiuntivo (personaggi *Dexter*, esami e prenotazioni) per testare **GET /api/appointments**:
- **3 Doctors**: Dexter Morgan, Deborah Morgan, Vince Masuka
- **4 Patients**: Rita Bennett, Harrison Morgan, Lila Tournay, Arthur Mitchell
- **3 Exams**: Esame del sangue, Risonanza magnetica, Ecografia addominale
- **doctor_exams**: associazioni medico–esame (incluso Francesco Bianchi ↔ Colonscopia)
- **7 Appointments**: prenotazioni con stati `pending`, `confirmed`, `cancelled`

Eseguire dopo `01-schema.sql` e `02-seed-data.sql`. Se il DB è avviato via Docker, viene eseguito in ordine alfabetico dopo gli altri script.

### `migrate_doctor_exams_cascade.sql`
Script di migrazione per modifiche alle relazioni doctor_exams.

## Esecuzione Automatica

Gli script vengono eseguiti automaticamente all'avvio del container PostgreSQL in ordine alfabetico:
1. `01-schema.sql` (crea le tabelle, trigger, indici e vincoli)
2. `02-seed-data.sql` (inserisce dati di test base)
3. `03-seed-dexter.sql` (aggiunge medici/pazienti Dexter, esami e prenotazioni)
4. `migrate_doctor_exams_cascade.sql` (se presente)

## UUID di Test

Gli UUID utilizzati nei dati di seed sono fissi per facilitare i test.

### Seed base (02-seed-data.sql)

| Ruolo   | UUID                                   | Nome             |
|--------|----------------------------------------|------------------|
| Admin  | `880e8400-e29b-41d4-a716-446655440001` | Admin Sistema    |
| Doctor | `660e8400-e29b-41d4-a716-446655440001` | Francesco Bianchi|
| Patient| `550e8400-e29b-41d4-a716-446655440000` | Mario Rossi      |
| Exam   | `770e8400-e29b-41d4-a716-446655440001` | Colonscopia      |

### Seed Dexter (03-seed-dexter.sql)

| Ruolo   | UUID                                   | Nome           |
|--------|----------------------------------------|----------------|
| Doctor | `660e8400-e29b-41d4-a716-446655440002` | Dexter Morgan  |
| Doctor | `660e8400-e29b-41d4-a716-446655440003` | Deborah Morgan |
| Doctor | `660e8400-e29b-41d4-a716-446655440004` | Vince Masuka   |
| Patient| `550e8400-e29b-41d4-a716-446655440001` | Rita Bennett   |
| Patient| `550e8400-e29b-41d4-a716-446655440002` | Harrison Morgan|
| Patient| `550e8400-e29b-41d4-a716-446655440003` | Lila Tournay   |
| Patient| `550e8400-e29b-41d4-a716-446655440004` | Arthur Mitchell|

Questi UUID possono essere usati nei test delle API (es. header `X-Demo-Admin-Id`, `X-Demo-Doctor-Id`, `X-Demo-Patient-Id` per **GET /api/appointments**).
