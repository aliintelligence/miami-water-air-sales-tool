#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('Creating admin user...');
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@miamiwaterandair.com',
    password: 'MiamiWater123!',
    email_confirm: true
  });
  
  if (authError) {
    console.error('Error creating auth user:', authError);
    return null;
  }
  
  console.log('Auth user created:', authData.user.id);
  
  // Create user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert([{
      id: authData.user.id,
      username: 'admin',
      role: 'admin'
    }])
    .select()
    .single();
  
  if (profileError) {
    console.error('Error creating user profile:', profileError);
    return null;
  }
  
  console.log('User profile created:', profile);
  return authData.user;
}

async function seedEquipment() {
  console.log('Seeding equipment...');
  
  const equipment = [
    {
      name_en: 'Whole House Water Filter',
      name_es: 'Filtro de Agua para Toda la Casa',
      name_ht: 'Filtè Dlo pou Kay la',
      model: 'WH-100',
      price: 1299.99,
      category: 'water_filters',
      brand: 'AquaPure',
      description_en: 'Complete water filtration system for your entire home',
      description_es: 'Sistema completo de filtración de agua para toda su casa',
      description_ht: 'Sistèm konplè filtrasyon dlo pou kay ou an',
      coverage: 'Whole House',
      is_active: true
    },
    {
      name_en: 'Under Sink Filter',
      name_es: 'Filtro Bajo el Fregadero',
      name_ht: 'Filtè Anba Lavabo',
      model: 'US-50',
      price: 299.99,
      category: 'water_filters',
      brand: 'AquaPure',
      description_en: 'Compact filtration system for kitchen use',
      description_es: 'Sistema compacto de filtración para uso en cocina',
      description_ht: 'Sistèm filtrasyon konpak pou kizin nan',
      coverage: 'Kitchen',
      is_active: true
    },
    {
      name_en: 'Reverse Osmosis System',
      name_es: 'Sistema de Ósmosis Inversa',
      name_ht: 'Sistèm Osmoz Enves',
      model: 'RO-75',
      price: 799.99,
      category: 'water_filters',
      brand: 'PureTech',
      description_en: 'Advanced reverse osmosis water purification',
      description_es: 'Purificación avanzada de agua por ósmosis inversa',
      description_ht: 'Pirifye dlo avanse ak osmoz enves',
      coverage: 'Kitchen',
      is_active: true
    },
    {
      name_en: 'Whole House Air Purifier',
      name_es: 'Purificador de Aire para Toda la Casa',
      name_ht: 'Purifye Lè pou Kay la',
      model: 'AP-200',
      price: 1599.99,
      category: 'air_purifiers',
      brand: 'AirClean',
      description_en: 'HEPA air purification for entire home',
      description_es: 'Purificación de aire HEPA para toda la casa',
      description_ht: 'Pirifye lè HEPA pou kay la',
      coverage: 'Whole House',
      is_active: true
    },
    {
      name_en: 'Room Air Purifier',
      name_es: 'Purificador de Aire para Cuarto',
      name_ht: 'Purifye Lè pou Chanm',
      model: 'AP-100',
      price: 399.99,
      category: 'air_purifiers',
      brand: 'AirClean',
      description_en: 'Compact air purifier for single rooms',
      description_es: 'Purificador de aire compacto para habitaciones individuales',
      description_ht: 'Purifye lè konpak pou yon chanm',
      coverage: 'Single Room',
      is_active: true
    },
    {
      name_en: 'UV Air Sanitizer',
      name_es: 'Sanitizador de Aire UV',
      name_ht: 'Sanitize Lè UV',
      model: 'UV-150',
      price: 699.99,
      category: 'air_purifiers',
      brand: 'UVTech',
      description_en: 'UV-C light air sanitization system',
      description_es: 'Sistema de sanitización de aire con luz UV-C',
      description_ht: 'Sistèm sanitize lè ak limyè UV-C',
      coverage: 'Room',
      is_active: true
    }
  ];
  
  const { data, error } = await supabase
    .from('equipment')
    .insert(equipment)
    .select();
  
  if (error) {
    console.error('Error seeding equipment:', error);
    return;
  }
  
  console.log(`Seeded ${data.length} equipment items`);
  return data;
}

