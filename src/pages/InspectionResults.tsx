import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	CheckCircle,
	XCircle,
	Printer,
	ArrowLeft,
	RotateCcw,
	ArrowRight,
	Wrench,
	QrCode,
	Check,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/contexts/JobsContext";
import { useToast } from "@/hooks/use-toast";
import JobDetails from "@/components/JobDetails";
import { mockFailedInspection } from "@/data/mockJobs";
import { InspectionResult } from "@/types/job";
import BendVisualization from "@/components/BendVisualization";

export default function InspectionResults() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { jobs, completeJob } = useJobs();
	const { toast } = useToast();

	const [activeTab, setActiveTab] = useState("results");
	const [inspectionResults, setInspectionResults] = useState<
		InspectionResult[]
	>([]);
	const [isPrinting, setIsPrinting] = useState(false);
	const [isPrinted, setIsPrinted] = useState(false);

	const job = jobs.find((j) => j.id === jobId);

	// Generate random inspection results
	useEffect(() => {
		if (!job) return;

		// Check if we already have inspection results
		if (job.inspectionResults && job.reworkCount && job.reworkCount === 0) {
			setInspectionResults(job.inspectionResults);
			return;
		}

		let guaranteedFailIndex: number | null = null;
		if (job.id === "1002" && !job.reworkCount) {
			guaranteedFailIndex = Math.floor(Math.random() * job.bends.length);
		}
		// Generate new inspection results
		const results: InspectionResult[] = job.bends.map((bend, index) => {
			// For demo, it can fail on the first try for an even job ID. it'll succeed on the rework
			const baseFail =
				job.id !== "1001" &&
				Number(job.id) % 2 === 0 &&
				!job.reworkCount &&
				Math.random() > 0.5;

			const shouldFail =
				(job.id === "1002" && index === guaranteedFailIndex) || baseFail;

			if (shouldFail) {
				const deviation =
					(Number.parseFloat((Math.random() * 5).toFixed(2)) + 0.5) *
					(Math.random() > 0.5 ? 1 : -1);
				return {
					bendPosition: bend.position,
					expected: bend.angle,
					actual: bend.angle + deviation,
					deviation: deviation,
					pass: false,
				};
			}

			// Random small deviation that still passes
			const deviation = Math.random() - 0.5;
			return {
				bendPosition: bend.position,
				expected: bend.angle,
				actual: bend.angle + deviation,
				deviation: deviation,
				pass: true,
			};
		});

		setInspectionResults(results);
	}, [job]);

	if (!job) {
		return <div>Job not found</div>;
	}

	const allPassed = inspectionResults.every((result) => result.pass);

	const handleMarkComplete = () => {
		completeJob(job.id, true, inspectionResults);
		navigate("/dashboard");
	};

	const handleRework = () => {
		completeJob(job.id, false, inspectionResults);
		navigate(`/rework/${job.id}`);
	};

	const handlePrintTag = () => {
		setIsPrinted(false);
		setIsPrinting(true);

		// Simulate printing delay
		setTimeout(() => {
			setIsPrinting(false);
			setIsPrinted(true);
			toast({
				title: "Tag Printed",
				description: "Part tag has been printed successfully.",
			});
		}, 2500);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<div className="lg:col-span-3 space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Inspection Results</CardTitle>
								<CardDescription>
									Quality verification for part {job.partNumber}
								</CardDescription>
							</div>

							{allPassed ? (
								<Badge className="bg-green-100 text-green-800 border-green-300">
									<CheckCircle className="h-4 w-4 mr-1" />
									Passed
								</Badge>
							) : (
								<Badge variant="destructive">
									<XCircle className="h-4 w-4 mr-1" />
									Failed
								</Badge>
							)}
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{allPassed ? (
							<div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg">
								<div className="flex items-center justify-center mb-4">
									<div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
										<CheckCircle className="h-8 w-8 text-green-600" />
									</div>
								</div>
								<h2 className="text-center text-xl font-semibold text-green-800 mb-2">
									All Bends Within Specification
								</h2>
								<p className="text-center text-green-700 mb-6">
									This part has passed all inspection criteria and is ready for
									shipping.
								</p>

								<div className="max-w-sm mx-auto p-4 bg-white border rounded-lg shadow-sm">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="font-bold">{job.partNumber}</h3>
											<p className="text-sm text-muted-foreground">
												{job.customerName}
											</p>
										</div>
										<QrCode className="h-10 w-10" />
									</div>

									<div className="space-y-1 text-sm mb-4">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Material:</span>
											<span className="font-medium">{job.material}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Diameter:</span>
											<span className="font-medium">{job.diameter}mm</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Bends:</span>
											<span className="font-medium">{job.bends.length}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Inspector:</span>
											<span className="font-medium">AccuBend System</span>
										</div>
									</div>

									<Button
										className="w-full"
										disabled={isPrinting}
										onClick={handlePrintTag}
									>
										{isPrinting ? (
											<>
												<RotateCcw className="h-4 w-4 mr-2 animate-spin" />
												Printing...
											</>
										) : isPrinted ? (
											<>
												<Check className="h-4 w-4 mr-2" />
												Tag Printed
											</>
										) : (
											<>
												<Printer className="h-4 w-4 mr-2" />
												Print Tag
											</>
										)}
									</Button>
								</div>
							</div>
						) : (
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="results">Inspection Results</TabsTrigger>
									<TabsTrigger value="visualization">Visualization</TabsTrigger>
								</TabsList>

								<TabsContent value="results" className="space-y-4 pt-4">
									<div className="p-4 bg-red-50 border border-red-300 rounded-lg mb-4">
										<div className="flex items-start gap-3">
											<XCircle className="h-6 w-6 text-red-600 mt-0.5" />
											<div>
												<h3 className="font-semibold text-red-800">
													Inspection Failed
												</h3>
												<p className="text-sm text-red-700">
													One or more bends are out of specification. Please
													review the results below.
												</p>
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<h3 className="font-medium">Bend Measurements</h3>

										<div className="space-y-2">
											{inspectionResults.map((result) => (
												<div
													key={result.bendPosition}
													className={`p-3 rounded-lg border ${result.pass ? "inspection-pass" : "inspection-fail"}`}
												>
													<div className="flex items-center justify-between">
														<div>
															<div className="font-medium">
																Bend {result.bendPosition}
															</div>
															<div className="text-sm">
																Expected: {result.expected}° | Actual:{" "}
																{result.actual.toFixed(1)}°
															</div>
														</div>
														<div className="text-right">
															<div className="font-medium">
																Δ {result.deviation.toFixed(2)}°
															</div>
															<div className="text-sm">
																{result.pass ? "Within spec" : "Out of spec"}
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</TabsContent>

								<TabsContent value="visualization" className="pt-4">
									<BendVisualization
										results={inspectionResults}
										bends={job.bends}
									/>
								</TabsContent>
							</Tabs>
						)}
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" onClick={() => navigate("/dashboard")}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Queue
						</Button>

						{allPassed ? (
							<Button onClick={handleMarkComplete}>
								<CheckCircle className="h-4 w-4 mr-2" />
								Mark Complete
							</Button>
						) : (
							<Button onClick={handleRework}>
								<Wrench className="h-4 w-4 mr-2" />
								Rework Part
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
