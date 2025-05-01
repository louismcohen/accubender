import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { JobsProvider } from "@/contexts/JobsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import JobPending from "@/pages/JobPending";
import JobInProgress from "@/pages/JobInProgress";
import InspectionPending from "@/pages/InspectionPending";
import InspectionResults from "@/pages/InspectionResults";
import ReworkJob from "@/pages/ReworkJob";

function App() {
	const navigate = useNavigate();
	const location = useLocation();

	// Redirect to dashboard if at root path
	useEffect(() => {
		if (location.pathname === "/") {
			navigate("/dashboard");
		}
	}, [location, navigate]);

	return (
		<ThemeProvider>
			<JobsProvider>
				<Layout>
					<Routes>
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/job-pending/:jobId" element={<JobPending />} />
						<Route path="/job-in-progress/:jobId" element={<JobInProgress />} />
						<Route
							path="/inspection-pending/:jobId"
							element={<InspectionPending />}
						/>
						<Route
							path="/inspection-results/:jobId"
							element={<InspectionResults />}
						/>
						<Route path="/rework/:jobId" element={<ReworkJob />} />
					</Routes>
				</Layout>
				{/* <Toaster /> */}
			</JobsProvider>
		</ThemeProvider>
	);
}

export default App;
