"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  MoreHorizontal, 
  Edit, 
  Pause, 
  Play, 
  Archive, 
  Eye,
  Star,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { ReferralModal } from "@/components/referrals/ReferralModal";

interface Job {
  id: string;
  title: string;
  description: string;
  location_type?: "remote" | "hybrid" | "onsite";
  location_city?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  status: "draft" | "active" | "paused" | "filled";
  subscription_tier?: "connect" | "priority" | "exclusive";
  skills?: string[];
  experience_level?: "junior" | "mid" | "senior" | "executive";
  job_type?: "full_time" | "contract" | "part_time";
  created_at: string;
  _count?: {
    referrals: number;
  };
}

interface JobCardProps {
  job: Job;
  onStatusChange?: (jobId: string, status: string) => void;
  onDelete?: (jobId: string) => void;
  showActions?: boolean;
  variant?: "client" | "referrer";
}

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  filled: "bg-blue-100 text-blue-800"
};

const TIER_COLORS = {
  connect: "bg-blue-50 border-blue-200",
  priority: "bg-purple-50 border-purple-200", 
  exclusive: "bg-orange-50 border-orange-200"
};

const TIER_ICONS = {
  connect: null,
  priority: <Star className="h-4 w-4 text-purple-500" />,
  exclusive: <Star className="h-4 w-4 text-orange-500" />
};

export function JobCard({ job, onStatusChange, onDelete, showActions = true, variant = "client" }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.currency || "USD";
    const formatter = new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency,
      minimumFractionDigits: 0 
    });
    
    if (job.salary_min && job.salary_max) {
      return `${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)}`;
    }
    return formatter.format(job.salary_min || job.salary_max || 0);
  };

  const getLocationDisplay = () => {
    if (job.location_type === "remote") return "Remote";
    if (job.location_city) return job.location_city;
    return job.location_type || "Not specified";
  };

  const formatJobType = (type?: string) => {
    switch (type) {
      case "full_time": return "Full-time";
      case "part_time": return "Part-time";
      case "contract": return "Contract";
      default: return "Full-time";
    }
  };

  const formatExperienceLevel = (level?: string) => {
    switch (level) {
      case "junior": return "Junior";
      case "mid": return "Mid-level";
      case "senior": return "Senior";
      case "executive": return "Executive";
      default: return "Mid-level";
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      job.subscription_tier ? TIER_COLORS[job.subscription_tier] : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={variant === "client" ? `/client/jobs/${job.id}` : "#"}
                className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
              {job.subscription_tier && TIER_ICONS[job.subscription_tier]}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {getLocationDisplay()}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {formatJobType(job.job_type)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {formatExperienceLevel(job.experience_level)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[job.status]}>
              {job.status}
            </Badge>
            
            {showActions && variant === "client" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/client/jobs/${job.id}`} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/client/jobs/${job.id}/edit`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Job
                    </Link>
                  </DropdownMenuItem>
                  {job.status === "active" && (
                    <DropdownMenuItem onClick={() => onStatusChange?.(job.id, "paused")}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Job
                    </DropdownMenuItem>
                  )}
                  {job.status === "paused" && (
                    <DropdownMenuItem onClick={() => onStatusChange?.(job.id, "active")}>
                      <Play className="h-4 w-4 mr-2" />
                      Activate Job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(job.id)}
                    className="text-destructive"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {variant === "referrer" && (
              <ReferralModal job={job}>
                <Button size="sm">Refer Professional</Button>
              </ReferralModal>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {job.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            {formatSalary() && (
              <div className="flex items-center gap-1 font-medium">
                <DollarSign className="h-4 w-4" />
                {formatSalary()}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date(job.created_at).toLocaleDateString()}
            </div>

            {variant === "client" && job._count?.referrals !== undefined && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {job._count.referrals} referrals
              </div>
            )}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {job.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
