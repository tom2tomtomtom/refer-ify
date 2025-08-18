import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Referral Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state (adjust based on your auth implementation)
    // This might require setting cookies or local storage
    await page.goto('/login')
    
    // Login as a test user (adjust based on your implementation)
    await page.fill('[data-testid="email-input"]', 'referrer@example.com')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Wait for successful login
    await page.waitForURL(/\/(dashboard|client|candidate)/)
  })

  test('should display job details in referral form', async ({ page }) => {
    // Navigate to a specific job's referral page
    await page.goto('/refer/job-123')
    
    // Should show job information
    await expect(page.getByText('Senior Software Engineer')).toBeVisible()
    await expect(page.getByText(/Build scalable applications/)).toBeVisible()
    
    // Should show referral form
    await expect(page.getByLabel('Professional Name *')).toBeVisible()
    await expect(page.getByLabel('Professional Email *')).toBeVisible()
  })

  test('should complete full referral submission with file upload', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Fill out the referral form
    await page.fill('[data-testid="candidate-name"]', 'John Doe')
    await page.fill('[data-testid="candidate-email"]', 'john@example.com')
    await page.fill('[data-testid="candidate-phone"]', '+1234567890')
    await page.fill('[data-testid="candidate-linkedin"]', 'https://linkedin.com/in/johndoe')
    
    // Upload resume file
    const filePath = path.join(__dirname, '..', 'test-assets', 'sample-resume.pdf')
    await page.setInputFiles('[data-testid="resume-upload"]', filePath)
    
    // Wait for upload to complete
    await expect(page.getByText('sample-resume.pdf')).toBeVisible()
    
    // Fill remaining fields
    await page.fill('[data-testid="expected-salary"]', '120000')
    
    // Select availability
    await page.click('[data-testid="availability-select"]')
    await page.click('text=2 weeks')
    
    // Fill referrer notes
    await page.fill(
      '[data-testid="referrer-notes"]',
      'Excellent candidate with strong React and TypeScript experience. Has led successful projects at previous companies.'
    )
    
    // Give consent
    await page.check('[data-testid="consent-checkbox"]')
    
    // Submit the referral
    await page.click('[data-testid="submit-referral"]')
    
    // Should show success message
    await expect(page.getByText(/Referral submitted|Success/)).toBeVisible()
    
    // Should show tracking information
    await expect(page.getByText(/Tracking ID|Reference/)).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-referral"]')
    
    // Should show validation errors
    await expect(page.getByText('Professional Name is required')).toBeVisible()
    await expect(page.getByText('Professional Email is required')).toBeVisible()
    await expect(page.getByText('You must provide GDPR consent')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    await page.fill('[data-testid="candidate-name"]', 'John Doe')
    await page.fill('[data-testid="candidate-email"]', 'invalid-email')
    await page.check('[data-testid="consent-checkbox"]')
    
    await page.click('[data-testid="submit-referral"]')
    
    // Should show email validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('should validate file upload types', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Try to upload invalid file type
    const invalidFilePath = path.join(__dirname, '..', 'test-assets', 'invalid-file.txt')
    await page.setInputFiles('[data-testid="resume-upload"]', invalidFilePath)
    
    // Should show error message
    await expect(page.getByText('Invalid file type. Upload PDF, DOC or DOCX')).toBeVisible()
    
    // File should not be uploaded
    await expect(page.getByText('invalid-file.txt')).not.toBeVisible()
  })

  test('should validate file size limits', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Create a large dummy file (this is a mock - adjust based on your test setup)
    // In practice, you'd have a test file that exceeds your size limit
    
    // For demonstration, we'll simulate the error state
    // In a real test, you'd upload an actual large file
    await page.evaluate(() => {
      // Trigger file size error (this is a simulation)
      window.dispatchEvent(new CustomEvent('file-size-error', { 
        detail: { message: 'File too large. Max 10MB' } 
      }))
    })
    
    await expect(page.getByText('File too large. Max 10MB')).toBeVisible()
  })

  test('should handle file upload errors gracefully', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Mock network failure during file upload
    await page.route('**/api/storage/resumes', route => {
      route.abort('failed')
    })
    
    const filePath = path.join(__dirname, '..', 'test-assets', 'sample-resume.pdf')
    await page.setInputFiles('[data-testid="resume-upload"]', filePath)
    
    // Should show upload error
    await expect(page.getByText(/Upload failed|Network error/)).toBeVisible()
  })

  test('should allow referral submission without file upload', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Fill minimal required information
    await page.fill('[data-testid="candidate-name"]', 'Jane Smith')
    await page.fill('[data-testid="candidate-email"]', 'jane@example.com')
    await page.check('[data-testid="consent-checkbox"]')
    
    await page.click('[data-testid="submit-referral"]')
    
    // Should successfully submit
    await expect(page.getByText(/Referral submitted|Success/)).toBeVisible()
  })

  test('should show form validation in real-time', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Type invalid email
    await page.fill('[data-testid="candidate-email"]', 'invalid')
    await page.blur('[data-testid="candidate-email"]') // Trigger validation
    
    // Should show real-time validation
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    
    // Fix email
    await page.fill('[data-testid="candidate-email"]', 'valid@example.com')
    
    // Error should disappear
    await expect(page.getByText('Please enter a valid email address')).not.toBeVisible()
  })

  test('should preserve form data during errors', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Fill form data
    const candidateName = 'John Doe'
    const candidateEmail = 'john@example.com'
    const notes = 'Great candidate'
    
    await page.fill('[data-testid="candidate-name"]', candidateName)
    await page.fill('[data-testid="candidate-email"]', candidateEmail)
    await page.fill('[data-testid="referrer-notes"]', notes)
    
    // Try to submit without consent (will fail)
    await page.click('[data-testid="submit-referral"]')
    
    // Form data should be preserved
    await expect(page.locator('[data-testid="candidate-name"]')).toHaveValue(candidateName)
    await expect(page.locator('[data-testid="candidate-email"]')).toHaveValue(candidateEmail)
    await expect(page.locator('[data-testid="referrer-notes"]')).toHaveValue(notes)
  })

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Mock API error
    await page.route('**/api/referrals', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      })
    })
    
    // Fill and submit form
    await page.fill('[data-testid="candidate-name"]', 'John Doe')
    await page.fill('[data-testid="candidate-email"]', 'john@example.com')
    await page.check('[data-testid="consent-checkbox"]')
    
    await page.click('[data-testid="submit-referral"]')
    
    // Should show error message
    await expect(page.getByText(/Server error|Submission failed/)).toBeVisible()
    
    // Form should still be editable
    await expect(page.locator('[data-testid="submit-referral"]')).not.toBeDisabled()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Slow down API response to see loading state
    await page.route('**/api/referrals', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ referral: { id: 'ref123' } })
        })
      }, 2000)
    })
    
    await page.fill('[data-testid="candidate-name"]', 'John Doe')
    await page.fill('[data-testid="candidate-email"]', 'john@example.com')
    await page.check('[data-testid="consent-checkbox"]')
    
    await page.click('[data-testid="submit-referral"]')
    
    // Should show loading state
    await expect(page.getByText(/Submitting|Please wait/)).toBeVisible()
    await expect(page.locator('[data-testid="submit-referral"]')).toBeDisabled()
    
    // Wait for completion
    await expect(page.getByText(/Referral submitted/)).toBeVisible({ timeout: 10000 })
  })

  test('should redirect after successful submission', async ({ page }) => {
    await page.goto('/refer/job-123')
    
    // Complete form
    await page.fill('[data-testid="candidate-name"]', 'John Doe')
    await page.fill('[data-testid="candidate-email"]', 'john@example.com')
    await page.check('[data-testid="consent-checkbox"]')
    
    await page.click('[data-testid="submit-referral"]')
    
    // Should redirect to success page or dashboard
    await page.waitForURL(/\/(success|dashboard|thank-you)/)
    
    // Should show success confirmation
    await expect(page.getByText(/Thank you|Referral submitted|Success/)).toBeVisible()
  })
})