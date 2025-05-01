import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ChevronRight,
	Clock,
	SkipForward,
	Filter,
	Search,
	SortAsc,
	SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobs } from "@/contexts/JobsContext";
import { Job, JobPriority } from "@/types/job";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
	const navigate = useNavigate();
	const { jobs, selectJob, skipJob } = useJobs();
	const [filter, setFilter] = useState("");
	const [sortBy, setSortBy] = useState<"priority" | "dueDate">("priority");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	// Filter and sort jobs
	const filteredJobs = jobs
		.filter(
			(job) =>
				job.status === "queued" &&
				(filter === "" ||
					job.partNumber.toLowerCase().includes(filter.toLowerCase()) ||
					job.customerName.toLowerCase().includes(filter.toLowerCase())),
		)
		.sort((a, b) => {
			// First sort by priority
			const priorityValues: Record<JobPriority, number> = {
				urgent: 4,
				high: 3,
				normal: 2,
				low: 1,
			};

			if (sortBy === "priority") {
				const valueA = priorityValues[a.priority];
				const valueB = priorityValues[b.priority];
				return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
			} else {
				// Sort by due date
				const dateA = new Date(a.dueDate).getTime();
				const dateB = new Date(b.dueDate).getTime();
				return sortOrder === "desc" ? dateA - dateB : dateB - dateA;
			}
		});

	// Start the next job (highest priority)
	const startNextJob = () => {
		if (filteredJobs.length === 0) return;

		const nextJob = filteredJobs[0];
		selectJob(nextJob.id);
		navigate(`/job-pending/${nextJob.id}`);
	};

	// Start a specific job
	const startJob = (job: Job) => {
		selectJob(job.id);
		navigate(`/job-pending/${job.id}`);
	};

	// Skip a job
	const handleSkipJob = (event: React.MouseEvent, jobId: string) => {
		event.stopPropagation();
		skipJob(jobId);
	};

	// Toggle sort order
	const toggleSortOrder = () => {
		setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle>Job Queue</CardTitle>
						<Button onClick={startNextJob} disabled={filteredJobs.length === 0}>
							Start Next Job
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-4">
						<div className="flex flex-wrap gap-2 items-center justify-between">
							<div className="relative flex-1 min-w-[200px]">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search jobs..."
									className="pl-8"
									value={filter}
									onChange={(e) => setFilter(e.target.value)}
								/>
							</div>
							<div className="flex gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											<Filter className="h-4 w-4 mr-2" />
											Sort By
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => setSortBy("priority")}>
											Priority
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setSortBy("dueDate")}>
											Due Date
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button variant="outline" size="sm" onClick={toggleSortOrder}>
									{sortOrder === "asc" ? (
										<SortAsc className="h-4 w-4" />
									) : (
										<SortDesc className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						{filteredJobs.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								No jobs in queue.
							</div>
						) : (
							<div className="space-y-2">
								{filteredJobs.map((job, index) => (
									// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
									<div
										key={job.id}
										className="flex items-center p-3 rounded-lg border hover:bg-accent-soft cursor-pointer transition-colors"
										onClick={() => startJob(job)}
									>
										<div className="flex flex-1 gap-3 justify-center items-center">
											<div className="rounded-full flex flex-shrink h-10 w-10 justify-center items-center bg-muted border border-gray-900">
												{index + 1}
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-medium">{job.partNumber}</span>
													<Badge className={`job-priority-${job.priority}`}>
														{job.priority}
													</Badge>
												</div>
												<div className="text-sm text-muted-foreground">
													{job.customerName}
												</div>
												<div className="text-sm">
													{job.material} - {job.diameter}mm
												</div>
											</div>
										</div>
										<div className="flex flex-col items-end space-y-1 mr-4">
											<div className="flex items-center text-sm">
												<Clock className="h-4 w-4 mr-1" />
												<span>Due: {formatDate(job.dueDate)}</span>
											</div>
											<div className="text-sm text-muted-foreground">
												{job.bends.length} bends
											</div>
										</div>
										<div className="flex gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={(e) => handleSkipJob(e, job.id)}
												title="Skip job"
											>
												<SkipForward className="h-5 w-5" />
											</Button>
											<Button variant="ghost" size="icon">
												<ChevronRight className="h-5 w-5" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
