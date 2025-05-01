import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Activity,
	Check,
	RotateCw,
	ThumbsUp,
	AlertTriangle,
	MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/contexts/JobsContext";
import { useToast } from "@/hooks/use-toast";
import BendingVisualizer from "@/components/BendingVisualizer";
import JobDetails from "@/components/JobDetails";

export default function JobInProgress() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { jobs, updateJobStatus } = useJobs();
	const { toast } = useToast();

	const [currentBendIndex, setCurrentBendIndex] = useState(0);
	const [bendProgress, setBendProgress] = useState(0);
	const [bendComplete, setBendComplete] = useState(false);
	const [allBendsComplete, setAllBendsComplete] = useState(false);

	const job = jobs.find((j) => j.id === jobId);

	// If no job is found or it's not in-progress, redirect to dashboard
	useEffect(() => {
		if (!job) {
			navigate("/dashboard");
			return;
		}

		if (job.status !== "in-progress") {
			updateJobStatus(job.id, "in-progress");
		}
	}, [job, navigate, updateJobStatus]);

	// Simulate bend progress
	useEffect(() => {
		if (!job || allBendsComplete) return;

		let progressTimer: NodeJS.Timeout;

		if (!bendComplete) {
			progressTimer = setInterval(() => {
				setBendProgress((prev) => {
					if (prev >= 100) {
						clearInterval(progressTimer);
						setBendComplete(true);
						return 100;
					}
					return prev + 2;
				});
			}, 100);
		} else if (currentBendIndex < job.bends.length - 1) {
			// Move to next bend after a delay
			const timer = setTimeout(() => {
				setCurrentBendIndex((prev) => prev + 1);
				setBendProgress(0);
				setBendComplete(false);
			}, 2000);

			return () => clearTimeout(timer);
		} else if (currentBendIndex === job.bends.length - 1 && bendComplete) {
			// All bends complete
			const timer = setTimeout(() => {
				setAllBendsComplete(true);
				toast({
					title: "Bending Complete",
					description: "Please move part to inspection station.",
				});
			}, 2000);

			return () => clearTimeout(timer);
		}

		return () => clearInterval(progressTimer);
	}, [job, currentBendIndex, bendComplete, allBendsComplete, toast]);

	if (!job) {
		return <div>Job not found</div>;
	}

	const currentBend = job.bends[currentBendIndex];

	const handleMoveToInspection = () => {
		updateJobStatus(job.id, "inspecting");
		navigate(`/inspection-pending/${job.id}`);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<div className="lg:col-span-3 space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>
									{allBendsComplete
										? "All bends completed successfully"
										: `Bend ${currentBendIndex + 1} of ${job.bends.length}`}
								</CardTitle>
							</div>

							<Badge
								variant="outline"
								className="bg-blue-100 text-blue-800 border-blue-300"
							>
								<Activity className="h-4 w-4 mr-1" />
								Active
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{allBendsComplete ? (
							<div className="p-8 border-2 border-green-500 bg-green-50 rounded-lg text-center">
								<div className="flex justify-center mb-4">
									<div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
										<Check className="h-8 w-8 text-green-600" />
									</div>
								</div>
								<h2 className="text-2xl font-semibold text-green-700 mb-2">
									Bending Complete
								</h2>
								<p className="text-green-700 mb-6">
									All bends have been completed successfully.
								</p>
								<Button
									onClick={handleMoveToInspection}
									className="bg-green-600 hover:bg-green-700 text-white"
								>
									<MoveRight className="mr-2 h-4 w-4" />
									Move to Inspection
								</Button>
							</div>
						) : (
							<>
								<div className="flex flex-col md:flex-row gap-6 items-center">
									<div className="flex-1 w-full">
										<div className="mb-6">
											<div className="flex justify-between mb-1">
												<span>Bend Progress</span>
												<span>{bendProgress}%</span>
											</div>
											<Progress value={bendProgress} className="h-3" />
										</div>

										<div className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="p-4 bg-muted rounded-lg">
													<p className="text-sm text-muted-foreground mb-1">
														Position
													</p>
													<p className="text-xl font-semibold">
														{currentBend.position}
													</p>
												</div>
												<div className="p-4 bg-muted rounded-lg">
													<p className="text-sm text-muted-foreground mb-1">
														Angle
													</p>
													<p className="text-xl font-semibold">
														{currentBend.angle}°
													</p>
												</div>
												<div className="p-4 bg-muted rounded-lg">
													<p className="text-sm text-muted-foreground mb-1">
														Length
													</p>
													<p className="text-xl font-semibold">
														{currentBend.length}mm
													</p>
												</div>
												<div className="p-4 bg-muted rounded-lg">
													<p className="text-sm text-muted-foreground mb-1">
														Type
													</p>
													<p className="text-xl font-semibold capitalize">
														{currentBend.type}
													</p>
												</div>
											</div>

											<div className="flex items-center space-x-3">
												<div className="flex h-10 w-10 rounded-full items-center justify-center">
													{bendComplete ? (
														<Check className="h-6 w-6 text-green-600" />
													) : (
														<RotateCw className="h-6 w-6 text-blue-600 animate-spin" />
													)}
												</div>
												<div>
													{bendComplete ? (
														<p className="text-green-600 font-medium">
															Bend complete
														</p>
													) : (
														<p className="text-blue-600 font-medium">
															Bending in progress...
														</p>
													)}
												</div>
											</div>
										</div>
									</div>

									<div className="w-full md:w-1/2">
										<BendingVisualizer
											bends={job.bends}
											currentBendIndex={currentBendIndex}
											progress={bendProgress}
										/>
									</div>
								</div>

								<div className="flex justify-between items-center p-3 rounded-lg border">
									<div>
										<p className="font-medium">Machine Status</p>
										<div className="flex items-center mt-1">
											<span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
											<span className="text-sm">Operating normally</span>
										</div>
									</div>

									<div className="w-[180px]">
										<p className="font-medium">Tube Feedback</p>
										<div className="flex items-center mt-1">
											{bendProgress > 90 ? (
												<>
													<ThumbsUp className="h-4 w-4 text-green-600 mr-1" />
													<span className="text-sm text-green-600">
														Good bend quality
													</span>
												</>
											) : bendProgress > 50 ? (
												<>
													<AlertTriangle className="h-4 w-4 text-amber-600 mr-1" />
													<span className="text-sm text-amber-600">
														Verifying bend quality
													</span>
												</>
											) : (
												<>
													<RotateCw className="h-4 w-4 text-blue-600 mr-1 animate-spin" />
													<span className="text-sm text-blue-600">
														Monitoring
													</span>
												</>
											)}
										</div>
									</div>
								</div>
							</>
						)}
					</CardContent>
					<CardFooter className="justify-between">
						<Button
							variant="outline"
							disabled={!allBendsComplete}
							onClick={() => navigate("/dashboard")}
						>
							Back to Job Queue
						</Button>

						{allBendsComplete && (
							<Button onClick={handleMoveToInspection}>
								Move to Inspection
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>

			<div className="lg:col-span-2 space-y-6">
				<JobDetails job={job} />
			</div>
		</div>
	);
}
