import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, ScanLine, ShieldCheck } from "lucide-react";
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
import JobDetails from "@/components/JobDetails";
import { mockFailedInspection } from "@/data/mockJobs";

enum InspectionState {
	WAITING = "waiting",
	PREPARING = "preparing",
	SCANNING = "scanning",
	ANALYZING = "analyzing",
	COMPLETE = "complete",
}

export default function InspectionPending() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { jobs } = useJobs();
	const { toast } = useToast();

	const [inspectionState, setInspectionState] = useState<InspectionState>(
		InspectionState.WAITING,
	);
	const [progress, setProgress] = useState(0);
	const [tubeDetected, setTubeDetected] = useState(false);
	const [doorClosed, setDoorClosed] = useState(false);
	const [failInspection, setFailInspection] = useState(false);

	const job = jobs.find((j) => j.id === jobId);

	// Queue the inspection state machine
	useEffect(() => {
		if (!job) return;

		let timer: NodeJS.Timeout;

		switch (inspectionState) {
			case InspectionState.WAITING:
				if (tubeDetected && doorClosed) {
					setTimeout(() => {
						setInspectionState(InspectionState.PREPARING);
					}, 1500);
				}
				break;

			case InspectionState.PREPARING:
				setProgress(0);
				timer = setInterval(() => {
					setProgress((prev) => {
						if (prev >= 100) {
							clearInterval(timer);
							setInspectionState(InspectionState.SCANNING);
							return 100;
						}
						return prev + 5;
					});
				}, 100);
				break;

			case InspectionState.SCANNING:
				setProgress(0);
				timer = setInterval(() => {
					setProgress((prev) => {
						if (prev >= 100) {
							clearInterval(timer);
							setInspectionState(InspectionState.ANALYZING);
							return 100;
						}
						return prev + 1;
					});
				}, 75);
				break;

			case InspectionState.ANALYZING:
				setProgress(0);
				timer = setInterval(() => {
					setProgress((prev) => {
						if (prev >= 100) {
							clearInterval(timer);
							setInspectionState(InspectionState.COMPLETE);
							return 100;
						}
						return prev + 4;
					});
				}, 100);
				break;

			case InspectionState.COMPLETE:
				// Navigate to results
				timer = setTimeout(() => {
					if (failInspection) {
						toast({
							title: "Inspection Failed",
							description:
								"Part has out-of-spec bends. See details for more information.",
							variant: "destructive",
						});
					} else {
						toast({
							title: "Inspection Passed",
							description: "All bends are within specification.",
						});
					}
					navigate(`/inspection-results/${job.id}`);
				}, 1500);
				break;
		}

		return () => {
			clearInterval(timer);
			clearTimeout(timer);
		};
	}, [
		job,
		inspectionState,
		tubeDetected,
		doorClosed,
		navigate,
		toast,
		failInspection,
	]);

	// Simulate tube detection and door closing
	useEffect(() => {
		if (inspectionState === InspectionState.WAITING) {
			// Simulate tube detection after a delay
			const tubeTimer = setTimeout(() => {
				setTubeDetected(true);
				toast({
					title: "Tube Detected",
					description: "Please close inspection chamber door to continue.",
				});
			}, 3000);

			// Simulate door closing after tube is detected
			const doorTimer = setTimeout(() => {
				if (tubeDetected) {
					setDoorClosed(true);
				}
			}, 6000);

			// Randomly decide if this inspection should fail
			// setFailInspection(Math.random() > 0.7);

			return () => {
				clearTimeout(tubeTimer);
				clearTimeout(doorTimer);
			};
		}
	}, [inspectionState, tubeDetected, toast]);

	if (!job) {
		return <div>Job not found</div>;
	}

	const getStateLabel = () => {
		switch (inspectionState) {
			case InspectionState.WAITING:
				return "Waiting for Tube";
			case InspectionState.PREPARING:
				return "Preparing Scanner";
			case InspectionState.SCANNING:
				return "Scanning Tube";
			case InspectionState.ANALYZING:
				return "Analyzing Results";
			case InspectionState.COMPLETE:
				return "Inspection Complete";
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<div className="lg:col-span-3 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Inspection Station</CardTitle>
						<CardDescription>
							Scanning and measuring tube dimensions
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div
							className={`p-6 rounded-lg border-2 text-center ${getInspectionStatusClass(inspectionState)}`}
						>
							<div className="flex justify-center items-center space-x-3 mb-4">
								{inspectionState === InspectionState.WAITING && (
									<ScanLine className="h-8 w-8" />
								)}
								{(inspectionState === InspectionState.PREPARING ||
									inspectionState === InspectionState.SCANNING ||
									inspectionState === InspectionState.ANALYZING) && (
									<Loader2 className="animate-spin h-8 w-8" />
								)}
								{inspectionState === InspectionState.COMPLETE && (
									<CheckCircle2 className="h-8 w-8" />
								)}
								<h2 className="text-xl font-semibold">{getStateLabel()}</h2>
							</div>

							{(inspectionState === InspectionState.PREPARING ||
								inspectionState === InspectionState.SCANNING ||
								inspectionState === InspectionState.ANALYZING) && (
								<div className="space-y-2 mx-auto flex flex-col justify-center items-center">
									<Progress value={progress} className="h-3 max-w-md" />
									<p>{getProgressDescription(inspectionState)}</p>
								</div>
							)}

							{inspectionState === InspectionState.WAITING && (
								<div className="space-y-4">
									<p className="text-lg">
										Please insert the tube into the inspection chamber
									</p>
									<div className="flex justify-center space-x-3">
										<Badge
											variant="outline"
											className={
												tubeDetected
													? "bg-green-100 text-green-800 border-green-300"
													: ""
											}
										>
											{tubeDetected ? "Tube Detected" : "No Tube Detected"}
										</Badge>
										<Badge
											variant="outline"
											className={
												doorClosed
													? "bg-green-100 text-green-800 border-green-300"
													: ""
											}
										>
											{doorClosed ? "Door Closed" : "Door Open"}
										</Badge>
									</div>
								</div>
							)}

							{inspectionState === InspectionState.COMPLETE && (
								<div className="space-y-4">
									<p className="text-lg">
										Inspection process completed. Generating results...
									</p>
									<div className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
										<ShieldCheck className="h-4 w-4" />
										<span>Redirecting to results</span>
									</div>
								</div>
							)}
						</div>

						{inspectionState === InspectionState.WAITING && (
							<div className="border rounded-lg p-4">
								<h3 className="font-medium mb-2">Instructions:</h3>
								<ol className="list-decimal list-inside space-y-2">
									<li className="text-muted-foreground">
										Insert the bent tube into the inspection fixture
									</li>
									<li className="text-muted-foreground">
										Ensure tube is seated properly on all contact points
									</li>
									<li className="text-muted-foreground">
										Close the inspection chamber door
									</li>
									<li className="text-muted-foreground">
										Scanning will begin automatically
									</li>
								</ol>
							</div>
						)}

						{(inspectionState === InspectionState.SCANNING ||
							inspectionState === InspectionState.ANALYZING) && (
							<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
								<h3 className="flex items-center font-medium text-blue-800 mb-2">
									<ShieldCheck className="h-5 w-5 mr-2" />
									Scan Parameters
								</h3>
								<div className="grid grid-cols-2 gap-3 text-sm">
									<div>
										<p className="text-muted-foreground">Resolution</p>
										<p className="font-medium">0.025mm</p>
									</div>
									<div>
										<p className="text-muted-foreground">Tolerance</p>
										<p className="font-medium">±0.5° / ±1mm</p>
									</div>
									<div>
										<p className="text-muted-foreground">Reference</p>
										<p className="font-medium">ISO 1101</p>
									</div>
									<div>
										<p className="text-muted-foreground">Calibration</p>
										<p className="font-medium">Valid (3 days ago)</p>
									</div>
								</div>
							</div>
						)}
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							disabled={inspectionState !== InspectionState.WAITING}
							onClick={() => navigate("/dashboard")}
						>
							Back to Job Queue
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

function getInspectionStatusClass(state: InspectionState): string {
	switch (state) {
		case InspectionState.WAITING:
			return "machine-status-waiting";
		case InspectionState.PREPARING:
		case InspectionState.SCANNING:
		case InspectionState.ANALYZING:
			return "machine-status-processing";
		case InspectionState.COMPLETE:
			return "machine-status-ready";
		default:
			return "";
	}
}

function getProgressDescription(state: InspectionState): string {
	switch (state) {
		case InspectionState.PREPARING:
			return "Initializing scanner and calibrating measurement system...";
		case InspectionState.SCANNING:
			return "Scanning tube geometry, capturing bend angles and positions...";
		case InspectionState.ANALYZING:
			return "Analyzing scan data and comparing to specifications...";
		default:
			return "";
	}
}
