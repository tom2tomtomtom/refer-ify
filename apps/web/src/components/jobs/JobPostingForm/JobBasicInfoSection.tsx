import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MapPin, DollarSign } from "lucide-react";
import { JobFormData } from "@/hooks/jobs/useJobFormData";
import { 
  CURRENCIES, 
  EXPERIENCE_LEVELS, 
  JOB_TYPES, 
  LOCATION_TYPES,
  PLACEHOLDERS,
  HELP_TEXT 
} from "@/utils/jobs/jobFormConstants";

interface JobBasicInfoSectionProps {
  formData: JobFormData;
  onUpdate: (field: keyof JobFormData, value: unknown) => void;
  errors?: Array<{field: string; message: string}>;
}

/**
 * JobBasicInfoSection - Basic job information form section
 * 
 * Handles the core job details including title, description, type,
 * experience level, location, and compensation information.
 */
export function JobBasicInfoSection({ 
  formData, 
  onUpdate, 
  errors = [] 
}: JobBasicInfoSectionProps) {
  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const getFieldClassName = (field: string) => {
    return getFieldError(field) ? "border-red-500" : "";
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder={PLACEHOLDERS.title}
              value={formData.title}
              onChange={(e) => onUpdate("title", e.target.value)}
              className={getFieldClassName("title")}
            />
            {getFieldError("title") && (
              <p className="text-sm text-red-500 mt-1">{getFieldError("title")}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {HELP_TEXT.title}
            </p>
          </div>

          <div>
            <Label htmlFor="description">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder={PLACEHOLDERS.description}
              rows={6}
              value={formData.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              className={getFieldClassName("description")}
            />
            {getFieldError("description") && (
              <p className="text-sm text-red-500 mt-1">{getFieldError("description")}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {HELP_TEXT.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Experience Level</Label>
              <Select 
                value={formData.experience_level} 
                onValueChange={(value) => onUpdate("experience_level", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Job Type</Label>
              <Select 
                value={formData.job_type} 
                onValueChange={(value) => onUpdate("job_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Compensation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Compensation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Work Type</Label>
              <Select 
                value={formData.location_type} 
                onValueChange={(value) => onUpdate("location_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location_city">Location</Label>
              <Input
                id="location_city"
                placeholder={
                  formData.location_type === "remote" 
                    ? PLACEHOLDERS.location_city_remote 
                    : PLACEHOLDERS.location_city
                }
                value={formData.location_city}
                onChange={(e) => onUpdate("location_city", e.target.value)}
                className={getFieldClassName("location_city")}
              />
              {getFieldError("location_city") && (
                <p className="text-sm text-red-500 mt-1">{getFieldError("location_city")}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salary Range
            </Label>
            <div className="flex gap-2 items-center">
              <Select 
                value={formData.currency} 
                onValueChange={(value) => onUpdate("currency", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Min"
                value={formData.salary_min || ""}
                onChange={(e) => onUpdate("salary_min", parseInt(e.target.value) || 0)}
                className={getFieldClassName("salary_min")}
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={formData.salary_max || ""}
                onChange={(e) => onUpdate("salary_max", parseInt(e.target.value) || 0)}
                className={getFieldClassName("salary_max")}
              />
            </div>
            {(getFieldError("salary") || getFieldError("salary_min") || getFieldError("salary_max")) && (
              <p className="text-sm text-red-500 mt-1">
                {getFieldError("salary") || getFieldError("salary_min") || getFieldError("salary_max")}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {HELP_TEXT.salary}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}