import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Job } from "@/types/job";
import { formatDate } from "@/lib/utils";

interface JobDetailsProps {
	job: Job;
}

export default function JobDetails({ job }: JobDetailsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Job Details</span>
					<Badge className={`job-priority-${job.priority}`}>
						{job.priority}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold">{job.partNumber}</h3>
					<p className="text-muted-foreground">{job.customerName}</p>
				</div>

				<Separator />

				<div className="grid grid-cols-2 gap-3">
					<div>
						<p className="text-sm text-muted-foreground">Material</p>
						<p className="font-medium">{job.material}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Diameter</p>
						<p className="font-medium">{job.diameter}mm</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Due Date</p>
						<p className="font-medium">{formatDate(job.dueDate)}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Status</p>
						<p className="font-medium capitalize">
							{job.status.replace("-", " ")}
						</p>
					</div>
				</div>

				<Separator />

				<div>
					<h4 className="font-medium mb-2">Bend Specifications</h4>
					<div className="space-y-2 max-h-64 overflow-y-auto pr-2">
						{job.bends.map((bend) => (
							<div
								key={bend.position}
								className="flex items-center justify-between py-2 px-4 bg-muted rounded-md"
							>
								<div>
									<span className="font-medium">Bend {bend.position}</span>
									{bend.modified && (
										<Badge
											variant="outline"
											className="ml-2 text-xs bg-blue-100 border-blue-300 text-blue-800"
										>
											Modified
										</Badge>
									)}
								</div>
								<div className="text-right">
									<div className="font-medium">{bend.angle}°</div>
									<div className="text-xs text-muted-foreground">
										{bend.length}mm
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{job.notes && (
					<>
						<Separator />
						<div>
							<h4 className="font-medium mb-1">Notes</h4>
							<p className="text-sm text-muted-foreground">{job.notes}</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
