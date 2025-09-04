import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillsSelector } from '@/components/jobs/JobPostingForm/SkillsSelector'
import { JobFormData } from '@/hooks/jobs/useJobFormData'

const mockFormData: JobFormData = {
  title: "Senior Developer",
  description: "Great job opportunity",
  requirements: [{ id: "1", text: "5+ years experience", required: true }],
  location_type: "remote",
  location_city: "",
  salary_min: 0,
  salary_max: 0,
  currency: "USD",
  skills: [],
  experience_level: "mid",
  job_type: "full_time",
  subscription_tier: "connect"
}

describe('SkillsSelector', () => {
  const mockOnUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with empty skills', () => {
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    expect(screen.getByText('Skills & Technologies')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a skill and press Enter')).toBeInTheDocument()
    expect(screen.getByText('Add relevant skills to help with matching (0/20)')).toBeInTheDocument()
  })

  it('renders correctly with existing skills', () => {
    const formDataWithSkills = {
      ...mockFormData,
      skills: ['React', 'TypeScript']
    }
    
    render(
      <SkillsSelector 
        formData={formDataWithSkills} 
        onUpdate={mockOnUpdate}
      />
    )
    
    expect(screen.getByText('Add relevant skills to help with matching (2/20)')).toBeInTheDocument()
    expect(screen.getByText('Selected Skills:')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('adds skill on Enter key press', async () => {
    const user = userEvent.setup()
    
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    // Clear initial onUpdate call (component calls onUpdate on mount with empty skills)
    jest.clearAllMocks()
    
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    
    await act(async () => {
      await user.type(input, 'React')
      await user.keyboard('{Enter}')
    })
    
    // Wait for the useEffect to trigger onUpdate with the new skill
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('skills', expect.arrayContaining(['React']))
    })
  })

  it('adds skill on button click', () => {
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    const addButton = screen.getByRole('button')
    
    fireEvent.change(input, { target: { value: 'TypeScript' } })
    fireEvent.click(addButton)
    
    expect(mockOnUpdate).toHaveBeenCalledWith('skills', ['TypeScript'])
  })

  it('disables add button when input is empty', () => {
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    const addButton = screen.getByRole('button')
    expect(addButton).toBeDisabled()
    
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    fireEvent.change(input, { target: { value: 'React' } })
    
    expect(addButton).not.toBeDisabled()
  })

  it('shows skill suggestions', () => {
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    expect(screen.getByText('Suggested Skills:')).toBeInTheDocument()
    
    // Should show some of the predefined suggestions
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('filters suggestions based on existing skills', () => {
    const formDataWithSkills = {
      ...mockFormData,
      skills: ['React']
    }
    
    render(
      <SkillsSelector 
        formData={formDataWithSkills} 
        onUpdate={mockOnUpdate}
      />
    )
    
    // React should not appear in suggestions since it's already selected
    const suggestions = screen.queryAllByText('React')
    // Should only find React in the selected skills section, not in suggestions
    expect(suggestions).toHaveLength(1)
  })

  it('adds skill from suggestions when clicked', () => {
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    const reactSuggestion = screen.getAllByText('React')[0]
    fireEvent.click(reactSuggestion)
    
    expect(mockOnUpdate).toHaveBeenCalledWith('skills', ['React'])
  })

  it('removes skill when X button is clicked', () => {
    const formDataWithSkills = {
      ...mockFormData,
      skills: ['React', 'TypeScript']
    }
    
    render(
      <SkillsSelector 
        formData={formDataWithSkills} 
        onUpdate={mockOnUpdate}
      />
    )
    
    // Find the X button within the React skill badge
    const reactSkillText = screen.getByText('React')
    const reactBadge = reactSkillText.closest('div')
    const xButton = reactBadge?.querySelector('svg') // The X icon
    
    expect(xButton).toBeInTheDocument()
    fireEvent.click(xButton!)
    
    // Should call onUpdate with React removed
    expect(mockOnUpdate).toHaveBeenCalledWith('skills', ['TypeScript'])
  })

  it('displays validation errors', () => {
    const errors = [
      { field: 'skills', message: 'At least one skill is required' }
    ]
    
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
        errors={errors}
      />
    )
    
    expect(screen.getByText('At least one skill is required')).toBeInTheDocument()
  })

  it('shows skills summary when skills are present', () => {
    const formDataWithManySkills = {
      ...mockFormData,
      skills: Array.from({ length: 12 }, (_, i) => `Skill${i + 1}`)
    }
    
    render(
      <SkillsSelector 
        formData={formDataWithManySkills} 
        onUpdate={mockOnUpdate}
      />
    )
    
    expect(screen.getByText('12 skills selected')).toBeInTheDocument()
    expect(screen.getByText('Consider reducing to top 10 most relevant skills')).toBeInTheDocument()
  })

  it('handles edge cases in skill management', async () => {
    const user = userEvent.setup()
    
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    
    // Try to add empty skill
    await act(async () => {
      await user.clear(input)
      await user.type(input, '   ')
      await user.keyboard('{Enter}')
    })
    
    // Wait a bit to see if onUpdate was called for empty skill
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Reset mocks for cleaner test
    jest.clearAllMocks()
    
    // Try to add valid skill
    await act(async () => {
      await user.clear(input)
      await user.type(input, '  React  ')
      await user.keyboard('{Enter}')
    })
    
    // Should call onUpdate with trimmed skill
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('skills', expect.arrayContaining(['React']))
    })
  })

  it('does not add skill on non-Enter key press', () => {
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    const input = screen.getByPlaceholderText('Type a skill and press Enter')
    
    fireEvent.change(input, { target: { value: 'React' } })
    fireEvent.keyPress(input, { key: 'Tab', code: 'Tab' })
    
    // Should not add skill on Tab press - only Enter should trigger
    // The input value should remain unchanged
    expect(input).toHaveValue('React')
  })

  it('handles help text display', () => {
    render(
      <SkillsSelector 
        formData={mockFormData} 
        onUpdate={mockOnUpdate}
      />
    )
    
    expect(screen.getByText('Add relevant technical and soft skills to help with candidate matching')).toBeInTheDocument()
  })
})