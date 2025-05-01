import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { Job, JobStatus, JobPriority } from '@/types/job';
import { mockJobs } from '@/data/mockJobs';

interface JobsContextType {
  jobs: Job[];
  activeJob: Job | null;
  selectJob: (jobId: string) => void;
  skipJob: (jobId: string) => void;
  completeJob: (jobId: string, success: boolean) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  reworkJob: (jobId: string, adjustments: Record<string, number>) => void;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  // Initialize with mock data
  useEffect(() => {
    setJobs(mockJobs);
  }, []);

  // Select a job to start processing
  const selectJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setActiveJob(job);
    updateJobStatus(jobId, 'pending');
    
    // Simulate machine preparation
    toast({
      title: "Job Selected",
      description: `Preparing machine for ${job.partNumber}`,
    });
  };

  // Skip a job (move to end of queue)
  const skipJob = (jobId: string) => {
    setJobs(prev => {
      const newJobs = [...prev];
      const index = newJobs.findIndex(j => j.id === jobId);
      if (index === -1) return prev;
      
      const skippedJob = { ...newJobs[index], priority: 'low' as JobPriority };
      newJobs.splice(index, 1);
      newJobs.push(skippedJob);
      
      toast({
        title: "Job Skipped",
        description: `${skippedJob.partNumber} moved to end of queue`,
      });
      
      return newJobs;
    });
  };

  // Mark a job as complete
  const completeJob = (jobId: string, success: boolean) => {
    setJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { ...job, status: success ? 'completed' : 'failed' } 
          : job
      )
    );
    
    if (success) {
      toast({
        title: "Job Completed",
        description: "The part has passed inspection and is ready for delivery.",
        variant: "default",
      });
    } else {
      toast({
        title: "Inspection Failed",
        description: "The part requires rework. See details for suggested adjustments.",
        variant: "destructive",
      });
    }
  };

  // Update a job's status
  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, status } : job
      )
    );
    
    // If we have an active job and its ID matches the updated job, update it too
    if (activeJob && activeJob.id === jobId) {
      setActiveJob(prev => prev ? { ...prev, status } : null);
    }
  };

  // Apply rework adjustments to a job
  const reworkJob = (jobId: string, adjustments: Record<string, number>) => {
    setJobs(prev => 
      prev.map(job => {
        if (job.id !== jobId) return job;
        
        // Apply adjustments to the bend specifications
        const updatedBends = job.bends.map(bend => {
          const bendKey = `bend-${bend.position}`;
          if (adjustments[bendKey]) {
            return { 
              ...bend, 
              angle: bend.angle + adjustments[bendKey],
              modified: true
            };
          }
          return bend;
        });
        
        return { 
          ...job, 
          status: 'pending',
          bends: updatedBends,
          reworkCount: (job.reworkCount || 0) + 1
        };
      })
    );
    
    toast({
      title: "Rework Applied",
      description: "Adjustments have been applied to the bend file. Ready to rebend.",
    });
  };

  const value = {
    jobs,
    activeJob,
    selectJob,
    skipJob,
    completeJob,
    updateJobStatus,
    reworkJob
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};