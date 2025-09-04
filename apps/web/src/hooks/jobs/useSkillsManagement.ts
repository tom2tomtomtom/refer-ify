import { useState, useCallback } from 'react';

export const SKILLS_SUGGESTIONS = [
  "React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "Kubernetes",
  "Product Management", "Sales", "Marketing", "Design", "Data Science", "DevOps",
  "Java", "Go", "Rust", "GraphQL", "MongoDB", "PostgreSQL", "Redis",
  "Machine Learning", "AI", "Blockchain", "Mobile Development", "iOS", "Android",
  "Vue.js", "Angular", "Svelte", "Next.js", "Express", "Fastify", "Nest.js",
  "Leadership", "Strategy", "Analytics", "Business Development", "Operations"
];

/**
 * Custom hook for managing skills in job forms
 * 
 * Provides functionality for adding, removing, and suggesting skills
 * with validation and filtering capabilities. Maintains skills state
 * and provides helper functions for skills management.
 * 
 * @param initialSkills - Array of initial skills
 * @returns Object with skills state and management functions
 */
export function useSkillsManagement(initialSkills: string[] = []) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = useCallback((skill: string) => {
    const trimmedSkill = skill.trim();
    
    if (!trimmedSkill) return false;
    
    // Check if skill already exists (case insensitive)
    if (skills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
      return false;
    }

    setSkills(prev => [...prev, trimmedSkill]);
    setSkillInput("");
    return true;
  }, [skills]);

  const removeSkill = useCallback((skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  }, []);

  const addSkillFromInput = useCallback(() => {
    return addSkill(skillInput);
  }, [skillInput, addSkill]);

  const handleSkillInputChange = useCallback((value: string) => {
    setSkillInput(value);
  }, []);

  const handleSkillInputKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkillFromInput();
    }
  }, [addSkillFromInput]);

  const clearAllSkills = useCallback(() => {
    setSkills([]);
  }, []);

  const setSkillsFromArray = useCallback((newSkills: string[]) => {
    // Remove duplicates and empty strings
    const cleanSkills = Array.from(new Set(
      newSkills.filter(skill => skill.trim())
    ));
    setSkills(cleanSkills);
  }, []);

  // Filter suggestions based on current skills and input
  const getFilteredSuggestions = useCallback(() => {
    const inputLower = skillInput.toLowerCase();
    
    return SKILLS_SUGGESTIONS.filter(suggestion => {
      // Don't suggest skills that are already added
      if (skills.some(s => s.toLowerCase() === suggestion.toLowerCase())) {
        return false;
      }
      
      // If there's input, filter by input
      if (inputLower) {
        return suggestion.toLowerCase().includes(inputLower);
      }
      
      return true;
    });
  }, [skills, skillInput]);

  const getSuggestedSkills = useCallback((limit = 10) => {
    return getFilteredSuggestions().slice(0, limit);
  }, [getFilteredSuggestions]);

  // Validate skills (e.g., check for minimum/maximum count)
  const validateSkills = useCallback((minSkills = 1, maxSkills = 20) => {
    const errors: string[] = [];
    
    if (skills.length < minSkills) {
      errors.push(`At least ${minSkills} skill${minSkills > 1 ? 's' : ''} required`);
    }
    
    if (skills.length > maxSkills) {
      errors.push(`Maximum ${maxSkills} skills allowed`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [skills]);

  return {
    // State
    skills,
    skillInput,
    
    // Input management
    setSkillInput: handleSkillInputChange,
    handleKeyPress: handleSkillInputKeyPress,
    
    // Skills management
    addSkill,
    addSkillFromInput,
    removeSkill,
    clearAllSkills,
    setSkills: setSkillsFromArray,
    
    // Suggestions and validation
    getSuggestedSkills,
    getFilteredSuggestions,
    validateSkills,
    
    // Computed values
    hasSkills: skills.length > 0,
    skillsCount: skills.length
  };
}