async function seedFinancingOptions() {
  console.log('Seeding financing options...');
  
  const financingOptions = [
    { name: '12 Month Plan', term_months: 12, down_payment_percentage: 10.00, interest_rate: 0.00, is_active: true },
    { name: '24 Month Plan', term_months: 24, down_payment_percentage: 15.00, interest_rate: 2.99, is_active: true },
    { name: '36 Month Plan', term_months: 36, down_payment_percentage: 20.00, interest_rate: 4.99, is_active: true },
    { name: '48 Month Plan', term_months: 48, down_payment_percentage: 25.00, interest_rate: 6.99, is_active: true }
  ];
  
  const { data, error } = await supabase
    .from('financing_options')
    .insert(financingOptions)
    .select();
  
  if (error) {
    console.error('Error seeding financing options:', error);
    return;
  }
  
  console.log(`Seeded ${data.length} financing options`);
  return data;
}

async function seedPackages(equipmentData) {
  console.log('Seeding packages...');
  
  if (!equipmentData || equipmentData.length === 0) {
    console.log('No equipment data available for packages');
    return;
  }
  
  // Get some equipment IDs for packages
  const waterFilterIds = equipmentData
    .filter(eq => eq.category === 'water_filters')
    .map(eq => eq.id)
    .slice(0, 2);
  
  const airPurifierIds = equipmentData
    .filter(eq => eq.category === 'air_purifiers')
    .map(eq => eq.id)
    .slice(0, 1);
  
  const packages = [
    {
      name_en: 'Complete Home Water Solution',
      name_es: 'Solución Completa de Agua para el Hogar',
      name_ht: 'Solisyon Konplè Dlo pou Kay',
      description_en: 'Whole house filter with under sink system',
      description_es: 'Filtro para toda la casa con sistema bajo fregadero',
      description_ht: 'Filtè pou kay la ak sistèm anba lavabo',
      equipment_ids: waterFilterIds,
      discount_percentage: 10.00,
      total_price: 1439.99,
      monthly_price: 119.99,
      is_active: true
    },
    {
      name_en: 'Air & Water Combo',
      name_es: 'Combo de Aire y Agua',
      name_ht: 'Konbo Lè ak Dlo',
      description_en: 'Complete air and water purification package',
      description_es: 'Paquete completo de purificación de aire y agua',
      description_ht: 'Pakè konplè pirifye lè ak dlo',
      equipment_ids: [...waterFilterIds.slice(0, 1), ...airPurifierIds],
      discount_percentage: 15.00,
      total_price: 2124.99,
      monthly_price: 176.99,
      is_active: true
    }
  ];
  
  const { data, error } = await supabase
    .from('packages')
    .insert(packages)
    .select();
  
  if (error) {
    console.error('Error seeding packages:', error);
    return;
  }
  
  console.log(`Seeded ${data.length} packages`);
  return data;
}

async function main() {
  try {
    console.log('Setting up Miami Water & Air Sales Tool database...');
    
    // Create admin user
    const adminUser = await createAdminUser();
    if (!adminUser) {
      console.error('Failed to create admin user');
      process.exit(1);
    }
    
    // Seed equipment
    const equipmentData = await seedEquipment();
    
    // Seed financing options
    await seedFinancingOptions();
    
    // Seed packages
    await seedPackages(equipmentData);
    
    console.log('\n✅ Database setup complete!');
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@miamiwaterandair.com');
    console.log('Password: MiamiWater123!');
    console.log('\nSupabase Project URL:', supabaseUrl);
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main();