# Deployment Guide - Miami Water & Air Sales Tool

## Prerequisites
- Supabase account
- Vercel account
- GitHub account

## Step 1: Set up Supabase Database

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create a new project
   - Wait for it to initialize

2. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `/supabase/schema.sql`
   - Click "Run" to create all tables and RLS policies

3. **Seed Sample Data**
   - In SQL Editor, copy and paste contents of `/supabase/seed.sql`
   - Click "Run" to insert sample data

4. **Create Admin User**
   - Go to Authentication > Users in Supabase dashboard
   - Click "Invite a user"
   - Email: `admin@miamiwaterandair.com`
   - Password: Set a secure password
   - After user is created, note the UUID
   - Update the seed data to use the actual UUID

5. **Get Supabase Credentials**
   - Go to Settings > API
   - Copy the Project URL
   - Copy the `anon/public` key (for frontend)
   - Copy the `service_role` key (for backend)

## Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Frontend
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_random_jwt_secret
PORT=5000

# SignNow (optional)
SIGNNOW_API_URL=https://api.signnow.com
SIGNNOW_USERNAME=your_signnow_username
SIGNNOW_PASSWORD=your_signnow_password
```

## Step 3: Test Locally

1. **Install Dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test the Application**
   - Visit http://localhost:3000
   - Try logging in with: `admin@miamiwaterandair.com` / `password`
   - Verify all features work

## Step 4: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - migrated to Supabase"
   git branch -M main
   git remote add origin https://github.com/yourusername/miami-water-sales-tool.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Framework Preset: "Create React App"
   - Root Directory: Leave empty (project root)

3. **Configure Environment Variables in Vercel**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all environment variables from your `.env` file:
     - `REACT_APP_SUPABASE_URL`
     - `REACT_APP_SUPABASE_ANON_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_KEY`
     - `JWT_SECRET`
     - Other SignNow variables if needed

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Visit your deployed URL

## Step 5: Post-Deployment Setup

1. **Update CORS in Supabase**
   - Go to Authentication > Settings in Supabase
   - Add your Vercel URL to "Site URL"
   - Add your Vercel URL to "Redirect URLs"

2. **Test Production App**
   - Visit your Vercel URL
   - Test login functionality
   - Test all features
   - Verify API endpoints work

## Troubleshooting

### Common Issues:

1. **"Invalid API key" errors**
   - Verify environment variables are set correctly in Vercel
   - Make sure you're using the correct keys (anon vs service_role)

2. **CORS errors**
   - Check Supabase CORS settings
   - Verify your domain is added to allowed origins

3. **Database connection errors**
   - Verify Supabase URL and keys
   - Check if RLS policies are correctly set up

4. **Build failures**
   - Check for any missing dependencies
   - Verify all imports are correct

### Logs:
- Check Vercel Function logs for backend errors
- Check browser console for frontend errors
- Check Supabase logs for database errors

## Next Steps

1. **Add more users** via Supabase Auth dashboard
2. **Customize equipment catalog** in Supabase database
3. **Configure SignNow integration** for document signing
4. **Set up custom domain** in Vercel
5. **Add monitoring** and analytics

## Support

For issues with this deployment, check:
- Vercel documentation: https://vercel.com/docs
- Supabase documentation: https://supabase.com/docs
- GitHub issues in the repository