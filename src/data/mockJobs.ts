import type { Job } from "@/types/job";

export const mockJobs: Job[] = [
	{
		id: "1001",
		partNumber: "TB-7834-A",
		customerName: "Aerospace Systems Inc.",
		material: "Stainless Steel 304",
		diameter: 12.7,
		status: "queued",
		priority: "urgent",
		dueDate: "2025-06-15",
		bends: [
			{ position: 1, angle: 45, length: 150, type: "standard" },
			{ position: 2, angle: 90, length: 200, type: "standard" },
			{ position: 3, angle: 30, length: 100, type: "standard" },
		],
		notes: "Critical component for aircraft hydraulic system",
	},
	{
		id: "1002",
		partNumber: "TB-6523-B",
		customerName: "AutoTech Manufacturing",
		material: "Aluminum 6061",
		diameter: 19.05,
		status: "queued",
		priority: "high",
		dueDate: "2025-06-18",
		bends: [
			{ position: 1, angle: 90, length: 300, type: "standard" },
			{ position: 2, angle: 110, length: 250, type: "standard" },
			{ position: 3, angle: -65, length: 200, type: "standard" },
			{ position: 4, angle: -45, length: 150, type: "standard" },
		],
		notes: "Coolant line for engine block",
	},
	{
		id: "1003",
		partNumber: "TB-5421-C",
		customerName: "Medical Devices Co.",
		material: "Titanium Grade 2",
		diameter: 6.35,
		status: "queued",
		priority: "normal",
		dueDate: "2025-06-22",
		bends: [
			{ position: 1, angle: 30, length: 50, type: "standard" },
			{ position: 2, angle: 45, length: 75, type: "compound" },
			{ position: 3, angle: 60, length: 50, type: "standard" },
			{ position: 4, angle: 30, length: 25, type: "offset" },
			{ position: 5, angle: 45, length: 50, type: "standard" },
		],
		notes: "Precision required for medical equipment",
	},
	{
		id: "1004",
		partNumber: "TB-4329-D",
		customerName: "Energy Solutions Ltd.",
		material: "Copper",
		diameter: 15.88,
		status: "queued",
		priority: "normal",
		dueDate: "2025-06-25",
		bends: [
			{ position: 1, angle: 90, length: 200, type: "standard" },
			{ position: 2, angle: 45, length: 150, type: "standard" },
			{ position: 3, angle: 180, length: 300, type: "compound" },
		],
		notes: "Heat exchanger component",
	},
	{
		id: "1005",
		partNumber: "TB-3218-E",
		customerName: "Construction Equipment Inc.",
		material: "Steel ASTM A36",
		diameter: 25.4,
		status: "queued",
		priority: "low",
		dueDate: "2025-06-30",
		bends: [
			{ position: 1, angle: 90, length: 500, type: "standard" },
			{ position: 2, angle: 45, length: 350, type: "standard" },
		],
		notes: "Hydraulic line for excavator arm",
	},
	{
		id: "1006",
		partNumber: "TB-2107-F",
		customerName: "Naval Systems Corp.",
		material: "Inconel 625",
		diameter: 22.23,
		status: "queued",
		priority: "high",
		dueDate: "2025-06-20",
		bends: [
			{ position: 1, angle: 30, length: 200, type: "standard" },
			{ position: 2, angle: 60, length: 250, type: "standard" },
			{ position: 3, angle: 45, length: 150, type: "compound" },
			{ position: 4, angle: 90, length: 300, type: "standard" },
			{ position: 5, angle: 30, length: 200, type: "offset" },
		],
		notes: "Corrosion resistant for marine application",
	},
];

// Mock inspection results for failed inspection scenario
export const mockFailedInspection = {
	bendPosition: 2,
	expected: 90,
	actual: 93.5,
	deviation: 3.5,
	pass: false,
};

// Mock rework suggestions based on ML
/**
 * Generate fake AI rework suggestions based on material, diameter, and failed bends.
 */
export function generateMockReworkSuggestions(
	material: string,
	diameter: number,
	failedResults: {
		bendPosition: number;
		expected: number;
		actual: number;
		deviation: number;
		pass: boolean;
	}[],
): { adjustments: Record<string, number>; rationale: string } {
	const adjustments: Record<string, number> = {};

	// Pick a base adjustment by material
	const baseAdjustment = material.toLowerCase().includes("stainless steel")
		? -3.5
		: material.toLowerCase().includes("aluminum")
			? -2.0
			: material.toLowerCase().includes("titanium")
				? -1.5
				: material.toLowerCase().includes("copper")
					? -2.5
					: -3.0;

	// Normalize by diameter (using 12.7 mm as a reference)
	for (const result of failedResults) {
		const factor = 12.7 / diameter;
		adjustments[`bend-${result.bendPosition}`] = Number.parseFloat(
			(baseAdjustment * factor).toFixed(1),
		);
	}

	const rationale = `Based on historical data, ${material} tubes around ${diameter} mm tend to overbend; adjustments have been scaled accordingly.`;

	return { adjustments, rationale };
}
