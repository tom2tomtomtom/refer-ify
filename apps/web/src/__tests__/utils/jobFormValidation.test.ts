import { 
  validateJobForm, 
  validateField, 
  canSaveAsDraft, 
  canPublish 
} from '@/utils/jobs/jobFormValidation'
import { JobFormData } from '@/hooks/jobs/useJobFormData'

const mockValidJobData: JobFormData = {
  title: "Senior Developer",
  description: "Great job opportunity for a senior developer with extensive experience in modern web technologies and frameworks",
  requirements: [
    { id: "1", text: "5+ years React experience", required: true },
    { id: "2", text: "TypeScript proficiency", required: false }
  ],
  location_type: "hybrid",
  location_city: "New York, NY",
  salary_min: 80000,
  salary_max: 120000,
  currency: "USD",
  skills: ["React", "TypeScript", "Node.js"],
  experience_level: "senior",
  job_type: "full_time",
  subscription_tier: "priority"
}

describe('jobFormValidation', () => {
  describe('validateJobForm', () => {
    it('should validate a complete valid form', () => {
      const result = validateJobForm(mockValidJobData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should catch missing required fields', () => {
      const invalidData = { ...mockValidJobData, title: "", description: "" }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'title', message: 'Job title is required' },
          { field: 'description', message: 'Job description is required' }
        ])
      )
    })

    it('should validate salary ranges', () => {
      const invalidData = { 
        ...mockValidJobData, 
        salary_min: 150000, 
        salary_max: 100000 
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'salary', message: 'Minimum salary must be less than maximum salary' }
        ])
      )
    })

    it('should validate negative salaries', () => {
      const invalidData = { 
        ...mockValidJobData, 
        salary_min: -1000, 
        salary_max: -500
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'salary_min', message: 'Minimum salary cannot be negative' },
          { field: 'salary_max', message: 'Maximum salary cannot be negative' }
        ])
      )
    })

    it('should validate excessively high salary', () => {
      const invalidData = { 
        ...mockValidJobData, 
        salary_max: 2000000
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'salary_max', message: 'Maximum salary seems unusually high' }
        ])
      )
    })

    it('should validate requirements', () => {
      const invalidData = { 
        ...mockValidJobData, 
        requirements: []
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'requirements', message: 'At least one job requirement is needed' }
        ])
      )
    })

    it('should validate requirement length', () => {
      const longRequirement = 'x'.repeat(600)
      const invalidData = { 
        ...mockValidJobData, 
        requirements: [
          { id: "1", text: longRequirement, required: true }
        ]
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'requirement_0', message: 'Individual requirements should be 500 characters or less' }
        ])
      )
    })

    it('should validate skills', () => {
      const invalidData = { 
        ...mockValidJobData, 
        skills: []
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'skills', message: 'At least one skill should be specified' }
        ])
      )
    })

    it('should validate too many skills', () => {
      const tooManySkills = Array.from({ length: 25 }, (_, i) => `Skill${i}`)
      const invalidData = { 
        ...mockValidJobData, 
        skills: tooManySkills
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'skills', message: 'Maximum 20 skills allowed' }
        ])
      )
    })

    it('should validate duplicate skills', () => {
      const invalidData = { 
        ...mockValidJobData, 
        skills: ['React', 'TypeScript', 'react'] // case insensitive duplicate
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'skills', message: 'Duplicate skills found' }
        ])
      )
    })

    it('should validate location requirements', () => {
      const invalidData = { 
        ...mockValidJobData, 
        location_type: "onsite",
        location_city: ""
      }
      const result = validateJobForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'location_city', message: 'Location is required for on-site and hybrid positions' }
        ])
      )
    })

    it('should allow empty location for remote jobs', () => {
      const validData = { 
        ...mockValidJobData, 
        location_type: "remote",
        location_city: ""
      }
      const result = validateJobForm(validData)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateField', () => {
    it('should validate individual title field', () => {
      const mockFormData = mockValidJobData
      
      expect(validateField('title', '', mockFormData)).toEqual({
        field: 'title',
        message: 'Job title is required'
      })
      
      expect(validateField('title', 'x'.repeat(150), mockFormData)).toEqual({
        field: 'title',
        message: 'Job title must be 100 characters or less'
      })
      
      expect(validateField('title', 'Valid Title', mockFormData)).toBeNull()
    })

    it('should validate individual description field', () => {
      const mockFormData = mockValidJobData
      
      expect(validateField('description', '', mockFormData)).toEqual({
        field: 'description',
        message: 'Job description is required'
      })
      
      expect(validateField('description', 'Short', mockFormData)).toEqual({
        field: 'description',
        message: 'Job description should be at least 50 characters'
      })
      
      const validDescription = 'This is a valid job description that meets the minimum length requirements'
      expect(validateField('description', validDescription, mockFormData)).toBeNull()
    })

    it('should validate salary fields', () => {
      const mockFormData = { ...mockValidJobData, salary_max: 100000 }
      
      expect(validateField('salary_min', -1000, mockFormData)).toEqual({
        field: 'salary_min',
        message: 'Minimum salary cannot be negative'
      })
      
      expect(validateField('salary_min', 150000, mockFormData)).toEqual({
        field: 'salary_min',
        message: 'Minimum salary must be less than maximum salary'
      })
      
      expect(validateField('salary_max', 2000000, mockFormData)).toEqual({
        field: 'salary_max',
        message: 'Maximum salary seems unusually high'
      })
      
      expect(validateField('salary_min', 80000, mockFormData)).toBeNull()
    })

    it('should validate location field', () => {
      const onsiteFormData = { ...mockValidJobData, location_type: "onsite" }
      const remoteFormData = { ...mockValidJobData, location_type: "remote" }
      
      expect(validateField('location_city', '', onsiteFormData)).toEqual({
        field: 'location_city',
        message: 'Location is required for on-site and hybrid positions'
      })
      
      expect(validateField('location_city', '', remoteFormData)).toBeNull()
      expect(validateField('location_city', 'New York', onsiteFormData)).toBeNull()
    })

    it('should handle unknown fields gracefully', () => {
      expect(validateField('unknown_field' as any, 'value', mockValidJobData)).toBeNull()
    })

    it('should handle non-string and non-number values', () => {
      expect(validateField('title', null, mockValidJobData)).toEqual({
        field: 'title',
        message: 'Job title is required'
      })
      
      expect(validateField('salary_min', 'not_a_number', mockValidJobData)).toBeNull()
    })
  })

  describe('canSaveAsDraft', () => {
    it('should allow draft with title and description', () => {
      const draftData = {
        ...mockValidJobData,
        skills: [], // Missing skills should be ok for draft
        requirements: [] // Missing requirements should be ok for draft
      }
      
      expect(canSaveAsDraft(draftData)).toBe(true)
    })

    it('should not allow draft without title', () => {
      const draftData = { ...mockValidJobData, title: "" }
      expect(canSaveAsDraft(draftData)).toBe(false)
    })

    it('should not allow draft without description', () => {
      const draftData = { ...mockValidJobData, description: "" }
      expect(canSaveAsDraft(draftData)).toBe(false)
    })

    it('should not allow draft with empty title/description', () => {
      const draftData = { ...mockValidJobData, title: "   ", description: "   " }
      expect(canSaveAsDraft(draftData)).toBe(false)
    })
  })

  describe('canPublish', () => {
    it('should allow publishing valid form', () => {
      expect(canPublish(mockValidJobData)).toBe(true)
    })

    it('should not allow publishing invalid form', () => {
      const invalidData = { ...mockValidJobData, title: "", skills: [] }
      expect(canPublish(invalidData)).toBe(false)
    })
  })
})