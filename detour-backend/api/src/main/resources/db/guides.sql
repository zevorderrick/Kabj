-- Applied automatically on startup via spring.sql.init.schema-locations.
-- Required because spring.jpa.hibernate.ddl-auto=validate
-- Run this manually against Postgres if the tables do not exist yet.

CREATE TABLE IF NOT EXISTS guide_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialty VARCHAR(100),
    languages TEXT,
    gta_license_no VARCHAR(50),
    ghana_card_number VARCHAR(50),
    company_name VARCHAR(150),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    avg_rating NUMERIC(3, 2),
    base_rate_per_hour NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guide_profiles_user_id ON guide_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_profiles_verification_status ON guide_profiles(verification_status);

CREATE TABLE IF NOT EXISTS guide_availability (
    id SERIAL PRIMARY KEY,
    guide_id INTEGER NOT NULL REFERENCES guide_profiles(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_guide_availability_guide_id ON guide_availability(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_availability_date ON guide_availability(available_date);

CREATE TABLE IF NOT EXISTS guide_payouts (
    id SERIAL PRIMARY KEY,
    guide_id INTEGER NOT NULL REFERENCES guide_profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_reference VARCHAR(100),
    momo_number VARCHAR(20) NOT NULL,
    payout_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (payout_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guide_payouts_guide_id ON guide_payouts(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_payouts_status ON guide_payouts(payout_status);
