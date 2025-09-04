import { faker } from '@faker-js/faker';
import type { Database } from '@/lib/supabase/database.types';

export interface TestUser {
  email: string;
  password: string;
  role: 'client' | 'candidate' | 'founding_circle' | 'select_circle';
  profile: {
    firstName: string;
    lastName: string;
    company?: string;
    title?: string;
    phone?: string;
    linkedin?: string;
  };
}

export interface TestJob {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary_min: number;
  salary_max: number;
  subscription_tier: 'connect' | 'priority' | 'exclusive';
}

export interface TestCandidate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  experience: number;
  skills: string[];
  education: string;
  linkedin: string;
  resume?: {
    content: string;
    filename: string;
  };
}

export class TestDataGenerator {
  // Generate test users for different roles
  static generateUsers(count: number = 100): TestUser[] {
    const users: TestUser[] = [];
    
    // Generate specific role distributions
    const roleDistribution = {
      client: 15,
      candidate: 60,
      founding_circle: 5,
      select_circle: 20
    };

    for (const [role, roleCount] of Object.entries(roleDistribution)) {
      for (let i = 0; i < roleCount; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        
        users.push({
          email,
          password: 'TestPass123!',
          role: role as TestUser['role'],
          profile: {
            firstName,
            lastName,
            company: role === 'client' || role === 'founding_circle' ? faker.company.name() : undefined,
            title: this.generateTitleByRole(role as TestUser['role']),
            phone: faker.phone.number(),
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${faker.string.alphanumeric(6)}`
          }
        });
      }
    }

    return users;
  }

  // Generate realistic job postings
  static generateJobs(count: number = 100): TestJob[] {
    const jobs: TestJob[] = [];
    const jobTitles = [
      'Senior Software Engineer', 'Product Manager', 'VP of Engineering', 'CTO',
      'Head of Sales', 'Marketing Director', 'Data Scientist', 'UX Designer',
      'Chief Financial Officer', 'Head of Operations', 'Business Development Director',
      'Senior Consultant', 'Principal Architect', 'Head of Customer Success'
    ];

    const industries = [
      'Technology', 'Finance', 'Healthcare', 'Consulting', 'E-commerce',
      'Media', 'Education', 'Real Estate', 'Manufacturing', 'Energy'
    ];

    for (let i = 0; i < count; i++) {
      const title = faker.helpers.arrayElement(jobTitles);
      const industry = faker.helpers.arrayElement(industries);
      const company = faker.company.name();
      const baseSalary = faker.number.int({ min: 80000, max: 400000 });

      jobs.push({
        title,
        company: `${company} (${industry})`,
        location: faker.helpers.arrayElement([
          'Singapore', 'Hong Kong', 'Sydney', 'Melbourne', 'Tokyo',
          'London', 'Frankfurt', 'Dubai', 'Mumbai', 'Bangkok'
        ]),
        description: this.generateJobDescription(title, company, industry),
        requirements: this.generateJobRequirements(title),
        salary_min: baseSalary,
        salary_max: Math.round(baseSalary * 1.3),
        subscription_tier: faker.helpers.arrayElement(['connect', 'priority', 'exclusive'])
      });
    }

    return jobs;
  }

  // Generate candidate profiles
  static generateCandidates(count: number = 200): TestCandidate[] {
    const candidates: TestCandidate[] = [];
    
    const seniorTitles = [
      'Senior Software Engineer', 'Principal Engineer', 'Engineering Manager',
      'Senior Product Manager', 'Director of Engineering', 'VP Technology',
      'Senior Consultant', 'Partner', 'Managing Director', 'Head of Sales',
      'Senior Marketing Manager', 'Data Science Manager', 'UX Design Lead'
    ];

    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Goldman Sachs',
      'McKinsey & Company', 'BCG', 'Bain & Company', 'JPMorgan Chase',
      'Morgan Stanley', 'Deloitte', 'PwC', 'EY', 'KPMG', 'Accenture'
    ];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const title = faker.helpers.arrayElement(seniorTitles);
      const experience = faker.number.int({ min: 5, max: 20 });

      candidates.push({
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number(),
        title,
        company: faker.helpers.arrayElement(companies),
        experience,
        skills: this.generateSkillsByTitle(title),
        education: faker.helpers.arrayElement([
          'MBA from Harvard Business School',
          'MS Computer Science from Stanford',
          'Bachelor of Engineering from NTU',
          'Master of Finance from London Business School',
          'PhD in Data Science from MIT',
          'Bachelor of Commerce from University of Melbourne'
        ]),
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${faker.string.alphanumeric(6)}`,
        resume: {
          content: this.generateResumeContent(firstName, lastName, title, experience),
          filename: `${firstName}_${lastName}_Resume.pdf`
        }
      });
    }

    return candidates;
  }

  // Generate test scenarios for user journeys
  static generateTestScenarios() {
    return {
      // Complete client journey scenarios
      clientJourneys: [
        {
          name: 'First-time client onboarding',
          steps: [
            'Register with company email',
            'Complete profile setup',
            'Choose Connect tier subscription',
            'Process payment',
            'Post first job',
            'Review AI-suggested candidates',
            'Request referrals from network',
            'Schedule interviews',
            'Make hiring decision',
            'Process referrer payments'
          ]
        },
        {
          name: 'Enterprise client workflow',
          steps: [
            'Register enterprise account',
            'Upgrade to Exclusive tier',
            'Post multiple senior roles',
            'Access premium candidate pool',
            'Use AI matching for bulk screening',
            'Manage multiple job pipelines',
            'Generate hiring analytics',
            'Export candidate reports'
          ]
        }
      ],

      // Referrer success paths
      referrerJourneys: [
        {
          name: 'New referrer onboarding',
          steps: [
            'Register as select circle member',
            'Complete professional profile',
            'Browse available opportunities',
            'Submit first qualified referral',
            'Track referral progress',
            'Receive commission notification',
            'Build referral network',
            'Access premium job board'
          ]
        },
        {
          name: 'High-volume referrer workflow',
          steps: [
            'Access founding circle dashboard',
            'Review revenue analytics',
            'Manage referral pipeline',
            'Use AI for candidate matching',
            'Submit bulk referrals',
            'Track conversion rates',
            'Optimize referral strategy',
            'Export earnings reports'
          ]
        }
      ],

      // Candidate application flows
      candidateJourneys: [
        {
          name: 'Executive job search',
          steps: [
            'Create candidate profile',
            'Upload executive resume',
            'Browse premium opportunities',
            'Apply to relevant positions',
            'Track application status',
            'Schedule interviews',
            'Negotiate offer terms',
            'Complete hiring process'
          ]
        }
      ],

      // Cross-role collaboration scenarios
      collaborationScenarios: [
        {
          name: 'Multi-party job fulfillment',
          actors: ['client', 'referrer', 'candidate'],
          steps: [
            'Client posts high-priority role',
            'AI suggests qualified candidates',
            'Multiple referrers submit candidates',
            'Client reviews and shortlists',
            'Interview coordination',
            'Reference checks',
            'Final hiring decision',
            'Payment distribution to referrers',
            'Success story documentation'
          ]
        }
      ]
    };
  }

  // Helper methods
  private static generateTitleByRole(role: string): string {
    const titlesByRole = {
      client: ['VP Engineering', 'Head of Talent', 'CEO', 'Founder', 'CHRO'],
      candidate: ['Senior Engineer', 'Principal Consultant', 'Director', 'VP'],
      founding_circle: ['Managing Partner', 'Executive Chairman', 'Board Member'],
      select_circle: ['Senior Director', 'Principal', 'VP', 'Head of Department']
    };

    return faker.helpers.arrayElement(titlesByRole[role] || ['Professional']);
  }

  private static generateJobDescription(title: string, company: string, industry: string): string {
    return `${company} is seeking an exceptional ${title} to join our ${industry} team.

Key Responsibilities:
• Lead strategic initiatives and drive business growth
• Manage cross-functional teams and stakeholder relationships
• Develop and execute comprehensive business strategies
• Ensure operational excellence and performance optimization

Requirements:
• 10+ years of relevant industry experience
• Proven track record of leadership and results
• Strong analytical and strategic thinking abilities
• Excellent communication and presentation skills

We offer competitive compensation, equity participation, and the opportunity to shape the future of our organization in the dynamic ${industry} sector.`;
  }

  private static generateJobRequirements(title: string): string[] {
    const commonRequirements = [
      '10+ years of relevant experience',
      'Bachelor\'s degree or equivalent',
      'Strong leadership and communication skills',
      'Strategic thinking and analytical abilities',
      'Experience in high-growth environments'
    ];

    const technicalRequirements = {
      'Senior Software Engineer': ['JavaScript/TypeScript', 'React/Next.js', 'Node.js', 'AWS/Azure'],
      'Product Manager': ['Product strategy', 'User research', 'Analytics', 'Agile methodologies'],
      'VP of Engineering': ['Team leadership', 'Technical strategy', 'Architecture design', 'Scaling systems'],
      'CTO': ['Technology vision', 'Executive leadership', 'Digital transformation', 'Innovation strategy']
    };

    return [
      ...commonRequirements,
      ...(technicalRequirements[title] || ['Domain expertise', 'Industry knowledge'])
    ];
  }

  private static generateSkillsByTitle(title: string): string[] {
    const skillsByTitle = {
      'Senior Software Engineer': ['JavaScript', 'Python', 'React', 'AWS', 'Docker', 'Kubernetes'],
      'Product Manager': ['Product Strategy', 'User Research', 'Analytics', 'Roadmapping', 'A/B Testing'],
      'Engineering Manager': ['Team Leadership', 'Technical Strategy', 'Agile', 'Performance Management'],
      'Data Scientist': ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL', 'Tableau'],
      'UX Designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing']
    };

    return skillsByTitle[title] || ['Leadership', 'Strategy', 'Communication', 'Analysis'];
  }

  private static generateResumeContent(firstName: string, lastName: string, title: string, experience: number): string {
    return `${firstName} ${lastName}
${title}

PROFESSIONAL SUMMARY
Accomplished ${title} with ${experience} years of experience driving business growth and operational excellence in competitive markets. Proven track record of leading high-performing teams, implementing strategic initiatives, and delivering measurable results.

EXPERIENCE
${title} | Current Company | 2020 - Present
• Led strategic initiatives resulting in 40% revenue growth
• Managed cross-functional teams of 15+ professionals
• Implemented operational improvements increasing efficiency by 30%
• Developed and executed comprehensive business strategies

Senior Professional | Previous Company | 2015 - 2020
• Drove key business initiatives and strategic projects
• Collaborated with executive leadership on company direction
• Mentored junior team members and built high-performing teams
• Achieved consistent performance targets and KPIs

EDUCATION
Master of Business Administration
Bachelor of Science in relevant field

CERTIFICATIONS
• Industry-relevant professional certifications
• Leadership and management training
• Strategic planning and execution programs`;
  }
}

// Export test data sets for easy import
export const TEST_DATA = {
  users: TestDataGenerator.generateUsers(),
  jobs: TestDataGenerator.generateJobs(),
  candidates: TestDataGenerator.generateCandidates(),
  scenarios: TestDataGenerator.generateTestScenarios()
};