"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "./JobCard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { 
  Search, 
  Filter, 
  Bell, 
  BellRing,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import { toast } from "sonner";

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
  client?: {
    first_name?: string;
    last_name?: string;
    company?: string;
  };
}

interface JobFeedFilters {
  search: string;
  tier: string;
  location_type: string;
  experience_level: string;
  skills: string[];
}

const INITIAL_FILTERS: JobFeedFilters = {
  search: "",
  tier: "all",
  location_type: "all", 
  experience_level: "all",
  skills: []
};

interface RealTimeJobFeedProps {
  userRole: "select_circle" | "founding_circle";
}

export function RealTimeJobFeed({ userRole }: RealTimeJobFeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFeedFilters>(INITIAL_FILTERS);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [lastSeenTime, setLastSeenTime] = useState<string>(new Date().toISOString());
  const [showNotifications, setShowNotifications] = useState(true);
  
  const supabase = getSupabaseBrowserClient();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          client:client_id(
            first_name,
            last_name,
            company
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);

      // Apply tier-based filtering
      if (userRole === "founding_circle") {
        // Founding Circle sees all tiers with priority access
        query = query.order("subscription_tier", { ascending: false });
      } else {
        // Select Circle sees connect and priority tiers
        query = query.in("subscription_tier", ["connect", "priority"]);
      }

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.tier !== "all") {
        query = query.eq("subscription_tier", filters.tier);
      }
      
      if (filters.location_type !== "all") {
        query = query.eq("location_type", filters.location_type);
      }
      
      if (filters.experience_level !== "all") {
        query = query.eq("experience_level", filters.experience_level);
      }

      // Skills filtering (PostgreSQL array contains)
      if (filters.skills.length > 0) {
        query = query.overlaps("skills", filters.skills);
      }

      const { data, error } = await query;

      if (error) throw error;

      setJobs(data || []);
      
      // Count new jobs since last seen
      const newJobs = (data || []).filter(job => 
        new Date(job.created_at) > new Date(lastSeenTime)
      );
      setNewJobsCount(newJobs.length);

    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load job feed");
    } finally {
      setLoading(false);
    }
  }, [filters, userRole, lastSeenTime, supabase]);

  // Real-time subscription for new jobs
  useEffect(() => {
    const channel = supabase
      .channel("job-feed-realtime")
      .on("postgres_changes", 
        { 
          event: "INSERT", 
          schema: "public", 
          table: "jobs",
          filter: "status=eq.active"
        },
        (payload) => {
          const newJob = payload.new as Job;
          
          // Check if this job is relevant for the user's role
          const isRelevant = userRole === "founding_circle" || 
            (userRole === "select_circle" && 
             ["connect", "priority"].includes(newJob.subscription_tier || "connect"));

          if (isRelevant && showNotifications) {
            toast.success(`New ${newJob.subscription_tier} job posted: ${newJob.title}`, {
              action: {
                label: "View",
                onClick: () => {
                  // Scroll to the job or highlight it
                  const element = document.getElementById(`job-${newJob.id}`);
                  element?.scrollIntoView({ behavior: "smooth" });
                }
              }
            });
            setNewJobsCount(prev => prev + 1);
          }
          
          fetchJobs();
        }
      )
      .on("postgres_changes",
        {
          event: "UPDATE",
          schema: "public", 
          table: "jobs"
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchJobs, userRole, showNotifications]);

  // Initial load and filter changes
  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const updateFilter = (key: keyof JobFeedFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const markAsSeen = () => {
    setLastSeenTime(new Date().toISOString());
    setNewJobsCount(0);
  };

  // const handleReferCandidate = (jobId: string) => {
  //   // TODO: Implement referral modal/flow
  //   toast.success("Referral feature coming soon!");
  // };

  const activeFiltersCount = Object.values(filters).filter(
    (value, index) => {
      const initialValue = Object.values(INITIAL_FILTERS)[index];
      return Array.isArray(value) 
        ? value.length > 0 
        : value !== initialValue;
    }
  ).length;

  const tierJobs = jobs.reduce((acc, job) => {
    const tier = job.subscription_tier || "connect";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Live Job Feed
            {userRole === "founding_circle" && (
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Founding Circle
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Real-time opportunities for top referrers
          </p>
        </div>

        <div className="flex items-center gap-4">
          {newJobsCount > 0 && (
            <Button
              variant="outline"
              onClick={markAsSeen}
              className="relative"
            >
              <BellRing className="h-4 w-4 mr-2" />
              {newJobsCount} New
              <Badge className="ml-2 bg-red-500 text-white">
                {newJobsCount}
              </Badge>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            {showNotifications ? (
              <Bell className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live Jobs</span>
            </div>
            <p className="text-2xl font-bold">{jobs.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium">Connect</span>
            </div>
            <p className="text-2xl font-bold">{tierJobs.connect || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              <span className="text-sm font-medium">Priority</span>
            </div>
            <p className="text-2xl font-bold">{tierJobs.priority || 0}</p>
          </CardContent>
        </Card>
        
        {userRole === "founding_circle" && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <span className="text-sm font-medium">Exclusive</span>
              </div>
              <p className="text-2xl font-bold">{tierJobs.exclusive || 0}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filters.tier} onValueChange={(value) => updateFilter("tier", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Subscription Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="connect">Connect</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                {userRole === "founding_circle" && (
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select value={filters.location_type} onValueChange={(value) => updateFilter("location_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Work Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.experience_level} onValueChange={(value) => updateFilter("experience_level", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid-level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="secondary">
                <Filter className="h-3 w-3 mr-1" />
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No active jobs found</h3>
              <p className="text-muted-foreground">
                {activeFiltersCount > 0 
                  ? "Try adjusting your filters to see more opportunities"
                  : "Check back soon for new opportunities"
                }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} id={`job-${job.id}`}>
              <JobCard
                job={job}
                variant="referrer"
                showActions={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
