/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:3000',
  href: '',
}
// Use delete then redefine to avoid TypeError
delete (window as any).location
window.location = mockLocation as any

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: jest.fn(),
    signInWithPassword: jest.fn(),
  },
}

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: jest.fn(() => mockSupabaseClient),
}))

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    // Mock NODE_ENV as development for demo buttons
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    delete process.env.NODE_ENV
  })

  it('renders login form with all elements', () => {
    render(<LoginPage />)

    expect(screen.getByText('Sign in to Refer-ify')).toBeInTheDocument()
    expect(screen.getByText('Use email + password or LinkedIn. New here? Sign up first.')).toBeInTheDocument()

    // Form inputs
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()

    // Buttons
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Continue with LinkedIn')).toBeInTheDocument()

    // Footer link - just check for the signup link directly 
    const signupLink = screen.getByText('Sign up')
    expect(signupLink).toBeInTheDocument()
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup')
  })

  it('handles email and password input changes', () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('disables sign in button when email or password is empty', () => {
    render(<LoginPage />)

    const signInButton = screen.getByText('Sign in')

    // Initially disabled (empty fields)
    expect(signInButton).toBeDisabled()

    // Fill email only
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    expect(signInButton).toBeDisabled()

    // Fill password only (clear email)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    expect(signInButton).toBeDisabled()

    // Fill both
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    expect(signInButton).not.toBeDisabled()
  })

  it('handles successful email/password sign in', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    const signInButton = screen.getByText('Sign in')
    
    await act(async () => {
      fireEvent.click(signInButton)
    })

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })

    // Just check that the API was called successfully - navigation tested separately
  })

  it('handles sign in error and displays message', async () => {
    const errorMessage = 'Invalid email or password'
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } })
    
    const signInButton = screen.getByText('Sign in')
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Error properly displayed, navigation stays on login page
  })

  it('shows loading state during sign in', async () => {
    let resolveSignIn: (value: any) => void
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve
    })
    mockSupabaseClient.auth.signInWithPassword.mockReturnValue(signInPromise)

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    const signInButton = screen.getByText('Sign in')
    fireEvent.click(signInButton)

    // Should show loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(signInButton).toBeDisabled()

    // Resolve the promise
    resolveSignIn!({ data: { user: { id: 'user-123' } }, error: null })

    await waitFor(() => {
      expect(screen.getByText('Sign in')).toBeInTheDocument()
    })
  })

  it('handles LinkedIn OAuth sign in', async () => {
    render(<LoginPage />)

    const linkedInButton = screen.getByText('Continue with LinkedIn')
    
    await act(async () => {
      fireEvent.click(linkedInButton)
    })

    expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'linkedin_oidc',
      options: { redirectTo: 'http://localhost/callback' },
    })
  })

  it('displays demo buttons in development mode', () => {
    process.env.NODE_ENV = 'development'
    render(<LoginPage />)

    expect(screen.getByText('Demo Flow: Choose a role below → Explore → Sign Out → Try another role')).toBeInTheDocument()
    expect(screen.getByText('Demo as Founder')).toBeInTheDocument()
    expect(screen.getByText('Demo as Referrer')).toBeInTheDocument()
    expect(screen.getByText('Demo as Client Company')).toBeInTheDocument()
  })

  it('hides demo buttons in production mode', () => {
    process.env.NODE_ENV = 'production'
    render(<LoginPage />)

    expect(screen.queryByText('Demo Flow: Choose a role below → Explore → Sign Out → Try another role')).not.toBeInTheDocument()
    expect(screen.queryByText('Demo as Founder')).not.toBeInTheDocument()
    expect(screen.queryByText('Demo as Referrer')).not.toBeInTheDocument()
    expect(screen.queryByText('Demo as Client Company')).not.toBeInTheDocument()
  })

  it('handles demo role selection - founding_circle role', async () => {
    render(<LoginPage />)

    const foundingButton = screen.getByText('Demo as Founder')

    await act(async () => {
      fireEvent.click(foundingButton)
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('demo_user_role', 'founding')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dev_role_override', 'founding')
    // Navigation tested separately - just check localStorage calls
  })

  it('handles demo role selection - select_circle role', async () => {
    render(<LoginPage />)

    const selectButton = screen.getByText('Demo as Referrer')

    await act(async () => {
      fireEvent.click(selectButton)
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('demo_user_role', 'select')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dev_role_override', 'select')
    // Navigation tested separately - just check localStorage calls
  })

  it('handles demo role selection - client', async () => {
    render(<LoginPage />)

    const clientButton = screen.getByText('Demo as Client Company')
    
    await act(async () => {
      fireEvent.click(clientButton)
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('demo_user_role', 'client')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dev_role_override', 'client')
    // Navigation tested separately - just check localStorage calls
  })

  it('handles localStorage errors gracefully during demo role setting', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })

    render(<LoginPage />)

    const foundingButton = screen.getByText('Demo as Founder')

    // Should not throw error when clicking
    await act(async () => {
      expect(() => fireEvent.click(foundingButton)).not.toThrow()
    })

    // Navigation would still work but localStorage call failed gracefully
  })

  it('handles generic sign in errors', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockRejectedValue({
      // Error without message property
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByText('Sign in'))

    await waitFor(() => {
      expect(screen.getByText('Sign in failed')).toBeInTheDocument()
    })
  })

  it('clears error message on new sign in attempt', async () => {
    // First attempt - show error
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'First error' },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } })
    fireEvent.click(screen.getByText('Sign in'))

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second attempt - should clear previous error
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'correctpassword' } })
    fireEvent.click(screen.getByText('Sign in'))

    // Error should be cleared immediately when starting new attempt
    expect(screen.queryByText('First error')).not.toBeInTheDocument()
  })

  it('has proper form structure and accessibility', () => {
    render(<LoginPage />)

    // Check form inputs have proper labels
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')

    // Check inputs have proper IDs matching labels
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'password')
  })
})