# Known Errors Database - Refer-ify (Supabase)

## Supabase Authentication Errors

### Supabase Configuration Issues
**Error**: "Supabase client not initialized"
**Cause**: Missing environment variables or incorrect setup
**Solution**: Ensure all Supabase env vars are set in .env.local:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### LinkedIn OAuth Issues
**Error**: "OAuth provider not configured"
**Cause**: LinkedIn provider not enabled in Supabase Auth settings
**Solution**: 
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable LinkedIn provider
3. Add LinkedIn Client ID and Client Secret
4. Set redirect URL to: https://your-project.supabase.co/auth/v1/callback

### Row Level Security (RLS) Errors
**Error**: "Permission denied for table"
**Cause**: RLS policies not properly configured
**Solution**: Create proper RLS policies for each table:
```sql
-- Example for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

## Database Errors

### Supabase Connection Issues
**Error**: "Failed to connect to Supabase"
**Cause**: Network issues or incorrect project URL
**Solution**: 
1. Check NEXT_PUBLIC_SUPABASE_URL is correct
2. Verify project is not paused in Supabase dashboard
3. Check network connectivity

### Migration Errors
**Error**: "Migration failed"
**Cause**: Schema conflicts or invalid SQL
**Solution**: 
```bash
# Reset database schema
supabase db reset

# Apply migrations individually
supabase db push
```

### Real-time Subscription Errors
**Error**: "Real-time subscription failed"
**Cause**: RLS policies blocking real-time access
**Solution**: Enable real-time for tables and check RLS policies allow real-time access

## Payment Errors

### Stripe Configuration
**Error**: "Stripe webhook validation failed"
**Cause**: Incorrect webhook secret or endpoint
**Solution**: Update webhook endpoint in Stripe dashboard to match your API route

### Payment Processing
**Error**: "Payment intent creation failed"
**Cause**: Invalid amount or currency
**Solution**: Ensure amounts are in cents and currency is supported

## AI Integration Errors

### OpenAI API Issues
**Error**: "OpenAI API quota exceeded"
**Cause**: Usage limits reached
**Solution**: Monitor usage in OpenAI dashboard, upgrade plan if needed

## File Storage Errors

### Supabase Storage Upload Issues
**Error**: "File upload failed"
**Cause**: Storage bucket not configured or file size limits
**Solution**: 
1. Create storage bucket in Supabase dashboard
2. Set up RLS policies for storage access
3. Check file size limits (default 50MB)

### Resume Processing Errors
**Error**: "Failed to process resume file"
**Cause**: Unsupported file format or corrupted file
**Solution**: 
1. Validate file type before upload (PDF, DOC, DOCX)
2. Add file size validation
3. Implement error handling for corrupted files

## Frontend Errors

### Next.js Build Issues
**Error**: "Module not found"
**Cause**: Missing dependencies or incorrect import paths
**Solution**: Check package.json and fix import statements

### Tailwind CSS Issues
**Error**: "Styles not applying"
**Cause**: Tailwind not configured properly
**Solution**: Ensure tailwind.config.js includes all content paths

## Common TypeScript Errors

### Type Safety Issues
**Error**: "Property 'x' does not exist on type 'y'"
**Cause**: Missing type definitions or incorrect typing
**Solution**: Add proper TypeScript interfaces and types

(This file will grow as you encounter and solve new errors)