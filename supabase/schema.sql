-- Miami Water & Air Sales Tool - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'sales_rep' CHECK (role IN ('admin', 'sales_rep')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_es TEXT,
  name_ht TEXT,
  model TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  description_en TEXT,
  description_es TEXT,
  description_ht TEXT,
  pdf_sheet_url TEXT,
  coverage TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_es TEXT,
  name_ht TEXT,
  description_en TEXT,
  description_es TEXT,
  description_ht TEXT,
  equipment_ids UUID[] NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  monthly_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financing Options table
CREATE TABLE public.financing_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  term_months INTEGER NOT NULL,
  down_payment_percentage DECIMAL(5, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL,
  sales_rep_id UUID REFERENCES public.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  selected_equipment JSONB NOT NULL,
  selected_package_id UUID REFERENCES public.packages(id),
  financing_option_id UUID REFERENCES public.financing_options(id),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  down_payment DECIMAL(10, 2),
  monthly_payment DECIMAL(10, 2),
  term_months INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'completed', 'cancelled')),
  pdf_url TEXT,
  signnow_document_id TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Equipment policies (everyone can read)
CREATE POLICY "Equipment is viewable by all authenticated users" ON public.equipment
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage equipment" ON public.equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Packages policies
CREATE POLICY "Packages are viewable by all authenticated users" ON public.packages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage packages" ON public.packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Financing options policies
CREATE POLICY "Financing options are viewable by all authenticated users" ON public.financing_options
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage financing options" ON public.financing_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quotes policies
CREATE POLICY "Sales reps can view their own quotes" ON public.quotes
  FOR SELECT USING (sales_rep_id = auth.uid());

CREATE POLICY "Sales reps can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (sales_rep_id = auth.uid());

CREATE POLICY "Sales reps can update their own quotes" ON public.quotes
  FOR UPDATE USING (sales_rep_id = auth.uid());

CREATE POLICY "Admins can view all quotes" ON public.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_equipment_category ON public.equipment(category);
CREATE INDEX idx_equipment_active ON public.equipment(is_active);
CREATE INDEX idx_quotes_sales_rep ON public.quotes(sales_rep_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at DESC);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financing_options_updated_at BEFORE UPDATE ON public.financing_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();