import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Play,
	Activity,
	CheckSquare,
	AlertTriangle,
	Settings,
	HelpCircle,
	Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useJobs } from "@/contexts/JobsContext";

export default function Sidebar() {
	const location = useLocation();
	const { activeJob } = useJobs();

	const navigation = [
		{
			name: "Job Queue",
			href: "/dashboard",
			icon: LayoutDashboard,
			current: location.pathname === "/dashboard",
		},
	];

	// Only show other navigation links if there's an active job
	if (activeJob) {
		navigation.push(
			{
				name: "Bend Setup",
				href: `/job-pending/${activeJob.id}`,
				icon: Play,
				current: location.pathname.includes("/job-pending"),
			},
			{
				name: "Bending Status",
				href: `/job-in-progress/${activeJob.id}`,
				icon: Activity,
				current: location.pathname.includes("/job-in-progress"),
			},
			{
				name: "Inspection",
				href: `/inspection-pending/${activeJob.id}`,
				icon: CheckSquare,
				current: location.pathname.includes("/inspection"),
			},
			{
				name: "Rework",
				href: `/rework/${activeJob.id}`,
				icon: AlertTriangle,
				current: location.pathname.includes("/rework"),
			},
		);
	}

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex items-center h-16 px-6 border-b">
				<Link to="/dashboard" className="flex items-center gap-2">
					<Activity className="h-6 w-6 text-accent" />
					<span className="font-semibold text-lg">AccuBender</span>
				</Link>
			</div>
			<div className="flex-1 px-3 py-4 overflow-y-auto">
				<nav className="space-y-1">
					{navigation.map((item) => (
						<Button
							key={item.name}
							variant="ghost"
							className="w-full justify-start"
							asChild
						>
							<Link
								to={item.href}
								className={cn(
									"flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
									"hover:bg-accent-soft hover:text-accent-foreground",
									item.current
										? "bg-accent text-accent-foreground"
										: "text-foreground",
								)}
							>
								<item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
								{item.name}
							</Link>
						</Button>
					))}
				</nav>

				<Separator className="my-4" />

				<div className="space-y-1">
					<Button variant="ghost" className="w-full justify-start" asChild>
						<Link to="#settings">
							<Settings className="h-5 w-5 mr-3" />
							Settings
						</Link>
					</Button>
					<Button variant="ghost" className="w-full justify-start" asChild>
						<Link to="#help">
							<HelpCircle className="h-5 w-5 mr-3" />
							Help & Support
						</Link>
					</Button>
				</div>
			</div>
			<div className="border-t p-4">
				<div className="flex items-center">
					<div className="flex-1">
						<p className="text-sm font-medium">AccuBender OS</p>
						<p className="text-xs text-muted-foreground">v2.5.0</p>
					</div>
					<Button variant="ghost" size="icon">
						<Cog className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
