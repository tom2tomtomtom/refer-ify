import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/applications/referrer
 *
 * Handles referrer (Select Circle) application submissions.
 *
 * Request Body:
 * - firstName: string (required)
 * - lastName: string (required)
 * - email: string (required, valid email format)
 * - linkedinUrl: string (required, must contain linkedin.com)
 * - yearsExperience: string (required, one of: '10-15 years', '15-20 years', '20+ years')
 * - currentCompany: string (optional)
 * - currentTitle: string (optional)
 * - jobTypes: string (required, comma-separated)
 * - industries: string (required, comma-separated)
 * - networkDescription: string (optional)
 * - motivation: string (optional)
 * - referralSource: string (optional)
 * - referredByEmail: string (optional)
 *
 * Returns:
 * - 200: { success: true, message: string, id: uuid }
 * - 400: { error: string } - Validation error
 * - 500: { error: string } - Server error
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'linkedinUrl',
      'yearsExperience',
      'jobTypes',
      'industries'
    ];

    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        return NextResponse.json(
          { error: `Missing or empty required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL format
    const linkedinUrl = body.linkedinUrl.toLowerCase().trim();
    if (!linkedinUrl.includes('linkedin.com')) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL. Please provide a valid LinkedIn profile URL.' },
        { status: 400 }
      );
    }

    // Validate years of experience
    const validExperienceLevels = ['10-15 years', '15-20 years', '20+ years'];
    if (!validExperienceLevels.includes(body.yearsExperience)) {
      return NextResponse.json(
        { error: 'Invalid years of experience. Must be one of: 10-15 years, 15-20 years, 20+ years' },
        { status: 400 }
      );
    }

    // Validate referred by email format if provided
    if (body.referredByEmail && body.referredByEmail.trim() !== '') {
      if (!emailRegex.test(body.referredByEmail)) {
        return NextResponse.json(
          { error: 'Invalid referred by email format' },
          { status: 400 }
        );
      }
    }

    // Get Supabase client
    const supabase = await getSupabaseServerClient();

    // Check for duplicate application with same email
    const { data: existingApplication, error: checkError } = await supabase
      .from('referrer_applications')
      .select('id, status, created_at')
      .eq('email', body.email.toLowerCase().trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking for duplicate application:', checkError);
    }

    if (existingApplication) {
      // Check if application is pending or approved
      if (existingApplication.status === 'pending') {
        return NextResponse.json(
          {
            error: 'An application with this email is already pending review.',
            existingApplicationId: existingApplication.id
          },
          { status: 409 } // Conflict
        );
      }

      if (existingApplication.status === 'approved') {
        return NextResponse.json(
          {
            error: 'This email has already been approved. Please check your inbox for next steps.',
            existingApplicationId: existingApplication.id
          },
          { status: 409 } // Conflict
        );
      }
    }

    // Prepare data for insertion
    const applicationData = {
      first_name: body.firstName.trim(),
      last_name: body.lastName.trim(),
      email: body.email.toLowerCase().trim(),
      linkedin_url: body.linkedinUrl.trim(),
      years_experience: body.yearsExperience,
      current_company: body.currentCompany?.trim() || null,
      current_title: body.currentTitle?.trim() || null,
      job_types: body.jobTypes.trim(),
      industries: body.industries.trim(),
      network_description: body.networkDescription?.trim() || null,
      motivation: body.motivation?.trim() || null,
      referral_source: body.referralSource?.trim() || null,
      referred_by_email: body.referredByEmail?.trim().toLowerCase() || null,
      status: 'pending',
    };

    // Insert application into database
    const { data, error } = await supabase
      .from('referrer_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) {
      console.error('Database error inserting referrer application:', error);

      // Handle specific database errors
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'An application with this email already exists.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation email to applicant
    // TODO: Send notification email to admin team
    // This would integrate with your email service (SendGrid, Resend, etc.)

    console.log('Referrer application submitted successfully:', {
      id: data.id,
      email: data.email,
      name: `${data.first_name} ${data.last_name}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review your application and get back to you within 3-5 business days.',
      id: data.id,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in referrer application submission:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications/referrer
 *
 * Method not allowed - use POST to submit applications
 */
export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed. Use POST to submit applications.',
  }, { status: 405 });
}
