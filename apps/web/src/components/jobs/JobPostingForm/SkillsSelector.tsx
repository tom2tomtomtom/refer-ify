import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Zap } from "lucide-react";
import { useSkillsManagement } from "@/hooks/jobs/useSkillsManagement";
import { JobFormData } from "@/hooks/jobs/useJobFormData";
import { HELP_TEXT, PLACEHOLDERS } from "@/utils/jobs/jobFormConstants";
import { useEffect } from "react";

interface SkillsSelectorProps {
  formData: JobFormData;
  onUpdate: (field: keyof JobFormData, value: unknown) => void;
  errors?: Array<{field: string; message: string}>;
}

/**
 * SkillsSelector - Skills and technologies management component
 * 
 * Provides an interface for adding, removing, and managing skills
 * for job postings. Features skill suggestions, input validation,
 * and visual skill management with badges.
 */
export function SkillsSelector({ 
  formData, 
  onUpdate, 
  errors = [] 
}: SkillsSelectorProps) {
  const {
    skills,
    skillInput,
    setSkillInput,
    handleKeyPress,
    addSkillFromInput,
    removeSkill,
    setSkills,
    getSuggestedSkills,
    validateSkills,
    hasSkills,
    skillsCount
  } = useSkillsManagement(formData.skills);

  // Sync skills with parent form data
  useEffect(() => {
    onUpdate("skills", skills);
  }, [skills, onUpdate]);

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const skillsError = getFieldError("skills");
  const skillValidation = validateSkills();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Skills & Technologies
        </CardTitle>
        <CardDescription>
          Add relevant skills to help with matching ({skillsCount}/20)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skill Input */}
        <div className="flex gap-2">
          <Input
            placeholder={PLACEHOLDERS.skill}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className={skillsError ? "border-red-500" : ""}
          />
          <Button 
            type="button" 
            onClick={addSkillFromInput}
            disabled={!skillInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Skill Suggestions */}
        {getSuggestedSkills(8).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Suggested Skills:
            </Label>
            <div className="flex flex-wrap gap-2">
              {getSuggestedSkills(8).map((skill) => (
                <SkillSuggestionBadge
                  key={skill}
                  skill={skill}
                  onAdd={() => {
                    const updatedSkills = [...skills, skill];
                    setSkills(updatedSkills);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Selected Skills */}
        {hasSkills && (
          <div className="space-y-2">
            <Label>Selected Skills:</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <SelectedSkillBadge
                  key={skill}
                  skill={skill}
                  onRemove={() => removeSkill(skill)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {(skillsError || !skillValidation.isValid) && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
            {skillsError || skillValidation.errors[0]}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          {HELP_TEXT.skills}
        </div>

        {/* Skills Summary */}
        {hasSkills && (
          <div className="bg-muted/50 border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {skillsCount} skill{skillsCount !== 1 ? 's' : ''} selected
              </span>
              {skillsCount > 10 && (
                <span className="text-xs text-orange-600">
                  Consider reducing to top 10 most relevant skills
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SkillSuggestionBadgeProps {
  skill: string;
  onAdd: () => void;
}

function SkillSuggestionBadge({ skill, onAdd }: SkillSuggestionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
      onClick={onAdd}
    >
      <Plus className="h-3 w-3 mr-1" />
      {skill}
    </Badge>
  );
}

interface SelectedSkillBadgeProps {
  skill: string;
  onRemove: () => void;
}

function SelectedSkillBadge({ skill, onRemove }: SelectedSkillBadgeProps) {
  return (
    <Badge 
      variant="default" 
      className="flex items-center gap-1 hover:bg-primary/80 transition-colors"
    >
      {skill}
      <X 
        className="h-3 w-3 cursor-pointer hover:text-red-200" 
        onClick={onRemove} 
      />
    </Badge>
  );
}