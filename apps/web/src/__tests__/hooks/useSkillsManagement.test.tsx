import { renderHook, act } from '@testing-library/react'
import { useSkillsManagement } from '@/hooks/jobs/useSkillsManagement'

describe('useSkillsManagement', () => {
  it('should initialize with empty skills by default', () => {
    const { result } = renderHook(() => useSkillsManagement())
    
    expect(result.current.skills).toEqual([])
    expect(result.current.skillInput).toBe("")
    expect(result.current.hasSkills).toBe(false)
    expect(result.current.skillsCount).toBe(0)
  })

  it('should initialize with provided skills', () => {
    const initialSkills = ['React', 'TypeScript']
    const { result } = renderHook(() => useSkillsManagement(initialSkills))
    
    expect(result.current.skills).toEqual(['React', 'TypeScript'])
    expect(result.current.hasSkills).toBe(true)
    expect(result.current.skillsCount).toBe(2)
  })

  it('should add skills correctly', () => {
    const { result } = renderHook(() => useSkillsManagement())
    
    act(() => {
      const added = result.current.addSkill('React')
      expect(added).toBe(true)
    })
    
    expect(result.current.skills).toEqual(['React'])
    expect(result.current.skillsCount).toBe(1)
  })

  it('should not add empty or duplicate skills', () => {
    const { result } = renderHook(() => useSkillsManagement(['React']))
    
    act(() => {
      const added1 = result.current.addSkill('')
      const added2 = result.current.addSkill('   ')
      const added3 = result.current.addSkill('React') // duplicate
      const added4 = result.current.addSkill('REACT') // case insensitive duplicate
      
      expect(added1).toBe(false)
      expect(added2).toBe(false)
      expect(added3).toBe(false)
      expect(added4).toBe(false)
    })
    
    expect(result.current.skills).toEqual(['React'])
    expect(result.current.skillsCount).toBe(1)
  })

  it('should remove skills correctly', () => {
    const { result } = renderHook(() => useSkillsManagement(['React', 'TypeScript', 'Node.js']))
    
    act(() => {
      result.current.removeSkill('TypeScript')
    })
    
    expect(result.current.skills).toEqual(['React', 'Node.js'])
    expect(result.current.skillsCount).toBe(2)
  })

  it('should manage skill input correctly', () => {
    const { result } = renderHook(() => useSkillsManagement())
    
    act(() => {
      result.current.setSkillInput('React')
    })
    
    expect(result.current.skillInput).toBe('React')
    
    act(() => {
      const added = result.current.addSkillFromInput()
      expect(added).toBe(true)
    })
    
    expect(result.current.skills).toEqual(['React'])
    expect(result.current.skillInput).toBe('') // Should be cleared
  })

  it('should handle keyboard events correctly', () => {
    const { result } = renderHook(() => useSkillsManagement())
    
    act(() => {
      result.current.setSkillInput('TypeScript')
    })
    
    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn()
    } as unknown as React.KeyboardEvent
    
    act(() => {
      result.current.handleKeyPress(mockEvent)
    })
    
    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.skills).toEqual(['TypeScript'])
    expect(result.current.skillInput).toBe('')
  })

  it('should clear all skills', () => {
    const { result } = renderHook(() => useSkillsManagement(['React', 'TypeScript', 'Node.js']))
    
    act(() => {
      result.current.clearAllSkills()
    })
    
    expect(result.current.skills).toEqual([])
    expect(result.current.skillsCount).toBe(0)
    expect(result.current.hasSkills).toBe(false)
  })

  it('should set skills from array', () => {
    const { result } = renderHook(() => useSkillsManagement())
    
    act(() => {
      result.current.setSkills(['Python', 'Django', '', 'Python']) // with empty and duplicate
    })
    
    expect(result.current.skills).toEqual(['Python', 'Django']) // cleaned
    expect(result.current.skillsCount).toBe(2)
  })

  it('should provide filtered suggestions', () => {
    const { result } = renderHook(() => useSkillsManagement(['React']))
    
    act(() => {
      result.current.setSkillInput('Type')
    })
    
    const suggestions = result.current.getFilteredSuggestions()
    expect(suggestions).toContain('TypeScript')
    expect(suggestions).not.toContain('React') // Already selected
    
    const limitedSuggestions = result.current.getSuggestedSkills(3)
    expect(limitedSuggestions.length).toBeLessThanOrEqual(3)
  })

  it('should validate skills correctly', () => {
    const { result } = renderHook(() => useSkillsManagement())
    
    // Test minimum validation
    let validation = result.current.validateSkills(1, 20)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('At least 1 skill required')
    
    // Add skills and test again
    act(() => {
      result.current.setSkills(['React', 'TypeScript'])
    })
    
    validation = result.current.validateSkills(1, 20)
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toEqual([])
    
    // Test maximum validation
    const manySkills = Array.from({ length: 25 }, (_, i) => `Skill${i}`)
    act(() => {
      result.current.setSkills(manySkills)
    })
    
    validation = result.current.validateSkills(1, 20)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('Maximum 20 skills allowed')
  })

  it('should handle edge cases in skill input', () => {
    const { result } = renderHook(() => useSkillsManagement())
    
    act(() => {
      result.current.setSkillInput('  React  ') // with whitespace
    })
    
    act(() => {
      const added = result.current.addSkillFromInput()
      expect(added).toBe(true)
    })
    
    expect(result.current.skills).toEqual(['React']) // trimmed
    
    // Test non-Enter key event
    const mockEvent = {
      key: 'Tab',
      preventDefault: jest.fn()
    } as unknown as React.KeyboardEvent
    
    act(() => {
      result.current.setSkillInput('TypeScript')
      result.current.handleKeyPress(mockEvent)
    })
    
    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    expect(result.current.skills).toEqual(['React']) // No change
    expect(result.current.skillInput).toBe('TypeScript') // Not cleared
  })
})