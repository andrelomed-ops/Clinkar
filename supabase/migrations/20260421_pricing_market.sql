
-- Table for Real Market Pricing (Mexico 2024 Reference)
create table if not exists pricing_market (
    id uuid default gen_random_uuid() primary key,
    make text not null,
    model text not null,
    year integer not null,
    version text,
    price_base numeric not null,
    segment text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for fast lookup
create index idx_pricing_lookup on pricing_market(make, model, year);

-- SEED DATA: Realistic Mexico 2024 Market Values
insert into pricing_market (make, model, year, version, price_base, segment) values
('Nissan', 'Versa', 2024, 'Sense', 315000, 'Sedan Económico'),
('Nissan', 'Versa', 2024, 'Advance', 345000, 'Sedan Económico'),
('Nissan', 'Versa', 2024, 'Exclusive', 395000, 'Sedan Económico'),
('Nissan', 'Versa', 2020, 'Sense', 210000, 'Sedan Económico'),
('Nissan', 'Versa', 2018, 'Advance', 175000, 'Sedan Económico'),
('Nissan', 'Versa', 2015, 'Sense', 135000, 'Sedan Económico'),

('Volkswagen', 'Jetta', 2024, 'Trendline', 395000, 'Sedan Mediano'),
('Volkswagen', 'Jetta', 2024, 'Sportline', 495000, 'Sedan Mediano'),
('Volkswagen', 'Jetta', 2020, 'Trendline', 285000, 'Sedan Mediano'),
('Volkswagen', 'Jetta', 2018, 'Trendline', 235000, 'Sedan Mediano'),
('Volkswagen', 'Jetta', 2014, 'Trendline', 155000, 'Sedan Mediano'),

('Mazda', 'Mazda 3', 2024, 'i', 395000, 'Sedan Mediano'),
('Mazda', 'Mazda 3', 2024, 'Signature', 525000, 'Sedan Mediano'),
('Mazda', 'Mazda 3', 2020, 'i Grand Touring', 315000, 'Sedan Mediano'),
('Mazda', 'Mazda 3', 2018, 'i Touring', 245000, 'Sedan Mediano'),
('Mazda', 'Mazda 3', 2014, 'Sport', 185000, 'Sedan Mediano'),
('Mazda', 'Mazda 3', 2014, 'i', 155000, 'Sedan Mediano'),

('Kia', 'Seltos', 2024, 'EX', 485000, 'SUV Compacta'),
('Kia', 'Seltos', 2023, 'GT Line', 510000, 'SUV Compacta'),
('Kia', 'Seltos', 2021, 'EX Pack', 365000, 'SUV Compacta'),

('Toyota', 'Corolla', 2024, 'Base', 415000, 'Sedan Mediano'),
('Toyota', 'Corolla', 2020, 'LE', 295000, 'Sedan Mediano'),
('Toyota', 'Corolla', 2015, 'Base', 185000, 'Sedan Mediano'),

('Honda', 'CR-V', 2024, 'Turbo', 725000, 'SUV Mediana'),
('Honda', 'CR-V', 2020, 'EXL', 485000, 'SUV Mediana'),
('Honda', 'CR-V', 2015, 'i-VTEC', 265000, 'SUV Mediana'),

('Chevrolet', 'Aveo', 2024, 'LS', 285000, 'Sedan Económico'),
('Chevrolet', 'Aveo', 2018, 'LS', 145000, 'Sedan Económico'),
('Chevrolet', 'Aveo', 2014, 'LT', 95000, 'Sedan Económico'),

('Ford', 'Ranger', 2024, 'XLT', 750000, 'Pickup'),
('Ford', 'Ranger', 2020, 'XLT', 465000, 'Pickup'),
('Ford', 'Ranger', 2015, 'XL', 285000, 'Pickup');
