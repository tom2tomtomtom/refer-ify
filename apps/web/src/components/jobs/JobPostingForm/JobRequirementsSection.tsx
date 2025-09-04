import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, CheckCircle } from "lucide-react";
import { JobFormData, JobRequirement } from "@/hooks/jobs/useJobFormData";
import { PLACEHOLDERS, HELP_TEXT } from "@/utils/jobs/jobFormConstants";

interface JobRequirementsSectionProps {
  formData: JobFormData;
  onUpdateRequirement: (id: string, text: string, required?: boolean) => void;
  onAddRequirement: () => void;
  onRemoveRequirement: (id: string) => void;
  errors?: Array<{field: string; message: string}>;
}

/**
 * JobRequirementsSection - Job requirements and qualifications form section
 * 
 * Handles the management of job requirements with the ability to mark
 * requirements as essential vs. nice-to-have and add/remove requirements.
 */
export function JobRequirementsSection({
  formData,
  onUpdateRequirement,
  onAddRequirement,
  onRemoveRequirement,
  errors = []
}: JobRequirementsSectionProps) {
  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const requirementsError = getFieldError("requirements");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Job Requirements
        </CardTitle>
        <CardDescription>
          Add specific requirements and qualifications for this position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {formData.requirements.map((requirement, index) => (
            <RequirementInput
              key={requirement.id}
              requirement={requirement}
              index={index}
              onUpdate={onUpdateRequirement}
              onRemove={onRemoveRequirement}
              canRemove={formData.requirements.length > 1}
              errors={errors}
            />
          ))}
        </div>

        <Button 
          type="button" 
          variant="outline" 
          onClick={onAddRequirement}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>

        {requirementsError && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
            {requirementsError}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {HELP_TEXT.requirements}
        </div>
      </CardContent>
    </Card>
  );
}

interface RequirementInputProps {
  requirement: JobRequirement;
  index: number;
  onUpdate: (id: string, text: string, required?: boolean) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  errors: Array<{field: string; message: string}>;
}

function RequirementInput({
  requirement,
  index,
  onUpdate,
  onRemove,
  canRemove,
  errors
}: RequirementInputProps) {
  const fieldError = errors.find(error => error.field === `requirement_${index}`)?.message;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-start">
        <div className="flex items-center space-x-2 mt-2 min-w-[100px]">
          <Checkbox
            checked={requirement.required}
            onCheckedChange={(checked) => 
              onUpdate(requirement.id, requirement.text, checked as boolean)
            }
          />
          <span className="text-sm text-muted-foreground">
            {requirement.required ? "Essential" : "Nice to have"}
          </span>
        </div>
        
        <div className="flex-1">
          <Input
            placeholder={PLACEHOLDERS.requirement}
            value={requirement.text}
            onChange={(e) => onUpdate(requirement.id, e.target.value)}
            className={fieldError ? "border-red-500" : ""}
          />
          {fieldError && (
            <p className="text-sm text-red-500 mt-1">{fieldError}</p>
          )}
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(requirement.id)}
            className="mt-0 text-muted-foreground hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}