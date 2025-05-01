export type JobStatus = 'queued' | 'pending' | 'in-progress' | 'inspecting' | 'completed' | 'failed';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';
export type BendType = 'standard' | 'compound' | 'offset';

export interface Bend {
  position: number;
  angle: number;
  length: number;
  type: BendType;
  modified?: boolean;
}

export interface InspectionResult {
  bendPosition: number;
  expected: number;
  actual: number;
  deviation: number;
  pass: boolean;
}

export interface Job {
  id: string;
  partNumber: string;
  customerName: string;
  material: string;
  diameter: number;
  status: JobStatus;
  priority: JobPriority;
  dueDate: string;
  bends: Bend[];
  inspectionResults?: InspectionResult[];
  reworkCount?: number;
  notes?: string;
}