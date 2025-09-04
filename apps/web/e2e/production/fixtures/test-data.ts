export const testData = {
  // Test user data for different roles
  users: {
    client: {
      email: 'test-client@example.com',
      password: 'TestPassword123!',
      name: 'Test Client User',
      company: 'Test Company Inc.'
    },
    candidate: {
      email: 'test-candidate@example.com', 
      password: 'TestPassword123!',
      name: 'Test Candidate User',
      skills: ['React', 'TypeScript', 'Node.js']
    },
    foundingCircle: {
      email: 'test-founding@example.com',
      password: 'TestPassword123!',
      name: 'Test Founding Member'
    },
    selectCircle: {
      email: 'test-select@example.com',
      password: 'TestPassword123!',
      name: 'Test Select Member'
    }
  },

  // Job posting data
  jobPosting: {
    valid: {
      title: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $160,000',
      description: 'We are looking for a senior software engineer with experience in React, Node.js, and cloud technologies.',
      requirements: [
        '5+ years of software engineering experience',
        'Strong proficiency in React and TypeScript',
        'Experience with cloud platforms (AWS/GCP/Azure)',
        'Excellent communication skills'
      ],
      benefits: [
        'Competitive salary and equity',
        'Health, dental, and vision insurance',
        'Flexible work arrangements',
        'Professional development budget'
      ]
    },
    invalid: {
      title: '', // Empty title should trigger validation
      company: '',
      location: '',
      salary: 'Invalid salary format',
      description: 'Short', // Too short description
    }
  },

  // Referral data
  referral: {
    valid: {
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      candidatePhone: '+1-555-0123',
      candidateLinkedIn: 'https://linkedin.com/in/johndoe',
      candidateResume: 'path/to/resume.pdf',
      relationship: 'Former colleague',
      recommendation: 'John is an excellent developer with strong technical skills and great team collaboration abilities. I worked with him for 2 years and he consistently delivered high-quality code.',
      whyGoodFit: 'His experience with React and TypeScript aligns perfectly with the job requirements, and his problem-solving skills would be valuable to the team.'
    },
    invalid: {
      candidateName: '',
      candidateEmail: 'invalid-email',
      candidatePhone: '123', // Invalid phone format
      candidateLinkedIn: 'not-a-url',
      relationship: '',
      recommendation: 'Too short', // Too brief recommendation
      whyGoodFit: ''
    }
  },

  // Payment test data (for testing up to checkout)
  payment: {
    testCard: {
      cardNumber: '4242424242424242', // Stripe test card
      expiryMonth: '12',
      expiryYear: '2025',
      cvc: '123',
      name: 'Test User',
      zipCode: '94102'
    },
    invalidCard: {
      cardNumber: '1234567890123456', // Invalid card number
      expiryMonth: '13', // Invalid month
      expiryYear: '2020', // Past year
      cvc: '12', // Too short CVC
      name: '',
      zipCode: 'ABC' // Invalid zip format
    }
  },

  // Form validation test cases
  formValidation: {
    email: {
      valid: ['test@example.com', 'user.name@domain.co.uk', 'test+tag@example.org'],
      invalid: ['invalid-email', '@example.com', 'test@', 'test..double.dot@example.com']
    },
    password: {
      valid: ['Password123!', 'SecurePass1@', 'MyStr0ngP@ssw0rd'],
      invalid: ['short', 'alllowercase', 'ALLUPPERCASE', '12345678', 'NoNumbers!']
    },
    phone: {
      valid: ['+1-555-0123', '(555) 012-3456', '555.012.3456', '+44 20 7946 0958'],
      invalid: ['123', 'abc-def-ghij', '555-12-34', '+1-555-012-34567']
    },
    url: {
      valid: ['https://example.com', 'http://test.org', 'https://subdomain.example.co.uk/path'],
      invalid: ['not-a-url', 'ftp://example.com', 'https://', 'example.com']
    }
  },

  // Expected error messages
  errorMessages: {
    required: ['required', 'This field is required', 'Please fill out this field'],
    invalidEmail: ['valid email', 'email format', 'Invalid email'],
    invalidPassword: ['password requirements', 'too weak', 'must contain'],
    invalidPhone: ['valid phone', 'phone format', 'Invalid phone'],
    invalidUrl: ['valid URL', 'URL format', 'Invalid URL']
  },

  // Performance thresholds
  performance: {
    maxLoadTime: 5000, // 5 seconds
    maxFirstContentfulPaint: 2000, // 2 seconds  
    maxDomContentLoaded: 3000 // 3 seconds
  },

  // Mobile viewports for testing
  viewports: {
    mobile: { width: 375, height: 667 }, // iPhone SE
    tablet: { width: 768, height: 1024 }, // iPad
    desktop: { width: 1280, height: 720 }, // Standard desktop
    largeDesktop: { width: 1920, height: 1080 } // Large desktop
  },

  // URLs to test
  urls: {
    homepage: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    jobs: '/jobs',
    referrals: '/referrals',
    profile: '/profile',
    settings: '/settings',
    pricing: '/pricing',
    about: '/about',
    contact: '/contact',
    privacy: '/privacy',
    terms: '/terms'
  },

  // Expected page titles and headings
  pageContent: {
    homepage: {
      title: /Refer-ify|Home/,
      heading: /Welcome|Refer-ify/,
      description: /referral|platform|jobs/i
    },
    login: {
      title: /Login|Sign In/,
      heading: /Login|Sign In/,
      submitButton: /Login|Sign In/
    },
    register: {
      title: /Register|Sign Up/,
      heading: /Register|Sign Up|Create Account/,
      submitButton: /Register|Sign Up|Create/
    },
    dashboard: {
      title: /Dashboard/,
      heading: /Dashboard|Welcome/
    }
  }
};