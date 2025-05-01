import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
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

enum MachineState {
	CONNECTING = "connecting",
	LOADING = "loading",
	READY = "ready",
	ERROR = "error",
}

export default function JobPending() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { jobs, updateJobStatus } = useJobs();
	const { toast } = useToast();

	const [machineState, setMachineState] = useState<MachineState>(
		MachineState.CONNECTING,
	);
	const [progress, setProgress] = useState(0);
	const [tubeDetected, setTubeDetected] = useState(false);
	// Add a ref to track if navigation has been triggered
	const navigationInitiated = useRef(false);

	const job = jobs.find((j) => j.id === jobId);

	// Simulate machine connection and preparation
	useEffect(() => {
		if (!job) return;

		let timer: NodeJS.Timeout;

		if (machineState === MachineState.CONNECTING) {
			// Simulate connecting to machine
			setProgress(0);
			timer = setInterval(() => {
				setProgress((prev) => {
					const newProgress = prev + 10;
					if (newProgress >= 100) {
						clearInterval(timer);
						setMachineState(MachineState.LOADING);
						return 100;
					}
					return newProgress;
				});
			}, 250);
		} else if (machineState === MachineState.LOADING) {
			// Simulate loading bend file to machine
			setProgress(0);
			timer = setInterval(() => {
				setProgress((prev) => {
					const newProgress = prev + 15;
					if (newProgress >= 100) {
						clearInterval(timer);
						setMachineState(MachineState.READY);
						return 100;
					}
					return newProgress;
				});
			}, 300);
		} else if (machineState === MachineState.READY && tubeDetected && !navigationInitiated.current) {
			// Set the navigation flag to prevent multiple navigations
			navigationInitiated.current = true;
			
			// Simulate tube detection and start bending
			toast({
				title: "Tube Detected",
				description: "Starting bending process...",
			});

			updateJobStatus(job.id, "in-progress");
			timer = setTimeout(() => {
				navigate(`/job-in-progress/${job.id}`);
			}, 1500);
		}

		return () => {
			// Only clear timers if navigation hasn't been initiated
			if (!navigationInitiated.current) {
				clearInterval(timer);
				clearTimeout(timer);
			}
		};
	}, [job, machineState, tubeDetected, navigate, updateJobStatus, toast]);

	// Simulate tube detection after machine is ready
	useEffect(() => {
		if (machineState === MachineState.READY && !tubeDetected) {
			const timer = setTimeout(() => {
				setTubeDetected(true);
			}, 3000);

			return () => {
				// Only clean up if navigation hasn't started
				if (!navigationInitiated.current) {
					clearTimeout(timer);
				}
			};
		}
	}, [machineState, tubeDetected]);

	if (!job) {
		return <div>Job not found</div>;
	}

	const handleRetry = () => {
		setMachineState(MachineState.CONNECTING);
		setProgress(0);
		// Reset navigation flag on retry
		navigationInitiated.current = false;
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<div className="lg:col-span-3 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Machine Status</CardTitle>
						<CardDescription>
							Machine is being prepared for bending operation
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div
							className={`p-6 rounded-lg border-2 text-center ${getMachineStatusClass(machineState)}`}
						>
							<div className="flex justify-center items-center space-x-3 mb-4">
								{machineState === MachineState.CONNECTING && (
									<Loader2 className="animate-spin h-8 w-8" />
								)}
								{machineState === MachineState.LOADING && (
									<Loader2 className="animate-spin h-8 w-8" />
								)}
								{machineState === MachineState.READY && (
									<CheckCircle2 className="h-8 w-8" />
								)}
								{machineState === MachineState.ERROR && (
									<AlertCircle className="h-8 w-8" />
								)}
								<h2 className="text-xl font-semibold">
									{getMachineStatusText(machineState)}
								</h2>
							</div>

							{(machineState === MachineState.CONNECTING ||
								machineState === MachineState.LOADING) && (
								<div className="space-y-2 max-w-md mx-auto">
									<Progress value={progress} />
									<p>
										{machineState === MachineState.CONNECTING
											? "Connecting to bending machine..."
											: "Loading bend specifications..."}
									</p>
								</div>
							)}

							{machineState === MachineState.READY && (
								<div className="space-y-4">
									<p className="text-lg">
										Machine is ready and waiting for tube insertion
									</p>
									<div className="flex justify-center space-x-2">
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
												tubeDetected
													? "bg-green-100 text-green-800 border-green-300"
													: ""
											}
										>
											{tubeDetected ? "Clamps Engaged" : "Clamps Open"}
										</Badge>
									</div>
								</div>
							)}

							{machineState === MachineState.ERROR && (
								<div className="space-y-4">
									<p>
										Failed to connect to bending machine. Please check machine
										power and network connection.
									</p>
									<Button onClick={handleRetry} className="mx-auto">
										<RotateCcw className="mr-2 h-4 w-4" />
										Retry Connection
									</Button>
								</div>
							)}
						</div>

						{machineState === MachineState.READY && (
							<div className="border rounded-lg p-4">
								<h3 className="font-medium mb-2">Next Steps:</h3>
								<ol className="list-decimal list-inside space-y-2">
									<li className="text-muted-foreground">
										Insert the {job.material} tube (diameter: {job.diameter}mm)
										into the machine
									</li>
									<li className="text-muted-foreground">
										Ensure tube is properly aligned with markers
									</li>
									<li className="text-muted-foreground">
										Bending will begin automatically once tube is detected and
										secured
									</li>
								</ol>
							</div>
						)}
					</CardContent>
					<CardFooter>
						<Button variant="outline" onClick={() => navigate("/dashboard")}>
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

function getMachineStatusClass(state: MachineState): string {
	switch (state) {
		case MachineState.CONNECTING:
			return "machine-status-waiting";
		case MachineState.LOADING:
			return "machine-status-waiting";
		case MachineState.READY:
			return "machine-status-ready";
		case MachineState.ERROR:
			return "machine-status-error";
		default:
			return "";
	}
}

function getMachineStatusText(state: MachineState): string {
	switch (state) {
		case MachineState.CONNECTING:
			return "Connecting to Machine";
		case MachineState.LOADING:
			return "Loading Bend File";
		case MachineState.READY:
			return "Ready for Tube";
		case MachineState.ERROR:
			return "Connection Error";
		default:
			return "";
	}
}
