/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import SignupPage from '@/app/(auth)/signup/page'

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:3000',
  href: '',
}
// Use delete then redefine to avoid TypeError
delete (window as any).location
window.location = mockLocation as any

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithOAuth: jest.fn(),
    resend: jest.fn(),
  },
}

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: jest.fn(() => mockSupabaseClient),
}))

describe('Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
  })

  it('renders signup form with all elements', () => {
    render(<SignupPage />)

    expect(screen.getByText('Create your account')).toBeInTheDocument()

    // Form inputs
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()

    // Buttons
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.getByText('Continue with LinkedIn')).toBeInTheDocument()

    // Initial state - no message or resend button
    expect(screen.queryByText('Resend confirmation')).not.toBeInTheDocument()
  })

  it('handles email and password input changes', () => {
    render(<SignupPage />)

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('disables sign up button when email or password is empty', () => {
    render(<SignupPage />)

    const signUpButton = screen.getByText('Sign up')

    // Initially disabled (empty fields)
    expect(signUpButton).toBeDisabled()

    // Fill email only
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    expect(signUpButton).toBeDisabled()

    // Fill password only (clear email)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    expect(signUpButton).toBeDisabled()

    // Fill both
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    expect(signUpButton).not.toBeDisabled()
  })

  it('handles successful email signup', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    const signUpButton = screen.getByText('Sign up')
    
    await act(async () => {
      fireEvent.click(signUpButton)
    })

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: 'http://localhost/callback',
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Check your email to confirm your account, then sign in with your password.')).toBeInTheDocument()
    })

    // Should show resend button after success
    expect(screen.getByText('Resend confirmation')).toBeInTheDocument()
  })

  it('handles signup error and displays message', async () => {
    const errorMessage = 'Email already registered'
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    const signUpButton = screen.getByText('Sign up')
    
    await act(async () => {
      fireEvent.click(signUpButton)
    })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Should show resend button even on error (in case it was a duplicate signup)
    expect(screen.getByText('Resend confirmation')).toBeInTheDocument()
  })

  it('shows loading state during signup', async () => {
    let resolveSignUp: (value: any) => void
    const signUpPromise = new Promise((resolve) => {
      resolveSignUp = resolve
    })
    mockSupabaseClient.auth.signUp.mockReturnValue(signUpPromise)

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    const signUpButton = screen.getByText('Sign up')
    
    await act(async () => {
      fireEvent.click(signUpButton)
    })

    // Should show loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(signUpButton).toBeDisabled()

    // Resolve the promise
    resolveSignUp!({ data: { user: null }, error: null })

    await waitFor(() => {
      expect(screen.getByText('Sign up')).toBeInTheDocument()
    })
  })

  it('handles LinkedIn OAuth signup', async () => {
    render(<SignupPage />)

    const linkedInButton = screen.getByText('Continue with LinkedIn')
    
    await act(async () => {
      fireEvent.click(linkedInButton)
    })

    expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'linkedin_oidc',
      options: { redirectTo: 'http://localhost/callback' },
    })
  })

  it('handles resend confirmation email', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    })
    mockSupabaseClient.auth.resend.mockResolvedValue({
      data: {},
      error: null,
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    // First sign up to show resend button
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    await waitFor(() => {
      expect(screen.getByText('Resend confirmation')).toBeInTheDocument()
    })

    // Click resend
    const resendButton = screen.getByText('Resend confirmation')
    
    await act(async () => {
      fireEvent.click(resendButton)
    })

    expect(mockSupabaseClient.auth.resend).toHaveBeenCalledWith({ 
      type: 'signup', 
      email: 'test@example.com' 
    })

    await waitFor(() => {
      expect(screen.getByText('Confirmation email re-sent. Please check your inbox.')).toBeInTheDocument()
    })
  })

  it('shows loading state during resend operation', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    let resolveResend: (value: any) => void
    const resendPromise = new Promise((resolve) => {
      resolveResend = resolve
    })
    mockSupabaseClient.auth.resend.mockReturnValue(resendPromise)

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    // First sign up to show resend button
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    await waitFor(() => {
      expect(screen.getByText('Resend confirmation')).toBeInTheDocument()
    })

    // Click resend to start loading
    const resendButton = screen.getByText('Resend confirmation')
    
    await act(async () => {
      fireEvent.click(resendButton)
    })

    // Should show loading state
    expect(screen.getByText('Resending…')).toBeInTheDocument()
    expect(resendButton).toBeDisabled()

    // Resolve the promise
    resolveResend!({ data: {}, error: null })

    await waitFor(() => {
      expect(screen.getByText('Resend confirmation')).toBeInTheDocument()
    })
  })

  it('handles resend error', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    })
    mockSupabaseClient.auth.resend.mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' },
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    // First sign up
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    await waitFor(() => {
      expect(screen.getByText('Resend confirmation')).toBeInTheDocument()
    })

    // Click resend
    await act(async () => {
      fireEvent.click(screen.getByText('Resend confirmation'))
    })

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })
  })

  it('disables resend button when no email is entered', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    render(<SignupPage />)

    // Sign up with email, then clear email field
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    // Clear email after signup
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } })

    await waitFor(() => {
      const resendButton = screen.getByText('Resend confirmation')
      expect(resendButton).toBeDisabled()
    })
  })

  it('handles generic signup errors', async () => {
    mockSupabaseClient.auth.signUp.mockRejectedValue({
      // Error without message property
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    await waitFor(() => {
      expect(screen.getByText('Signup failed')).toBeInTheDocument()
    })
  })

  it('handles generic resend errors', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    })
    mockSupabaseClient.auth.resend.mockRejectedValue({
      // Error without message property  
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    await waitFor(() => {
      expect(screen.getByText('Resend confirmation')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Resend confirmation'))
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to resend')).toBeInTheDocument()
    })
  })

  it('clears message on new signup attempt', async () => {
    // First attempt - show error
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'First error' },
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } })
    
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second attempt - should clear previous error
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'correctpassword' } })
    
    await act(async () => {
      fireEvent.click(screen.getByText('Sign up'))
    })

    // Error should be cleared immediately when starting new attempt
    expect(screen.queryByText('First error')).not.toBeInTheDocument()
  })

  it('has proper form structure and accessibility', () => {
    render(<SignupPage />)

    // Check form inputs have proper labels and types
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')

    // Check inputs have proper IDs matching labels
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'password')
  })
})