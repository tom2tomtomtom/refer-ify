"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "./JobCard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw,
  Briefcase
} from "lucide-react";
import Link from "next/link";
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
  _count?: {
    referrals: number;
  };
}

interface JobFilters {
  search: string;
  status: string;
  tier: string;
  location_type: string;
  experience_level: string;
  job_type: string;
  sortBy: string;
}

const INITIAL_FILTERS: JobFilters = {
  search: "",
  status: "all",
  tier: "all", 
  location_type: "all",
  experience_level: "all",
  job_type: "all",
  sortBy: "newest"
};

export function JobListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const supabase = getSupabaseBrowserClient();
  const ITEMS_PER_PAGE = 12;

  const fetchJobs = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      
      let query = supabase
        .from("jobs")
        .select(`
          *,
          _count:referrals(count)
        `, { count: "exact" })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
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
      
      if (filters.job_type !== "all") {
        query = query.eq("job_type", filters.job_type);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
        case "salary_high":
          query = query.order("salary_max", { ascending: false, nullsFirst: false });
          break;
        case "salary_low":
          query = query.order("salary_min", { ascending: true, nullsFirst: false });
          break;
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const newJobs = data || [];
      setJobs(reset ? newJobs : [...jobs, ...newJobs]);
      setTotalCount(count || 0);
      setHasMore(newJobs.length === ITEMS_PER_PAGE);
      
      if (reset) {
        setPage(2);
      } else {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [filters, page, jobs, supabase]);

  // Real-time subscription for job updates
  useEffect(() => {
    const channel = supabase
      .channel("jobs-realtime")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "jobs" },
        () => {
          fetchJobs(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchJobs]);

  // Initial load and filter changes
  useEffect(() => {
    fetchJobs(true);
  }, [filters]);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: newStatus as Job["status"] } : job
      ));
      
      toast.success(`Job ${newStatus === "active" ? "activated" : "paused"} successfully`);
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to archive this job?")) return;
    
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "archived" })
        .eq("id", jobId);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success("Job archived successfully");
    } catch {
      toast.error("Failed to archive job");
    }
  };

  const updateFilter = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value, index) => value !== Object.values(INITIAL_FILTERS)[index]
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="text-muted-foreground">
            {totalCount} job{totalCount !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link href="/client/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.tier} onValueChange={(value) => updateFilter("tier", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Subscription Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="connect">Connect</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="salary_high">Salary High-Low</SelectItem>
                <SelectItem value="salary_low">Salary Low-High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Select value={filters.job_type} onValueChange={(value) => updateFilter("job_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
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

      {/* Job Grid */}
      {loading && jobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">
                {activeFiltersCount > 0 
                  ? "Try adjusting your filters to see more results"
                  : "Get started by posting your first job"
                }
              </p>
            </div>
            {activeFiltersCount === 0 && (
              <Link href="/client/jobs/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                variant="client"
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => fetchJobs(false)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Jobs"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
