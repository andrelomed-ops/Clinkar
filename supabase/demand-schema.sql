-- Tabla de Peticiones de Demanda (usuarios buscando auto)
CREATE TABLE IF NOT EXISTS demand_registry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    year_min INTEGER,
    year_max INTEGER,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    location VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    match_found BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Leads de Vendedores (Tengo auto, busco comprador)
CREATE TABLE IF NOT EXISTS seller_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    current_brand VARCHAR(100) NOT NULL,
    current_model VARCHAR(100),
    current_year INTEGER NOT NULL,
    current_price_expected DECIMAL(12,2),
    condition VARCHAR(50) DEFAULT 'good',
    looking_for TEXT,
    contact_preference VARCHAR(20) DEFAULT 'whatsapp',
    status VARCHAR(50) DEFAULT 'new',
    demand_match_id UUID REFERENCES demand_registry(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Matches (conexiones demanda-oferta)
CREATE TABLE IF NOT EXISTS demand_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    demand_id UUID REFERENCES demand_registry(id),
    seller_lead_id UUID REFERENCES seller_leads(id),
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);

-- Habilitar RLS
ALTER TABLE demand_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_matches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lectura pública (todos pueden ver demandas)
CREATE POLICY "Public can read demand_registry" ON demand_registry FOR SELECT USING (true);
CREATE POLICY "Public can read seller_leads" ON seller_leads FOR SELECT USING (true);

-- Políticas RLS para escritura autenticada
CREATE POLICY "Authenticated can insert demand_registry" ON demand_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can insert seller_leads" ON seller_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update demand_registry" ON demand_registry FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update seller_leads" ON seller_leads FOR UPDATE USING (auth.role() = 'authenticated');

-- Índices para búsquedas rápidas
CREATE INDEX idx_demand_registry_brand ON demand_registry(brand);
CREATE INDEX idx_demand_registry_status ON demand_registry(status);
CREATE INDEX idx_seller_leads_brand ON seller_leads(current_brand);
CREATE INDEX idx_seller_leads_status ON seller_leads(status);