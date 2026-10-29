
-- =========================================================
-- ClinicFlow - Migration 001 : schema initial
-- PostgreSQL 16+
-- =========================================================

BEGIN;

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Types
CREATE TYPE user_role AS ENUM ('admin', 'staff');

CREATE TYPE appointment_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);

-- Fonction de mise à jour automatique
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- TABLE : users
-- =========================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_email_not_empty
        CHECK (length(trim(email)) > 0),
    CONSTRAINT users_full_name_not_empty
        CHECK (length(trim(full_name)) > 0)
);

-- =========================================================
-- TABLE : patients
-- =========================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    cin VARCHAR(30) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT patients_cin_unique UNIQUE (cin),
    CONSTRAINT patients_cin_not_empty
        CHECK (length(trim(cin)) > 0),
    CONSTRAINT patients_full_name_not_empty
        CHECK (length(trim(full_name)) > 0),
    CONSTRAINT patients_phone_not_empty
        CHECK (length(trim(phone)) > 0)
);

-- =========================================================
-- TABLE : appointments
-- =========================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL
        REFERENCES patients(id) ON DELETE RESTRICT,
    appointment_date TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    reason TEXT NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT appointments_reason_not_empty
        CHECK (length(trim(reason)) > 0)
);

-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX idx_patients_active_full_name
    ON patients (full_name)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patients_full_name_trgm
    ON patients USING GIN (full_name gin_trgm_ops);

CREATE INDEX idx_appointments_active_date
    ON appointments (appointment_date)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_active_status_date
    ON appointments (status, appointment_date)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_patient_date
    ON appointments (patient_id, appointment_date);

CREATE INDEX idx_appointments_created_by
    ON appointments (created_by);

-- =========================================================
-- REGLE : un patient ne peut pas avoir deux rendez-vous
-- confirmes dont les créneaux de 30 minutes se chevauchent.
-- Conversion en UTC pour rendre les expressions immuables.
-- =========================================================

ALTER TABLE appointments
ADD CONSTRAINT appointments_patient_confirmed_no_overlap
EXCLUDE USING GIST (
    patient_id WITH =,
    tsrange(
        appointment_date AT TIME ZONE 'UTC',
        (appointment_date AT TIME ZONE 'UTC')
            + INTERVAL '30 minutes',
        '[)'
    ) WITH &&
)
WHERE (
    status = 'confirmed'
    AND deleted_at IS NULL
);

-- =========================================================
-- TRIGGERS : updated_at
-- =========================================================

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
