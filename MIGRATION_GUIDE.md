# Miami Water & Air Sales Tool - AWS to Supabase/Vercel Migration

## Overview
This project has been cleaned and prepared for migration from AWS (Amplify/DynamoDB/Cognito) to Supabase (database/auth) and Vercel (hosting).

## What Was Removed
- ✅ `/miami-water-backend/` - Entire AWS Amplify backend directory
- ✅ AWS Amplify configuration files
- ✅ DynamoDB migration scripts
- ✅ AWS Lambda functions
- ✅ AWS SDK dependencies
- ✅ Amplify UI components

## What Was Added
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `/src/lib/supabase.js` - Supabase client configuration
- ✅ `/supabase/schema.sql` - Database schema for Supabase
- ✅ `.env.example` - Updated environment variables template
- ✅ Supabase SDK dependencies

## Current Architecture
- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js/Express API
- **Database**: Ready for Supabase (PostgreSQL)
- **Auth**: Ready for Supabase Auth
- **Hosting**: Ready for Vercel

## Next Steps

### 1. Set up Supabase Project
1. Create a new Supabase project at https://app.supabase.com
2. Run the schema SQL file in Supabase SQL editor: `/supabase/schema.sql`
3. Get your project URL and keys from Supabase dashboard

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (for backend)

### 3. Update Backend Models
The MongoDB models in `/server/models/` need to be updated to use Supabase instead. The Supabase client is already added to dependencies.

### 4. Update Authentication Flow
- The app currently uses JWT tokens with MongoDB
- Migrate to Supabase Auth for user management
- Update `/src/contexts/AuthContext.js` to use Supabase Auth

### 5. Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Database Migration
The MongoDB data needs to be migrated to Supabase. The schema has been designed to match the existing data structure:
- `users` → `public.users` (with Supabase Auth integration)
- `equipment` → `public.equipment`
- `packages` → `public.packages`
- `financingOptions` → `public.financing_options`
- `quotes` → `public.quotes`

## Key Features Preserved
- Multi-language support (EN, ES, HT)
- Role-based access (Admin/Sales Rep)
- Equipment catalog management
- Package creation
- Financing calculations
- PDF generation
- SignNow integration
- Quote management