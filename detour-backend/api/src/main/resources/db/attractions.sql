-- Applied automatically on startup via spring.sql.init.schema-locations.
-- Required because spring.jpa.hibernate.ddl-auto=validate

ALTER TABLE attractions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2);
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS review_count INTEGER;

CREATE TABLE IF NOT EXISTS attraction_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    attraction_id INTEGER NOT NULL REFERENCES attractions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, attraction_id)
);

CREATE INDEX IF NOT EXISTS idx_attraction_favorites_user_id ON attraction_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_attraction_favorites_attraction_id ON attraction_favorites(attraction_id);

-- Seed tourist attractions (idempotent — skips rows that already exist by title).
-- image_url, average_rating, and review_count are omitted (NULL), same as existing records.
-- distanceKm and isFavorited are computed by the API at read time, not stored here.

UPDATE attractions
SET region = 'Northern'
WHERE title = 'Mole National Park' AND region = 'Savannah';

INSERT INTO attractions (title, description, region, category, latitude, longitude, base_price, eco_score, popularity_count)
SELECT 'Kakum National Park', 'Famous for its rainforest canopy walkway located in the Central Region.', 'Central', 'Nature', 5.420800, -1.382200, 60.00, 0.90, 1540
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE title = 'Kakum National Park');

INSERT INTO attractions (title, description, region, category, latitude, longitude, base_price, eco_score, popularity_count)
SELECT 'Cape Coast Castle', 'A historical landmark detailing the dark history of the trans-Atlantic slave trade.', 'Central', 'Historical', 5.102600, -1.241300, 50.00, 0.75, 2100
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE title = 'Cape Coast Castle');

INSERT INTO attractions (title, description, region, category, latitude, longitude, base_price, eco_score, popularity_count)
SELECT 'Mole National Park', 'Ghana''s largest wildlife refuge featuring savannah elephants and diverse fauna.', 'Northern', 'Nature', 9.255600, -1.841900, 120.00, 0.95, 890
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE title = 'Mole National Park');

INSERT INTO attractions (title, description, region, category, latitude, longitude, base_price, eco_score, popularity_count)
SELECT 'Kwame Nkrumah Memorial Park', 'A beautiful monument dedicated to the founding father of independent Ghana.', 'Greater Accra', 'Historical', 5.544100, -0.208100, 40.00, 0.60, 3200
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE title = 'Kwame Nkrumah Memorial Park');

INSERT INTO attractions (title, description, region, category, latitude, longitude, base_price, eco_score, popularity_count)
SELECT 'Manhyia Palace Museum', 'The historical seat of the Asantehene, rich with Ashanti cultural history.', 'Ashanti', 'Historical', 6.705600, -1.615300, 40.00, 0.80, 1150
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE title = 'Manhyia Palace Museum');
