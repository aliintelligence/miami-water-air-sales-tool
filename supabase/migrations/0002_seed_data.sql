-- Seed data for Miami Water & Air Sales Tool

-- First, create an admin user in Supabase Auth manually, then insert into users table
-- This is a placeholder for the admin user - replace with actual UUID from Supabase Auth
INSERT INTO public.users (id, username, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert sample equipment
INSERT INTO public.equipment (name_en, name_es, name_ht, model, price, category, brand, description_en, description_es, description_ht, coverage, is_active) VALUES 
  ('Whole House Water Filter', 'Filtro de Agua para Toda la Casa', 'Filtè Dlo pou Kay la', 'WH-100', 1299.99, 'water_filters', 'AquaPure', 'Complete water filtration system for your entire home', 'Sistema completo de filtración de agua para toda su casa', 'Sistèm konplè filtrasyon dlo pou kay ou an', 'Whole House', true),
  ('Under Sink Filter', 'Filtro Bajo el Fregadero', 'Filtè Anba Lavabo', 'US-50', 299.99, 'water_filters', 'AquaPure', 'Compact filtration system for kitchen use', 'Sistema compacto de filtración para uso en cocina', 'Sistèm filtrasyon konpak pou kizin nan', 'Kitchen', true),
  ('Reverse Osmosis System', 'Sistema de Ósmosis Inversa', 'Sistèm Osmoz Enves', 'RO-75', 799.99, 'water_filters', 'PureTech', 'Advanced reverse osmosis water purification', 'Purificación avanzada de agua por ósmosis inversa', 'Pirifye dlo avanse ak osmoz enves', 'Kitchen', true),
  ('Whole House Air Purifier', 'Purificador de Aire para Toda la Casa', 'Purifye Lè pou Kay la', 'AP-200', 1599.99, 'air_purifiers', 'AirClean', 'HEPA air purification for entire home', 'Purificación de aire HEPA para toda la casa', 'Pirifye lè HEPA pou kay la', 'Whole House', true),
  ('Room Air Purifier', 'Purificador de Aire para Cuarto', 'Purifye Lè pou Chanm', 'AP-100', 399.99, 'air_purifiers', 'AirClean', 'Compact air purifier for single rooms', 'Purificador de aire compacto para habitaciones individuales', 'Purifye lè konpak pou yon chanm', 'Single Room', true),
  ('UV Air Sanitizer', 'Sanitizador de Aire UV', 'Sanitize Lè UV', 'UV-150', 699.99, 'air_purifiers', 'UVTech', 'UV-C light air sanitization system', 'Sistema de sanitización de aire con luz UV-C', 'Sistèm sanitize lè ak limyè UV-C', 'Room', true);

-- Insert sample financing options
INSERT INTO public.financing_options (name, term_months, down_payment_percentage, interest_rate, is_active) VALUES 
  ('12 Month Plan', 12, 10.00, 0.00, true),
  ('24 Month Plan', 24, 15.00, 2.99, true),
  ('36 Month Plan', 36, 20.00, 4.99, true),
  ('48 Month Plan', 48, 25.00, 6.99, true);

-- Insert sample packages
INSERT INTO public.packages (name_en, name_es, name_ht, description_en, description_es, description_ht, equipment_ids, discount_percentage, total_price, monthly_price, is_active) VALUES 
  ('Complete Home Water Solution', 'Solución Completa de Agua para el Hogar', 'Solisyon Konplè Dlo pou Kay', 'Whole house filter with under sink system', 'Filtro para toda la casa con sistema bajo fregadero', 'Filtè pou kay la ak sistèm anba lavabo', ARRAY[]::UUID[], 10.00, 1439.99, 119.99, true),
  ('Air & Water Combo', 'Combo de Aire y Agua', 'Konbo Lè ak Dlo', 'Complete air and water purification package', 'Paquete completo de purificación de aire y agua', 'Pakè konplè pirifye lè ak dlo', ARRAY[]::UUID[], 15.00, 2124.99, 176.99, true),
  ('Basic Water Package', 'Paquete Básico de Agua', 'Pakè Baz Dlo', 'Essential water filtration for your home', 'Filtración esencial de agua para su hogar', 'Filtrasyon dlo esansyèl pou kay ou', ARRAY[]::UUID[], 5.00, 1549.99, 129.99, true);

-- Note: You'll need to update the equipment_ids arrays with actual UUIDs after the equipment is inserted
-- This can be done with an UPDATE statement after running this seed script