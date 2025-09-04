import { renderHook, act } from '@testing-library/react'
import { useJobFormData } from '@/hooks/jobs/useJobFormData'

describe('useJobFormData', () => {
  it('should initialize with default form data', () => {
    const { result } = renderHook(() => useJobFormData())
    
    expect(result.current.formData).toEqual({
      title: "",
      description: "",
      requirements: [{ id: expect.any(String), text: "", required: true }],
      location_type: "remote",
      location_city: "",
      salary_min: 0,
      salary_max: 0,
      currency: "USD",
      skills: [],
      experience_level: "mid",
      job_type: "full_time",
      subscription_tier: "connect"
    })
  })

  it('should initialize with provided initial data', () => {
    const initialData = {
      title: "Senior Developer",
      description: "Great job opportunity"
    }
    
    const { result } = renderHook(() => useJobFormData(initialData))
    
    expect(result.current.formData.title).toBe("Senior Developer")
    expect(result.current.formData.description).toBe("Great job opportunity")
  })

  it('should update fields correctly', () => {
    const { result } = renderHook(() => useJobFormData())
    
    act(() => {
      result.current.updateField('title', 'New Job Title')
    })
    
    expect(result.current.formData.title).toBe('New Job Title')
  })

  it('should update requirements correctly', () => {
    const { result } = renderHook(() => useJobFormData())
    const requirementId = result.current.formData.requirements[0].id
    
    act(() => {
      result.current.updateRequirement(requirementId, 'Updated requirement text', true)
    })
    
    expect(result.current.formData.requirements[0]).toEqual({
      id: requirementId,
      text: 'Updated requirement text', 
      required: true
    })
  })

  it('should add new requirements', () => {
    const { result } = renderHook(() => useJobFormData())
    
    act(() => {
      result.current.addRequirement()
    })
    
    expect(result.current.formData.requirements).toHaveLength(2)
    expect(result.current.formData.requirements[1]).toEqual({
      id: expect.any(String),
      text: "",
      required: false
    })
  })

  it('should remove requirements', () => {
    const { result } = renderHook(() => useJobFormData())
    
    // Add a second requirement first
    act(() => {
      result.current.addRequirement()
    })
    
    const firstRequirementId = result.current.formData.requirements[0].id
    
    act(() => {
      result.current.removeRequirement(firstRequirementId)
    })
    
    expect(result.current.formData.requirements).toHaveLength(1)
    expect(result.current.formData.requirements[0].id).not.toBe(firstRequirementId)
  })

  it('should reset form to initial state', () => {
    const { result } = renderHook(() => useJobFormData())
    
    // Make some changes
    act(() => {
      result.current.updateField('title', 'Test Title')
      result.current.updateField('skills', ['React', 'TypeScript'])
    })
    
    expect(result.current.formData.title).toBe('Test Title')
    expect(result.current.formData.skills).toEqual(['React', 'TypeScript'])
    
    // Reset the form
    act(() => {
      result.current.resetForm()
    })
    
    expect(result.current.formData.title).toBe("")
    expect(result.current.formData.skills).toEqual([])
  })

  it('should handle complex field updates', () => {
    const { result } = renderHook(() => useJobFormData())
    
    act(() => {
      result.current.updateField('salary_min', 50000)
      result.current.updateField('salary_max', 100000)
      result.current.updateField('location_type', 'hybrid')
      result.current.updateField('experience_level', 'senior')
    })
    
    expect(result.current.formData.salary_min).toBe(50000)
    expect(result.current.formData.salary_max).toBe(100000)
    expect(result.current.formData.location_type).toBe('hybrid')
    expect(result.current.formData.experience_level).toBe('senior')
  })
})