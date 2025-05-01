import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Wrench,
	Brain,
	RefreshCw,
	Edit,
	Save,
	ArrowLeft,
	AlertCircle,
	Sparkles,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJobs } from "@/contexts/JobsContext";
import { useToast } from "@/hooks/use-toast";
import JobDetails from "@/components/JobDetails";
import { generateMockReworkSuggestions } from "@/data/mockJobs";

export default function ReworkJob() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { jobs, reworkJob } = useJobs();
	const { toast } = useToast();

	const [adjustments, setAdjustments] = useState<Record<string, number>>({});
	const [isEditing, setIsEditing] = useState(false);
	const [suggestedAdjustments, setSuggestedAdjustments] = useState<
		Record<string, number>
	>({});
	const [suggestedRationale, setSuggestedRationale] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);

	const job = jobs.find((j) => j.id === jobId);

	// Generate AI suggestions
	useEffect(() => {
		if (!job) return;

		// Only suggest corrections for bends that failed inspection
		const failed = job.inspectionResults?.filter((r) => !r.pass) || [];
		const { adjustments, rationale } = generateMockReworkSuggestions(
			job.material,
			job.diameter,
			failed,
		);
		setSuggestedAdjustments(adjustments);
		setSuggestedRationale(rationale);
	}, [job]);

	if (!job) {
		return <div>Job not found</div>;
	}

	// Apply AI suggestions to current adjustments
	const applySuggestions = () => {
		setAdjustments(suggestedAdjustments);
		toast({
			title: "Suggestions Applied",
			description:
				"AI recommendations have been applied to the adjustment values.",
		});
	};

	// Generate new suggestions
	const generateNewSuggestions = () => {
		setIsGenerating(true);

		// Simulate AI processing
		setTimeout(() => {
			setIsGenerating(false);
			toast({
				title: "New Suggestions Generated",
				description:
					"ML model has analyzed the inspection results and provided new recommendations.",
			});

			// For demo, we're just applying some random adjustments
			const { adjustments, rationale } = generateMockReworkSuggestions(
				job.material,
				job.diameter,
				failedResults,
			);
			setSuggestedAdjustments(adjustments);
			setSuggestedRationale(rationale);
		}, 3000);
	};

	// Update a specific adjustment value
	const updateAdjustment = (bendKey: string, value: string) => {
		const numValue = Number.parseFloat(value);
		if (!Number.isNaN(numValue)) {
			setAdjustments((prev) => ({
				...prev,
				[bendKey]: numValue,
			}));
		} else if (value === "") {
			// Remove the adjustment if value is empty
			const newAdjustments = { ...adjustments };
			delete newAdjustments[bendKey];
			setAdjustments(newAdjustments);
		}
	};

	// Apply rework and navigate to job pending
	const applyRework = () => {
		reworkJob(job.id, adjustments);
		navigate(`/job-pending/${job.id}`);
	};

	// Get the failed inspection results
	const failedResults =
		job.inspectionResults?.filter((result) => !result.pass) || [];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<div className="lg:col-span-3 space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Rework Required</CardTitle>
								<CardDescription>
									Adjust bend parameters to correct out-of-spec measurements
								</CardDescription>
							</div>

							{job.reworkCount ? (
								<Badge className="bg-amber-100 text-amber-800 border-amber-300">
									<RefreshCw className="h-4 w-4 mr-1" />
									Rework #{job.reworkCount}
								</Badge>
							) : (
								<Badge className="bg-amber-100 text-amber-800 border-amber-300">
									<AlertCircle className="h-4 w-4 mr-1" />
									New Rework
								</Badge>
							)}
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="p-4 border rounded-lg bg-amber-50 space-y-4">
							<div className="flex items-start gap-3">
								<div className="h-8 w-8 rounded-md bg-amber-100 flex items-center justify-center text-amber-700">
									<AlertCircle className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-medium">Inspection Results</h3>
									<p className="text-sm text-muted-foreground mb-3">
										The following bends did not meet the required
										specifications:
									</p>

									<div className="space-y-2">
										{failedResults.map((result) => (
											<div
												key={result.bendPosition}
												className="flex items-center justify-between py-2 px-4 bg-white rounded border"
											>
												<div>
													<span className="font-medium">
														Bend {result.bendPosition}:
													</span>
													<span className="ml-2 text-sm">
														Expected {result.expected}°, Actual{" "}
														{result.actual.toFixed(1)}°
													</span>
												</div>
												<Badge variant="destructive" className="ml-2">
													Δ {Math.abs(result.deviation).toFixed(2)}°
												</Badge>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium flex items-center">
									<Sparkles className="mr-2 h-5 w-5 text-accent" />
									AI Suggested Adjustments
								</h3>
								<Button
									variant="outline"
									size="sm"
									onClick={generateNewSuggestions}
									disabled={isGenerating}
								>
									{isGenerating ? (
										<>
											<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
											Generating...
										</>
									) : (
										<>
											<RefreshCw className="mr-2 h-4 w-4" />
											Regenerate
										</>
									)}
								</Button>
							</div>

							<div className="p-4 border rounded-lg bg-gray-50">
								<div className="mb-4">
									<h4 className="text-sm font-medium mb-1">Rationale:</h4>
									<p className="text-sm text-muted-foreground">
										{suggestedRationale}
									</p>
								</div>

								<div className="space-y-3">
									<h4 className="text-sm font-medium">
										Recommended Adjustments:
									</h4>
									{Object.keys(suggestedAdjustments).length > 0 ? (
										<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
											{Object.entries(suggestedAdjustments)
												.filter(([key]) => key !== "rationale")
												.map(([bendKey, value]) => {
													const bendPosition = bendKey.split("-")[1];
													return (
														<div
															key={bendKey}
															className="flex flex-col p-2 bg-white border rounded-md"
														>
															<span className="text-sm font-medium">
																Bend {bendPosition}
															</span>
															<span
																className={`text-sm ${value < 0 ? "text-blue-600" : "text-red-600"}`}
															>
																{value > 0 && "+"}
																{value.toFixed(1)}°
															</span>
														</div>
													);
												})}
										</div>
									) : (
										<p className="text-sm text-muted-foreground italic">
											No adjustments suggested
										</p>
									)}

									<Button
										className="mt-3"
										variant="secondary"
										onClick={applySuggestions}
										disabled={
											Object.keys(suggestedAdjustments).filter(
												(key) => key !== "rationale",
											).length === 0
										}
									>
										Apply Suggestions
									</Button>
								</div>
							</div>
						</div>

						<Separator />

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium">Manual Adjustments</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsEditing(!isEditing)}
								>
									{isEditing ? (
										<>
											<Save className="mr-2 h-4 w-4" />
											Done
										</>
									) : (
										<>
											<Edit className="mr-2 h-4 w-4" />
											Edit
										</>
									)}
								</Button>
							</div>

							<div className="space-y-4">
								{job.bends.map((bend) => {
									const bendKey = `bend-${bend.position}`;
									const adjustment = adjustments[bendKey];
									const hasAdjustment = adjustment !== undefined;

									return (
										<div key={bendKey} className="flex items-center space-x-4">
											<div className="w-24">
												<div className="font-medium">Bend {bend.position}</div>
												<div className="text-sm text-muted-foreground">
													{bend.angle}°
												</div>
											</div>

											{isEditing ? (
												<div className="flex-1">
													<Label htmlFor={bendKey} className="sr-only">
														Adjustment for Bend {bend.position}
													</Label>
													<div className="relative">
														<Input
															id={bendKey}
															type="number"
															step="0.1"
															value={hasAdjustment ? adjustment : ""}
															onChange={(e) =>
																updateAdjustment(bendKey, e.target.value)
															}
															className="pl-8"
															placeholder="0.0"
														/>
														<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
															Δ
														</span>
													</div>
												</div>
											) : (
												<div className="flex-1">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<div
																	className={`
                                    px-3 py-2 rounded-md
                                    ${
																			hasAdjustment
																				? adjustment < 0
																					? "bg-blue-100 text-blue-800"
																					: "bg-red-100 text-red-800"
																				: "bg-gray-100 text-gray-500"
																		}
                                  `}
																>
																	{hasAdjustment ? (
																		<>
																			{adjustment > 0 && "+"}
																			{adjustment.toFixed(1)}°
																		</>
																	) : (
																		"No adjustment"
																	)}
																</div>
															</TooltipTrigger>
															<TooltipContent>
																{hasAdjustment
																	? `Adjusted value: ${(bend.angle + adjustment).toFixed(1)}°`
																	: "No change from original"}
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											)}

											<div className="w-24 text-right">
												<div className="font-medium">
													{hasAdjustment
														? (bend.angle + adjustment).toFixed(1)
														: bend.angle}
													°
												</div>
												<div className="text-xs text-muted-foreground">
													New value
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" onClick={() => navigate("/dashboard")}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Cancel
						</Button>

						<Button
							onClick={applyRework}
							disabled={Object.keys(adjustments).length === 0}
						>
							<Wrench className="h-4 w-4 mr-2" />
							Apply & Bend New Tube
						</Button>
					</CardFooter>
				</Card>
			</div>

			<div className="lg:col-span-2 space-y-6">
				<JobDetails job={job} />
			</div>
		</div>
	);
}
