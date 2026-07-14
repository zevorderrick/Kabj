-- 1. USERS & ROLES
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('TOURIST', 'GUIDE', 'OPERATOR', 'ADMIN')),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ATTRACTIONS & LOCATIONS
CREATE TABLE attractions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    region VARCHAR(50) NOT NULL CHECK (region IN ('Greater Accra', 'Ashanti', 'Central', 'Volta', 'Northern', 'Western', 'Eastern', 'Bono', 'Upper East', 'Upper West', 'Savannah', 'Bono East', 'Oti', 'Ahafo', 'Western North', 'North East')),
    category VARCHAR(50) NOT NULL, -- 'Historical', 'Nature', 'Hotel', 'Restaurant'
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    base_price DECIMAL(10,2) DEFAULT 0.00,
    eco_score DECIMAL(3,2) DEFAULT 0.00 CHECK (eco_score BETWEEN 0 AND 1),
    popularity_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOOKINGS & TRANSACTIONS
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    tourist_id INT REFERENCES users(id) ON DELETE CASCADE,
    attraction_id INT REFERENCES attractions(id) ON DELETE CASCADE,
    booking_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    sync_status VARCHAR(20) DEFAULT 'SYNCED' CHECK (sync_status IN ('SYNCED', 'PENDING_SYNC')), -- For offline tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO attractions (title, description, region, category, latitude, longitude, base_price, eco_score, popularity_count) VALUES
('Kakum National Park', 'Famous for its rainforest canopy walkway located in the Central Region.', 'Central', 'Nature', 5.4208, -1.3822, 60.00, 0.90, 1540),
('Cape Coast Castle', 'A historical landmark detailing the dark history of the trans-Atlantic slave trade.', 'Central', 'Historical', 5.1026, -1.2413, 50.00, 0.75, 2100),
('Mole National Park', 'Ghana''s largest wildlife refuge featuring savannah elephants and diverse fauna.', 'Northern', 'Nature', 9.2556, -1.8419, 120.00, 0.95, 890),
('Kwame Nkrumah Memorial Park', 'A beautiful monument dedicated to the founding father of independent Ghana.', 'Greater Accra', 'Historical', 5.5441, -0.2081, 40.00, 0.60, 3200),
('Manhyia Palace Museum', 'The historical seat of the Asantehene, rich with Ashanti cultural history.', 'Ashanti', 'Historical', 6.7056, -1.6153, 40.00, 0.80, 1150);